
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const delinquencyNotification = await prisma.delinquencyNotification.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            numeroExpediente: true,
            email: true,
            phone: true,
          }
        },
        financingPlan: {
          select: {
            id: true,
            planNumber: true,
            title: true,
            totalAmount: true,
            paymentAmount: true,
            paymentFrequency: true,
          }
        },
        financingPayment: {
          select: {
            id: true,
            paymentNumber: true,
            scheduledAmount: true,
            paidAmount: true,
            dueDate: true,
            status: true,
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            dueDate: true,
            status: true,
          }
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        actions: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!delinquencyNotification) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(delinquencyNotification);
  } catch (error) {
    console.error('Error fetching delinquency notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    const {
      status,
      priority,
      assignedTo,
      nextActionDate,
      notes,
      resolvedAt,
      followUpDate,
      notificationMethod,
      sentAt,
      viewedAt
    } = data;

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (nextActionDate) updateData.nextActionDate = new Date(nextActionDate);
    if (notes) updateData.notes = notes;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);
    if (notificationMethod) updateData.notificationMethod = notificationMethod;
    if (sentAt) updateData.sentAt = new Date(sentAt);
    if (viewedAt) updateData.viewedAt = new Date(viewedAt);
    
    if (status === 'Resuelto' && resolvedAt) {
      updateData.resolvedAt = new Date(resolvedAt);
    }

    const delinquencyNotification = await prisma.delinquencyNotification.update({
      where: { id: params.id },
      data: updateData,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            numeroExpediente: true,
            email: true,
            phone: true,
          }
        },
        assignedUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json(delinquencyNotification);
  } catch (error) {
    console.error('Error updating delinquency notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.delinquencyNotification.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Notificación eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting delinquency notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
