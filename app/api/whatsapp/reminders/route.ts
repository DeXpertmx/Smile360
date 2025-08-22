
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addHours, format } from "date-fns";
import { es } from "date-fns/locale";

export async function POST() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener configuración de WhatsApp
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isConnected: true },
    });

    if (!config) {
      return NextResponse.json(
        { error: "WhatsApp no está configurado o conectado" },
        { status: 400 }
      );
    }

    // Obtener citas para mañana (24 horas antes)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: tomorrow,
          lte: endOfTomorrow,
        },
        status: "Programada",
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    let sentCount = 0;
    let errors: string[] = [];

    for (const appointment of appointments) {
      if (!appointment.patient.phone) {
        errors.push(`Paciente ${appointment.patient.firstName} ${appointment.patient.lastName} no tiene teléfono`);
        continue;
      }

      // Verificar si ya se envió recordatorio
      const existingReminder = await prisma.whatsAppMessage.findFirst({
        where: {
          appointmentId: appointment.id,
          messageType: "REMINDER",
          status: { in: ["SENT", "DELIVERED", "READ"] },
        },
      });

      if (existingReminder) {
        continue; // Ya se envió recordatorio
      }

      // Generar mensaje personalizado
      const appointmentDate = format(appointment.date, "EEEE dd 'de' MMMM", { locale: es });
      const doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
      
      const message = `¡Hola ${appointment.patient.firstName}! 👋

Te recordamos tu cita médica programada para mañana:

📅 Fecha: ${appointmentDate}
⏰ Hora: ${appointment.startTime}
👨‍⚕️ Doctor: ${doctorName}
🏥 Tipo: ${appointment.type}

Por favor confirma tu asistencia o comunícate con nosotros si necesitas reagendar.

¡Te esperamos! 😊

SmileSys - Clínica Dental`;

      // Crear registro del mensaje
      const whatsappMessage = await prisma.whatsAppMessage.create({
        data: {
          instanceName: config.instanceName,
          patientId: appointment.patient.id,
          appointmentId: appointment.id,
          messageType: "REMINDER",
          phoneNumber: appointment.patient.phone.replace(/\D/g, ""),
          message,
          status: "PENDING",
        },
      });

      // Enviar mensaje
      const evolutionApiUrl = process.env.EVOLUTION_API_BASE_URL;
      const evolutionApiKey = process.env.EVOLUTION_API_KEY;

      try {
        const response = await fetch(`${evolutionApiUrl}/message/sendText/${config.instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey!,
          },
          body: JSON.stringify({
            number: appointment.patient.phone.replace(/\D/g, ""),
            text: message,
          }),
        });

        if (response.ok) {
          await prisma.whatsAppMessage.update({
            where: { id: whatsappMessage.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
            },
          });
          sentCount++;
        } else {
          const errorData = await response.text();
          await prisma.whatsAppMessage.update({
            where: { id: whatsappMessage.id },
            data: {
              status: "FAILED",
              error: `Error API: ${response.status} - ${errorData}`,
            },
          });
          errors.push(`Error enviando a ${appointment.patient.firstName}: ${errorData}`);
        }
      } catch (apiError) {
        await prisma.whatsAppMessage.update({
          where: { id: whatsappMessage.id },
          data: {
            status: "FAILED",
            error: apiError instanceof Error ? apiError.message : "Error desconocido",
          },
        });
        errors.push(`Error enviando a ${appointment.patient.firstName}: ${apiError}`);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalAppointments: appointments.length,
      errors,
    });
  } catch (error) {
    console.error("Error enviando recordatorios WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
