
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener movimientos de caja
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cashRegisterId = searchParams.get('cashRegisterId');
    const sessionId = searchParams.get('sessionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (cashRegisterId) {
      where.cashRegisterId = cashRegisterId;
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.movementDate = {};
      if (startDate) {
        where.movementDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.movementDate.lte = new Date(endDate);
      }
    }

    const [movements, total] = await Promise.all([
      prisma.cashMovement.findMany({
        where,
        include: {
          cashRegister: {
            select: { id: true, name: true }
          },
          session: {
            select: { id: true, sessionNumber: true }
          },
          user: {
            select: { id: true, name: true }
          },
          patient: {
            select: { id: true, firstName: true, lastName: true }
          },
          invoice: {
            select: { id: true, invoiceNumber: true }
          },
          expense: {
            select: { id: true, expenseNumber: true, description: true }
          }
        },
        orderBy: { movementDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.cashMovement.count({ where })
    ]);

    return NextResponse.json({
      movements,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching cash movements:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo movimiento de caja
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const {
      cashRegisterId,
      sessionId,
      type,
      category,
      amount,
      paymentMethod,
      description,
      reference,
      patientId,
      invoiceId,
      expenseId,
      documentType,
      documentNumber,
      movementDate
    } = data;

    if (!cashRegisterId || !type || !category || !amount || !description) {
      return NextResponse.json(
        { error: 'Campos requeridos: cashRegisterId, type, category, amount, description' },
        { status: 400 }
      );
    }

    if (!['INGRESO', 'EGRESO'].includes(type)) {
      return NextResponse.json(
        { error: 'El tipo debe ser INGRESO o EGRESO' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      );
    }

    // Verificar que la caja existe y está activa
    const cashRegister = await prisma.cashRegister.findUnique({
      where: { id: cashRegisterId }
    });

    if (!cashRegister || !cashRegister.isActive) {
      return NextResponse.json(
        { error: 'Caja no encontrada o inactiva' },
        { status: 400 }
      );
    }

    // Crear el movimiento dentro de una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el movimiento
      const movement = await tx.cashMovement.create({
        data: {
          cashRegisterId,
          sessionId,
          type,
          category,
          amount: parsedAmount,
          paymentMethod: paymentMethod || 'EFECTIVO',
          description,
          reference,
          patientId,
          invoiceId,
          expenseId,
          userId: session.user.id,
          documentType,
          documentNumber,
          movementDate: movementDate ? new Date(movementDate) : new Date()
        },
        include: {
          cashRegister: {
            select: { id: true, name: true }
          },
          user: {
            select: { id: true, name: true }
          },
          patient: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      });

      // Actualizar el balance de la caja
      const balanceChange = type === 'INGRESO' ? parsedAmount : -parsedAmount;
      await tx.cashRegister.update({
        where: { id: cashRegisterId },
        data: {
          currentBalance: {
            increment: balanceChange
          }
        }
      });

      // Si hay una sesión abierta, actualizar los totales
      if (sessionId) {
        const updateData: any = {};
        if (type === 'INGRESO') {
          updateData.totalIncome = { increment: parsedAmount };
        } else {
          updateData.totalExpense = { increment: parsedAmount };
        }

        await tx.cashSession.update({
          where: { id: sessionId },
          data: updateData
        });
      }

      return movement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating cash movement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
