
import { prisma } from '@/lib/prisma';
import { sendEmail, generatePatientInvitationTemplate } from './email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

interface CreateInvitationParams {
  patientId: string;
  patientName: string;
  patientEmail: string;
  clinicName?: string;
}

export async function createPatientInvitation({
  patientId,
  patientName,
  patientEmail,
  clinicName = 'SmileSys'
}: CreateInvitationParams) {
  try {
    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración (48 horas)
    const expires = new Date();
    expires.setHours(expires.getHours() + 48);
    
    // Eliminar invitación existente si la hay
    await prisma.patientInvitation.deleteMany({
      where: { patientId }
    });
    
    // Crear nueva invitación
    const invitation = await prisma.patientInvitation.create({
      data: {
        patientId,
        token,
        expires,
      }
    });
    
    // Generar URL de invitación
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const invitationUrl = `${baseUrl}/portal/setup?token=${token}`;
    
    // Generar template del email
    const emailTemplate = generatePatientInvitationTemplate(
      patientName,
      invitationUrl,
      clinicName
    );
    
    // Enviar email
    const emailResult = await sendEmail({
      to: patientEmail,
      subject: `Acceso al Portal de Pacientes - ${clinicName}`,
      html: emailTemplate.html,
      text: emailTemplate.text
    });
    
    if (emailResult.success) {
      // Actualizar paciente como invitado
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          invitationSent: true,
          invitationSentAt: new Date(),
          hasPortalAccess: true
        }
      });
    }
    
    return {
      success: emailResult.success,
      invitation,
      invitationUrl,
      emailResult
    };
    
  } catch (error) {
    console.error('Error creando invitación:', error);
    return {
      success: false,
      error
    };
  }
}

export async function validateInvitationToken(token: string) {
  try {
    const invitation = await prisma.patientInvitation.findUnique({
      where: { token },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            firstLoginCompleted: true
          }
        }
      }
    });
    
    if (!invitation) {
      return { valid: false, error: 'Token de invitación no encontrado' };
    }
    
    if (invitation.isUsed) {
      return { valid: false, error: 'Esta invitación ya fue utilizada' };
    }
    
    if (new Date() > invitation.expires) {
      return { valid: false, error: 'La invitación ha expirado' };
    }
    
    if (invitation.patient.firstLoginCompleted) {
      return { valid: false, error: 'El paciente ya configuró su acceso' };
    }
    
    return {
      valid: true,
      invitation,
      patient: invitation.patient
    };
    
  } catch (error) {
    console.error('Error validando token:', error);
    return { valid: false, error: 'Error interno del servidor' };
  }
}

export async function completePatientSetup(
  token: string, 
  password: string
) {
  try {
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }
    
    const { invitation, patient } = validation;
    
    if (!invitation || !patient) {
      return {
        success: false,
        error: 'Datos de invitación inválidos'
      };
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Actualizar paciente con la contraseña y marcar como completado
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        portalPassword: hashedPassword,
        firstLoginCompleted: true
      }
    });
    
    // Marcar invitación como usada
    await prisma.patientInvitation.update({
      where: { id: invitation.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    });
    
    return {
      success: true,
      patient
    };
    
  } catch (error) {
    console.error('Error completando setup:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

export async function authenticatePatient(email: string, password: string) {
  try {
    const patient = await prisma.patient.findFirst({
      where: { 
        email,
        firstLoginCompleted: true,
        hasPortalAccess: true,
        status: 'Activo'
      }
    });
    
    if (!patient || !patient.portalPassword) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    
    const isPasswordValid = await bcrypt.compare(password, patient.portalPassword);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    
    return {
      success: true,
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        numeroExpediente: patient.numeroExpediente
      }
    };
    
  } catch (error) {
    console.error('Error autenticando paciente:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}
