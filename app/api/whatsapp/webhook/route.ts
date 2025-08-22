
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log del webhook para debugging
    console.log("WhatsApp Webhook received:", JSON.stringify(body, null, 2));

    // Verificar si es una actualización de estado de mensaje
    if (body.event === "messages.upsert" && body.data?.length > 0) {
      const message = body.data[0];
      
      if (message.key?.id) {
        // Buscar el mensaje en nuestra base de datos
        const whatsappMessage = await prisma.whatsAppMessage.findFirst({
          where: {
            // Aquí necesitarías almacenar el messageId de Evolution API
            // Por ahora usaremos el teléfono y un rango de tiempo
            phoneNumber: message.key.remoteJid?.replace("@s.whatsapp.net", ""),
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Últimos 5 minutos
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (whatsappMessage) {
          let updateData: any = {};

          // Actualizar estado según el tipo de mensaje
          if (message.messageStubType === 0) {
            updateData.status = "DELIVERED";
            updateData.deliveredAt = new Date();
          } else if (message.messageStubType === 1) {
            updateData.status = "READ";
            updateData.readAt = new Date();
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.whatsAppMessage.update({
              where: { id: whatsappMessage.id },
              data: updateData,
            });
          }
        }
      }
    }

    // Verificar si es una actualización de estado de conexión
    if (body.event === "connection.update") {
      const instanceName = body.instance;
      const state = body.data?.state;

      if (instanceName && state) {
        await prisma.whatsAppConfig.updateMany({
          where: { instanceName },
          data: {
            connectionStatus: state,
            isConnected: state === "open",
            lastConnectionAt: state === "open" ? new Date() : undefined,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error procesando webhook de WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Método GET para verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    timestamp: new Date().toISOString(),
    message: "WhatsApp webhook endpoint is working"
  });
}
