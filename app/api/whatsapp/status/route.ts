
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const config = await prisma.whatsAppConfig.findFirst();
    if (!config) {
      return NextResponse.json({ status: "NOT_CONFIGURED" });
    }

    // Obtener estado de la instancia desde Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_BASE_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    try {
      const response = await fetch(`${evolutionApiUrl}/instance/connectionState/${config.instanceName}`, {
        headers: {
          'apikey': evolutionApiKey!,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar estado en base de datos
        const updatedConfig = await prisma.whatsAppConfig.update({
          where: { id: config.id },
          data: {
            connectionStatus: data.instance?.state || config.connectionStatus,
            isConnected: data.instance?.state === 'open',
            phoneNumber: data.instance?.profilePicUrl ? config.phoneNumber : null,
            lastConnectionAt: data.instance?.state === 'open' ? new Date() : config.lastConnectionAt,
          },
        });

        return NextResponse.json({
          status: updatedConfig.connectionStatus,
          isConnected: updatedConfig.isConnected,
          phoneNumber: updatedConfig.phoneNumber,
          qrCode: updatedConfig.qrCode,
        });
      }
    } catch (apiError) {
      console.error("Error consultando estado de Evolution API:", apiError);
    }

    return NextResponse.json({
      status: config.connectionStatus,
      isConnected: config.isConnected,
      phoneNumber: config.phoneNumber,
      qrCode: config.qrCode,
    });
  } catch (error) {
    console.error("Error obteniendo estado WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
