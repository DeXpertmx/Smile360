
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    if (status) {
      where.status = status;
    }

    // Filtrar por permisos de usuario
    if (session.user.role !== 'ADMIN') {
      where.doctorId = session.user.id;
    }

    const [financingPlans, total] = await Promise.all([
      prisma.financingPlan.findMany({
        where,
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
          budget: {
            select: {
              id: true,
              title: true,
              total: true,
            },
          },
          payments: {
            select: {
              id: true,
              paymentNumber: true,
              scheduledAmount: true,
              paidAmount: true,
              status: true,
              dueDate: true,
            },
            orderBy: {
              paymentNumber: 'asc',
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.financingPlan.count({ where }),
    ]);

    // Calcular estadísticas de cada plan
    const plansWithStats = financingPlans.map((plan) => {
      const paidPayments = plan.payments.filter(p => p.status === 'Pagado').length;
      const totalPaid = plan.payments.reduce((sum, p) => sum + Number(p.paidAmount), 0);
      const remainingAmount = Number(plan.totalAmount) - totalPaid;
      const progress = (totalPaid / Number(plan.totalAmount)) * 100;

      return {
        ...plan,
        stats: {
          totalPayments: plan._count.payments,
          paidPayments,
          pendingPayments: plan._count.payments - paidPayments,
          totalPaid,
          remainingAmount,
          progress: Math.round(progress * 100) / 100,
        },
      };
    });

    return NextResponse.json({
      financingPlans: plansWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching financing plans:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      patientId,
      budgetId,
      title,
      description,
      totalAmount,
      downPayment,
      numberOfPayments,
      paymentFrequency,
      interestRate,
      firstPaymentDate,
      notes,
      terms,
      guarantorInfo,
    } = data;

    // Validaciones básicas
    if (!patientId || !title || !totalAmount || !numberOfPayments || !firstPaymentDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (totalAmount <= 0 || numberOfPayments <= 0) {
      return NextResponse.json(
        { error: 'Los montos y número de pagos deben ser positivos' },
        { status: 400 }
      );
    }

    // Calcular montos
    const downPaymentAmount = downPayment || 0;
    const financedAmount = totalAmount - downPaymentAmount;
    
    // Calcular el monto de cada cuota
    let paymentAmount = financedAmount / numberOfPayments;
    
    // Si hay interés, aplicar fórmula de amortización
    if (interestRate > 0) {
      const monthlyRate = interestRate / 100 / 12; // Convertir a tasa mensual decimal
      const periods = numberOfPayments;
      paymentAmount = (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, periods)) / 
                     (Math.pow(1 + monthlyRate, periods) - 1);
    }

    // Calcular fecha final
    const startDate = new Date(firstPaymentDate);
    const finalDate = new Date(startDate);
    
    // Agregar pagos según la frecuencia
    if (paymentFrequency === 'Mensual') {
      finalDate.setMonth(finalDate.getMonth() + numberOfPayments - 1);
    } else if (paymentFrequency === 'Quincenal') {
      finalDate.setDate(finalDate.getDate() + (numberOfPayments - 1) * 15);
    } else if (paymentFrequency === 'Semanal') {
      finalDate.setDate(finalDate.getDate() + (numberOfPayments - 1) * 7);
    }

    // Crear el plan de financiamiento
    const financingPlan = await prisma.financingPlan.create({
      data: {
        patientId,
        doctorId: session.user.id,
        budgetId,
        title,
        description,
        totalAmount,
        downPayment: downPaymentAmount,
        financedAmount,
        numberOfPayments,
        paymentFrequency,
        interestRate: interestRate || 0,
        paymentAmount,
        firstPaymentDate: new Date(firstPaymentDate),
        finalPaymentDate: finalDate,
        notes,
        terms,
        guarantorName: guarantorInfo?.name,
        guarantorPhone: guarantorInfo?.phone,
        guarantorEmail: guarantorInfo?.email,
        guarantorAddress: guarantorInfo?.address,
      },
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
      },
    });

    // Crear los pagos programados
    const paymentPromises = [];
    for (let i = 0; i < numberOfPayments; i++) {
      const dueDate = new Date(startDate);
      
      if (paymentFrequency === 'Mensual') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else if (paymentFrequency === 'Quincenal') {
        dueDate.setDate(dueDate.getDate() + i * 15);
      } else if (paymentFrequency === 'Semanal') {
        dueDate.setDate(dueDate.getDate() + i * 7);
      }

      paymentPromises.push(
        prisma.financingPayment.create({
          data: {
            financingPlanId: financingPlan.id,
            paymentNumber: i + 1,
            scheduledAmount: paymentAmount,
            remainingAmount: paymentAmount,
            dueDate,
          },
        })
      );
    }

    await Promise.all(paymentPromises);

    return NextResponse.json(financingPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating financing plan:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
