
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";

export async function POST() {
  try {
    // Verificar si hay configuración activa de WhatsApp
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isConnected: true },
    });

    if (!config) {
      return NextResponse.json(
        { error: "WhatsApp no está configurado o conectado" },
        { status: 400 }
      );
    }

    // Obtener la fecha de mañana
    const tomorrow = addDays(new Date(), 1);
    const startOfDay = new Date(tomorrow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(tomorrow);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener citas para mañana
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
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

    let processed = 0;
    let sent = 0;
    let errors: string[] = [];

    for (const appointment of appointments) {
      processed++;

      // Verificar que el paciente tenga teléfono
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

      // Enviar mensaje a través de Evolution API
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
          sent++;
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

      // Pequeña pausa entre mensajes para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      processed,
      sent,
      totalAppointments: appointments.length,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en cron de recordatorios WhatsApp:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar el status del cron
export async function GET() {
  try {
    // Obtener estadísticas básicas
    const totalMessages = await prisma.whatsAppMessage.count();
    const todayMessages = await prisma.whatsAppMessage.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const config = await prisma.whatsAppConfig.findFirst();

    return NextResponse.json({
      status: "active",
      timestamp: new Date().toISOString(),
      stats: {
        totalMessages,
        todayMessages,
        isConnected: config?.isConnected || false,
        lastConnection: config?.lastConnectionAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Error obteniendo estadísticas",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
