
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaultTemplates = [
  {
    name: "Recordatorio de Cita",
    type: "REMINDER",
    message: `¡Hola {nombre}! 👋

Te recordamos tu cita médica:

📅 Fecha: {fecha}
⏰ Hora: {hora}
👨‍⚕️ Doctor: {doctor}
🏥 Tipo: {tipo_cita}

Por favor confirma tu asistencia o comunícate con nosotros si necesitas reagendar.

¡Te esperamos! 😊

SmileSys - Clínica Dental`,
    variables: ["nombre", "fecha", "hora", "doctor", "tipo_cita"]
  },
  {
    name: "Confirmación de Cita",
    type: "NOTIFICATION",
    message: `Hola {nombre},

Tu cita ha sido confirmada exitosamente:

📅 Fecha: {fecha}
⏰ Hora: {hora}
👨‍⚕️ Doctor: {doctor}
📍 Ubicación: {direccion_clinica}

Si necesitas hacer algún cambio, contáctanos al {telefono_clinica}.

Gracias por confiar en nosotros.

SmileSys - Tu sonrisa es nuestra prioridad`,
    variables: ["nombre", "fecha", "hora", "doctor", "direccion_clinica", "telefono_clinica"]
  },
  {
    name: "Promoción General",
    type: "PROMOTION",
    message: `¡Hola {nombre}! ✨

Tenemos una promoción especial para ti:

🦷 {descripcion_promocion}
💰 Descuento: {descuento}
⏰ Válida hasta: {fecha_limite}

¡No te la pierdas! Agenda tu cita llamando al {telefono_clinica} o a través de nuestro portal web.

SmileSys - Tu sonrisa es nuestra prioridad 🌟`,
    variables: ["nombre", "descripcion_promocion", "descuento", "fecha_limite", "telefono_clinica"]
  },
  {
    name: "Cita Reagendada",
    type: "NOTIFICATION",
    message: `Hola {nombre},

Te informamos que tu cita ha sido reagendada:

❌ Fecha anterior: {fecha_anterior}
✅ Nueva fecha: {fecha_nueva}
⏰ Hora: {hora}
👨‍⚕️ Doctor: {doctor}

Disculpa las molestias. Si tienes alguna pregunta, contáctanos.

Gracias por tu comprensión.

SmileSys`,
    variables: ["nombre", "fecha_anterior", "fecha_nueva", "hora", "doctor"]
  },
  {
    name: "Cita Cancelada",
    type: "NOTIFICATION", 
    message: `Hola {nombre},

Lamentamos informarte que tu cita programada para el {fecha} a las {hora} ha sido cancelada.

Motivo: {motivo}

Para reagendar tu cita, por favor contáctanos al {telefono_clinica} o a través de nuestro portal web.

Disculpa las molestias.

SmileSys`,
    variables: ["nombre", "fecha", "hora", "motivo", "telefono_clinica"]
  },
  {
    name: "Post-Tratamiento",
    type: "NOTIFICATION",
    message: `Hola {nombre},

Esperamos que te encuentres bien después de tu tratamiento de {tratamiento} de hoy.

🦷 Recomendaciones post-tratamiento:
{recomendaciones}

Si tienes molestias persistentes o dudas, no dudes en contactarnos al {telefono_clinica}.

¡Cuida tu sonrisa! 😊

SmileSys - Cuidando tu salud dental`,
    variables: ["nombre", "tratamiento", "recomendaciones", "telefono_clinica"]
  }
];

export async function POST() {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let created = 0;
    let skipped = 0;

    for (const template of defaultTemplates) {
      const existing = await prisma.whatsAppTemplate.findFirst({
        where: {
          name: template.name,
          type: template.type,
        },
      });

      if (!existing) {
        await prisma.whatsAppTemplate.create({
          data: {
            name: template.name,
            type: template.type,
            message: template.message,
            variables: template.variables,
          },
        });
        created++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      message: "Plantillas inicializadas",
      created,
      skipped,
      total: defaultTemplates.length,
    });
  } catch (error) {
    console.error("Error inicializando plantillas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
