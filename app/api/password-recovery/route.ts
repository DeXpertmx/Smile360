
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, generatePasswordResetTemplate } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando solicitud de recuperación de contraseña...');
    
    const { email } = await request.json();

    if (!email) {
      console.log('❌ Email no proporcionado');
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log('📧 Buscando paciente con email:', email.toLowerCase());

    // Buscar el paciente por email
    const patient = await prisma.patient.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'Activo',
        hasPortalAccess: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        firstLoginCompleted: true
      }
    });

    if (!patient) {
      console.log('❌ Paciente no encontrado con email:', email);
      return NextResponse.json(
        { error: 'No encontramos una cuenta activa con este email. Verifica que el email sea correcto.' },
        { status: 404 }
      );
    }

    console.log('✅ Paciente encontrado:', patient.id, `${patient.firstName} ${patient.lastName}`);

    if (!patient.firstLoginCompleted) {
      console.log('❌ Paciente no ha completado configuración inicial');
      return NextResponse.json(
        { error: 'Debes completar primero la configuración inicial de tu cuenta.' },
        { status: 400 }
      );
    }

    // Generar token seguro de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hora de expiración

    console.log('🔐 Token de recuperación generado para paciente:', patient.id);

    // Guardar el token en la base de datos
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date()
      }
    });

    console.log('💾 Token guardado en base de datos');

    // Generar URL de recuperación
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/portal/reset-password?token=${resetToken}`;
    
    console.log('🔗 URL de recuperación generada:', resetUrl);

    // Generar template del email
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const emailTemplate = generatePasswordResetTemplate(
      patientName,
      resetUrl,
      'SmileSys'
    );

    console.log('📧 Enviando email de recuperación a:', patient.email);

    // Enviar email de recuperación
    const emailResult = await sendEmail({
      to: patient.email!,
      subject: 'Recuperar Contraseña - SmileSys Portal de Pacientes',
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (!emailResult.success) {
      console.error('❌ Error enviando email:', emailResult.error);
      return NextResponse.json(
        { error: 'Error al enviar el email. Verifica tu conexión e intenta nuevamente.' },
        { status: 500 }
      );
    }

    console.log('✅ Email de recuperación enviado exitosamente, messageId:', emailResult.messageId);

    return NextResponse.json({ 
      message: 'Email de recuperación enviado exitosamente',
      emailSent: true,
      email: patient.email,
      expiresAt: resetTokenExpiry.toISOString()
    });

  } catch (error) {
    console.error('❌ Error crítico en forgot-password:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return NextResponse.json(
      { 
        error: 'Error interno del servidor. Intenta nuevamente en unos momentos.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Error desconocido') : undefined
      },
      { status: 500 }
    );
  }
}
