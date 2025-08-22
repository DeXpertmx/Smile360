
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const financingPlan = await prisma.financingPlan.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            numeroExpediente: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        budget: {
          select: {
            id: true,
            title: true,
            total: true,
            status: true,
          },
        },
        payments: {
          orderBy: {
            paymentNumber: 'asc',
          },
        },
      },
    });

    if (!financingPlan) {
      return NextResponse.json(
        { error: 'Plan de financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (session.user.role !== 'ADMIN' && financingPlan.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sin permisos para ver este plan' },
        { status: 403 }
      );
    }

    // Calcular estadísticas
    const totalPaid = financingPlan.payments.reduce((sum, payment) => sum + Number(payment.paidAmount), 0);
    const remainingAmount = Number(financingPlan.totalAmount) - totalPaid;
    const progress = (totalPaid / Number(financingPlan.totalAmount)) * 100;
    const paidPayments = financingPlan.payments.filter(p => p.status === 'Pagado').length;
    const overduePayments = financingPlan.payments.filter(p => 
      p.status !== 'Pagado' && new Date(p.dueDate) < new Date()
    ).length;

    const planWithStats = {
      ...financingPlan,
      stats: {
        totalPaid,
        remainingAmount,
        progress: Math.round(progress * 100) / 100,
        paidPayments,
        pendingPayments: financingPlan.payments.length - paidPayments,
        overduePayments,
      },
    };

    return NextResponse.json(planWithStats);
  } catch (error) {
    console.error('Error fetching financing plan:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { status, approvalStatus, notes, patientSignature, doctorSignature } = data;

    // Verificar que el plan existe
    const existingPlan = await prisma.financingPlan.findUnique({
      where: { id: params.id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan de financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (session.user.role !== 'ADMIN' && existingPlan.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sin permisos para modificar este plan' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (approvalStatus !== undefined) updateData.approvalStatus = approvalStatus;
    if (notes !== undefined) updateData.notes = notes;
    if (patientSignature !== undefined) updateData.patientSignature = patientSignature;
    if (doctorSignature !== undefined) updateData.doctorSignature = doctorSignature;

    // Si se está firmando, agregar fecha
    if (patientSignature || doctorSignature) {
      updateData.signatureDate = new Date();
    }

    // Si se está aprobando, actualizar estado y activar pagos
    if (approvalStatus === 'Aprobado' && existingPlan.approvalStatus !== 'Aprobado') {
      updateData.status = 'Activo';
    }

    const updatedPlan = await prisma.financingPlan.update({
      where: { id: params.id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            numeroExpediente: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating financing plan:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el plan existe
    const existingPlan = await prisma.financingPlan.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan de financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (session.user.role !== 'ADMIN' && existingPlan.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sin permisos para eliminar este plan' },
        { status: 403 }
      );
    }

    // No permitir eliminar planes con pagos realizados
    const hasPaidPayments = existingPlan.payments.some(payment => Number(payment.paidAmount) > 0);
    if (hasPaidPayments) {
      return NextResponse.json(
        { error: 'No se puede eliminar un plan con pagos realizados' },
        { status: 400 }
      );
    }

    // Eliminar el plan (los pagos se eliminan en cascada)
    await prisma.financingPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Plan eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting financing plan:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
