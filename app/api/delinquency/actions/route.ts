
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    const {
      notificationId,
      patientId,
      actionType,
      description,
      outcome,
      contactMethod,
      duration,
      nextSteps,
      followUpRequired = false,
      followUpDate,
      followUpNotes,
      attachments = []
    } = data;

    // Validaciones básicas
    if (!notificationId || !patientId || !actionType || !description) {
      return NextResponse.json(
        { error: 'Notificación, paciente, tipo de acción y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Crear la acción
    const delinquencyAction = await prisma.delinquencyAction.create({
      data: {
        notificationId,
        patientId,
        userId: session.user.id,
        actionType,
        description,
        outcome,
        contactMethod,
        duration: duration ? parseInt(duration.toString()) : null,
        nextSteps,
        followUpRequired,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpNotes,
        attachments
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
            numeroExpediente: true,
          }
        },
        notification: {
          select: {
            title: true,
            type: true,
          }
        }
      }
    });

    // Actualizar la notificación con la nueva acción en el array
    await prisma.delinquencyNotification.update({
      where: { id: notificationId },
      data: {
        actionsTaken: {
          push: `${actionType}: ${description} (${new Date().toLocaleDateString()})`
        },
        updatedAt: new Date()
      }
    });

    return NextResponse.json(delinquencyAction, { status: 201 });
  } catch (error) {
    console.error('Error creating delinquency action:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    const patientId = searchParams.get('patientId');
    const actionType = searchParams.get('actionType');

    let where: any = {};
    
    if (notificationId) {
      where.notificationId = notificationId;
    }
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    if (actionType) {
      where.actionType = actionType;
    }

    const actions = await prisma.delinquencyAction.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
            numeroExpediente: true,
          }
        },
        notification: {
          select: {
            title: true,
            type: true,
            priority: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error fetching delinquency actions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
