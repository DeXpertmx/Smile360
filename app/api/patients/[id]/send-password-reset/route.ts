
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, generatePasswordResetTemplate } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const { email } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID de paciente requerido' }, { status: 400 });
    }

    // Verificar que el paciente existe y que el email coincide
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        hasPortalAccess: true,
        firstLoginCompleted: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    if (patient.status !== 'Activo') {
      return NextResponse.json(
        { error: 'El paciente debe estar activo para recuperar contraseña' },
        { status: 400 }
      );
    }

    if (!patient.hasPortalAccess) {
      return NextResponse.json(
        { error: 'El paciente no tiene acceso al portal' },
        { status: 400 }
      );
    }

    if (!patient.firstLoginCompleted) {
      return NextResponse.json(
        { error: 'El paciente debe completar primero su configuración inicial' },
        { status: 400 }
      );
    }

    if (!patient.email || patient.email !== email) {
      return NextResponse.json(
        { error: 'El email no coincide con el registrado para este paciente' },
        { status: 400 }
      );
    }

    // Generar token seguro de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración (1 hora)
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
    
    // Guardar el token en la base de datos
    await prisma.patient.update({
      where: { id },
      data: {
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date()
      }
    });
    
    // Generar URL de recuperación
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/portal/reset-password?token=${resetToken}`;
    
    // Generar template del email
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const emailTemplate = generatePasswordResetTemplate(
      patientName,
      resetUrl,
      'SmileSys'
    );
    
    // Enviar email de recuperación
    const emailResult = await sendEmail({
      to: patient.email!,
      subject: 'Recuperar Contraseña - SmileSys Portal de Pacientes',
      html: emailTemplate.html,
      text: emailTemplate.text
    });
    
    if (!emailResult.success) {
      console.error('Error enviando email de recuperación:', emailResult.error);
      return NextResponse.json(
        { error: 'Error al enviar el email de recuperación. Verifica la configuración SMTP.' },
        { status: 500 }
      );
    }
    
    console.log('Email de recuperación enviado exitosamente:', emailResult.messageId);
    
    return NextResponse.json({ 
      message: 'Email de recuperación enviado exitosamente',
      emailSent: true,
      expiresAt: resetTokenExpiry.toISOString()
    });

  } catch (error) {
    console.error('Error al procesar solicitud de recuperación:', error);
    
    // Log más detallado para debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
