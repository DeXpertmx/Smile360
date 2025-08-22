
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      financingPlanId: params.id,
    };

    if (status) {
      where.status = status;
    }

    const payments = await prisma.financingPayment.findMany({
      where,
      orderBy: {
        paymentNumber: 'asc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { paymentId, amount, paymentMethod, reference, notes } = data;

    if (!paymentId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Datos de pago inválidos' },
        { status: 400 }
      );
    }

    // Verificar que el pago existe y pertenece al plan
    const payment = await prisma.financingPayment.findFirst({
      where: {
        id: paymentId,
        financingPlanId: params.id,
      },
      include: {
        financingPlan: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (session.user.role !== 'ADMIN' && payment.financingPlan.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sin permisos para registrar este pago' },
        { status: 403 }
      );
    }

    const currentPaid = Number(payment.paidAmount);
    const newPaidAmount = currentPaid + amount;
    const scheduledAmount = Number(payment.scheduledAmount);

    // Verificar que no se exceda el monto programado
    if (newPaidAmount > scheduledAmount) {
      return NextResponse.json(
        { error: 'El monto del pago excede lo programado' },
        { status: 400 }
      );
    }

    // Actualizar el pago
    const newStatus = newPaidAmount >= scheduledAmount ? 'Pagado' : 'Parcial';
    const remainingAmount = scheduledAmount - newPaidAmount;

    const updatedPayment = await prisma.financingPayment.update({
      where: { id: paymentId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount,
        status: newStatus,
        paymentDate: new Date(),
        paymentMethod,
        reference,
        notes,
        processedBy: session.user.id,
        processedAt: new Date(),
      },
    });

    // Verificar si el plan está completado
    const allPayments = await prisma.financingPayment.findMany({
      where: { financingPlanId: params.id },
    });

    const allPaid = allPayments.every((p: any) => p.status === 'Pagado');
    if (allPaid) {
      await prisma.financingPlan.update({
        where: { id: params.id },
        data: { status: 'Completado' },
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
