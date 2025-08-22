
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendMessageSchema = z.object({
  phoneNumber: z.string().min(1, "Número de teléfono es requerido"),
  message: z.string().min(1, "Mensaje es requerido"),
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  messageType: z.enum(["REMINDER", "NOTIFICATION", "PROMOTION", "MANUAL"]).default("MANUAL"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const messages = await prisma.whatsAppMessage.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        appointment: {
          select: {
            date: true,
            startTime: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.whatsAppMessage.count({ where });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo mensajes WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, message, patientId, appointmentId, messageType } = 
      sendMessageSchema.parse(body);

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

    // Crear registro del mensaje en base de datos
    const whatsappMessage = await prisma.whatsAppMessage.create({
      data: {
        instanceName: config.instanceName,
        patientId,
        appointmentId,
        messageType,
        phoneNumber: phoneNumber.replace(/\D/g, ""), // Solo números
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
          number: phoneNumber.replace(/\D/g, ""),
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

        return NextResponse.json({
          success: true,
          messageId: whatsappMessage.id,
          message: "Mensaje enviado exitosamente",
        });
      } else {
        const errorData = await response.text();
        await prisma.whatsAppMessage.update({
          where: { id: whatsappMessage.id },
          data: {
            status: "FAILED",
            error: `Error API: ${response.status} - ${errorData}`,
          },
        });

        return NextResponse.json(
          { error: "Error enviando mensaje" },
          { status: 400 }
        );
      }
    } catch (apiError) {
      await prisma.whatsAppMessage.update({
        where: { id: whatsappMessage.id },
        data: {
          status: "FAILED",
          error: apiError instanceof Error ? apiError.message : "Error desconocido",
        },
      });

      return NextResponse.json(
        { error: "Error de conexión con la API de WhatsApp" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error enviando mensaje WhatsApp:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
