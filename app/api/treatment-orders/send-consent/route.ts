
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { orderId, patientEmail, patientName, procedureType, orderNumber } = await request.json();

    if (!orderId || !patientEmail) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    // Verificar que la orden existe
    const order = await prisma.treatmentOrder.findUnique({
      where: { id: orderId },
      include: {
        patient: true,
        doctor: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Aquí implementarías el envío del email
    // Por ahora simularemos el envío exitoso
    console.log(`Enviando consentimiento informado a: ${patientEmail}`);
    console.log(`Orden: ${orderNumber}`);
    console.log(`Procedimiento: ${procedureType}`);
    console.log(`Paciente: ${patientName}`);

    // En una implementación real, aquí llamarías a tu servicio de email
    // como SendGrid, Amazon SES, etc.
    const emailContent = {
      to: patientEmail,
      subject: `Consentimiento Informado - Orden ${orderNumber}`,
      body: `
        Estimado/a ${patientName},

        Le enviamos el consentimiento informado para el tratamiento: ${procedureType}
        Orden número: ${orderNumber}

        Por favor, revise el documento adjunto y proceda con la firma digital a través del portal del paciente.

        Link del portal: ${process.env.NEXTAUTH_URL}/portal

        Gracias,
        ${order.doctor.firstName} ${order.doctor.lastName}
        Smile360
      `
    };

    // Aquí normalmente enviarías el email usando tu proveedor de correo
    // await sendEmail(emailContent);

    // Por ahora solo loguearemos el envío
    console.log('Email enviado exitosamente (simulado)');

    return NextResponse.json({ 
      success: true, 
      message: 'Consentimiento informado enviado por email' 
    });

  } catch (error) {
    console.error('Error enviando consentimiento por email:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
