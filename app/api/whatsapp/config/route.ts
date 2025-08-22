
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createConfigSchema = z.object({
  clinicName: z.string().min(1, "El nombre de la clínica es requerido"),
});

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const config = await prisma.whatsAppConfig.findFirst();
    
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error obteniendo configuración WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { clinicName } = createConfigSchema.parse(body);

    // Generar instanceName único
    const timestamp = Date.now();
    const instanceName = `${clinicName.replace(/\s+/g, '-')}-${timestamp}`;

    // Crear la instancia en Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_BASE_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    const response = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey!,
      },
      body: JSON.stringify({
        instanceName,
        integration: "WHATSAPP-BUSINESS",
        qrcode: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de API Evolution: ${response.statusText}`);
    }

    const data = await response.json();

    // Guardar configuración en base de datos
    const config = await prisma.whatsAppConfig.upsert({
      where: { instanceName },
      update: {
        connectionStatus: 'CONNECTING',
        qrCode: data.qrcode?.base64,
      },
      create: {
        instanceName,
        connectionStatus: 'CONNECTING',
        qrCode: data.qrcode?.base64,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error creando configuración WhatsApp:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const config = await prisma.whatsAppConfig.findFirst();
    if (!config) {
      return NextResponse.json({ error: "No hay configuración para eliminar" }, { status: 404 });
    }

    // Eliminar instancia de Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_BASE_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    try {
      await fetch(`${evolutionApiUrl}/instance/delete/${config.instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': evolutionApiKey!,
        },
      });
    } catch (apiError) {
      console.error("Error eliminando instancia de Evolution API:", apiError);
      // Continuamos con la eliminación local aunque la API falle
    }

    // Eliminar configuración de base de datos
    await prisma.whatsAppConfig.delete({
      where: { id: config.id }
    });

    return NextResponse.json({ message: "Configuración eliminada exitosamente" });
  } catch (error) {
    console.error("Error eliminando configuración WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
