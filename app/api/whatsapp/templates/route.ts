
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  type: z.enum(["REMINDER", "NOTIFICATION", "PROMOTION"]),
  message: z.string().min(1, "Mensaje es requerido"),
  variables: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const templates = await prisma.whatsAppTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error obteniendo plantillas WhatsApp:", error);
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
    const { name, type, message, variables } = templateSchema.parse(body);

    const template = await prisma.whatsAppTemplate.create({
      data: {
        name,
        type,
        message,
        variables: variables || [],
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creando plantilla WhatsApp:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
