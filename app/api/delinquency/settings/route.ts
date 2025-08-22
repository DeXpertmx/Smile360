
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let settings = await prisma.delinquencySettings.findFirst();
    
    if (!settings) {
      // Crear configuración por defecto si no existe
      settings = await prisma.delinquencySettings.create({
        data: {}
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching delinquency settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado - Se requieren permisos de administrador' }, { status: 401 });
    }

    const data = await request.json();
    
    // Buscar configuración existente o crear una nueva
    let settings = await prisma.delinquencySettings.findFirst();
    
    if (settings) {
      // Actualizar configuración existente
      settings = await prisma.delinquencySettings.update({
        where: { id: settings.id },
        data: {
          reminderDaysBefore: data.reminderDaysBefore ? parseInt(data.reminderDaysBefore.toString()) : undefined,
          firstNoticeDays: data.firstNoticeDays ? parseInt(data.firstNoticeDays.toString()) : undefined,
          secondNoticeDays: data.secondNoticeDays ? parseInt(data.secondNoticeDays.toString()) : undefined,
          finalNoticeDays: data.finalNoticeDays ? parseInt(data.finalNoticeDays.toString()) : undefined,
          legalNoticeDays: data.legalNoticeDays ? parseInt(data.legalNoticeDays.toString()) : undefined,
          enableLateFees: data.enableLateFees !== undefined ? data.enableLateFees : undefined,
          lateFeeType: data.lateFeeType,
          lateFeeAmount: data.lateFeeAmount ? parseFloat(data.lateFeeAmount.toString()) : undefined,
          lateFeeFrequency: data.lateFeeFrequency,
          autoSendReminders: data.autoSendReminders !== undefined ? data.autoSendReminders : undefined,
          autoSendNotices: data.autoSendNotices !== undefined ? data.autoSendNotices : undefined,
          enableEmail: data.enableEmail !== undefined ? data.enableEmail : undefined,
          enableSMS: data.enableSMS !== undefined ? data.enableSMS : undefined,
          enableWhatsApp: data.enableWhatsApp !== undefined ? data.enableWhatsApp : undefined,
          enablePhone: data.enablePhone !== undefined ? data.enablePhone : undefined,
          reminderTemplate: data.reminderTemplate,
          firstNoticeTemplate: data.firstNoticeTemplate,
          secondNoticeTemplate: data.secondNoticeTemplate,
          finalNoticeTemplate: data.finalNoticeTemplate,
          clinicPhone: data.clinicPhone,
          clinicEmail: data.clinicEmail,
          clinicAddress: data.clinicAddress,
          contactHoursStart: data.contactHoursStart,
          contactHoursEnd: data.contactHoursEnd,
          contactDays: data.contactDays,
          updatedAt: new Date()
        }
      });
    } else {
      // Crear nueva configuración
      settings = await prisma.delinquencySettings.create({
        data: {
          reminderDaysBefore: data.reminderDaysBefore ? parseInt(data.reminderDaysBefore.toString()) : 3,
          firstNoticeDays: data.firstNoticeDays ? parseInt(data.firstNoticeDays.toString()) : 1,
          secondNoticeDays: data.secondNoticeDays ? parseInt(data.secondNoticeDays.toString()) : 7,
          finalNoticeDays: data.finalNoticeDays ? parseInt(data.finalNoticeDays.toString()) : 15,
          legalNoticeDays: data.legalNoticeDays ? parseInt(data.legalNoticeDays.toString()) : 30,
          enableLateFees: data.enableLateFees !== undefined ? data.enableLateFees : true,
          lateFeeType: data.lateFeeType || 'fixed',
          lateFeeAmount: data.lateFeeAmount ? parseFloat(data.lateFeeAmount.toString()) : 50,
          lateFeeFrequency: data.lateFeeFrequency || 'once',
          autoSendReminders: data.autoSendReminders !== undefined ? data.autoSendReminders : true,
          autoSendNotices: data.autoSendNotices !== undefined ? data.autoSendNotices : false,
          enableEmail: data.enableEmail !== undefined ? data.enableEmail : true,
          enableSMS: data.enableSMS !== undefined ? data.enableSMS : false,
          enableWhatsApp: data.enableWhatsApp !== undefined ? data.enableWhatsApp : false,
          enablePhone: data.enablePhone !== undefined ? data.enablePhone : true,
          reminderTemplate: data.reminderTemplate,
          firstNoticeTemplate: data.firstNoticeTemplate,
          secondNoticeTemplate: data.secondNoticeTemplate,
          finalNoticeTemplate: data.finalNoticeTemplate,
          clinicPhone: data.clinicPhone,
          clinicEmail: data.clinicEmail,
          clinicAddress: data.clinicAddress,
          contactHoursStart: data.contactHoursStart || "08:00",
          contactHoursEnd: data.contactHoursEnd || "18:00",
          contactDays: data.contactDays || ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating delinquency settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
