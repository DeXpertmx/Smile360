
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener sesión específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const cashSession = await prisma.cashSession.findUnique({
      where: { id: params.id },
      include: {
        cashRegister: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, name: true }
        },
        movements: {
          include: {
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
          orderBy: { movementDate: 'desc' }
        }
      }
    });

    if (!cashSession) {
      return NextResponse.json(
        { error: 'Sesión de caja no encontrada' },
        { status: 404 }
      );
    }

    // Calcular resumen de la sesión
    const summary = {
      totalIncome: cashSession.movements
        .filter(m => m.type === 'INGRESO')
        .reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0),
      totalExpense: cashSession.movements
        .filter(m => m.type === 'EGRESO')
        .reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0),
      movementsByCategory: cashSession.movements.reduce((acc: any, movement) => {
        const key = `${movement.type}_${movement.category}`;
        if (!acc[key]) {
          acc[key] = {
            type: movement.type,
            category: movement.category,
            count: 0,
            amount: 0
          };
        }
        acc[key].count++;
        acc[key].amount += parseFloat(movement.amount.toString());
        return acc;
      }, {}),
      movementsByPaymentMethod: cashSession.movements.reduce((acc: any, movement) => {
        if (!acc[movement.paymentMethod]) {
          acc[movement.paymentMethod] = {
            count: 0,
            amount: 0
          };
        }
        acc[movement.paymentMethod].count++;
        acc[movement.paymentMethod].amount += parseFloat(movement.amount.toString());
        return acc;
      }, {})
    };

    return NextResponse.json({ ...cashSession, summary });
  } catch (error) {
    console.error('Error fetching cash session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Cerrar sesión de caja
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { actualClosing, denominations, notes, discrepancyNotes } = data;

    if (actualClosing === undefined) {
      return NextResponse.json(
        { error: 'El balance final es requerido' },
        { status: 400 }
      );
    }

    const parsedActualClosing = parseFloat(actualClosing);
    if (isNaN(parsedActualClosing) || parsedActualClosing < 0) {
      return NextResponse.json(
        { error: 'El balance final debe ser un número válido' },
        { status: 400 }
      );
    }

    // Obtener la sesión actual con movimientos
    const currentSession = await prisma.cashSession.findUnique({
      where: { id: params.id },
      include: {
        movements: true,
        cashRegister: true
      }
    });

    if (!currentSession) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    if (currentSession.status !== 'ABIERTA') {
      return NextResponse.json(
        { error: 'La sesión ya está cerrada' },
        { status: 400 }
      );
    }

    // Calcular el balance esperado
    const totalIncome = currentSession.movements
      .filter(m => m.type === 'INGRESO')
      .reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0);
    
    const totalExpense = currentSession.movements
      .filter(m => m.type === 'EGRESO')
      .reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0);

    const expectedClosing = parseFloat(currentSession.openingBalance.toString()) + totalIncome - totalExpense;
    const difference = parsedActualClosing - expectedClosing;

    const updatedSession = await prisma.cashSession.update({
      where: { id: params.id },
      data: {
        actualClosing: parsedActualClosing,
        expectedClosing,
        difference,
        totalIncome,
        totalExpense,
        denominations: denominations ? JSON.stringify(denominations) : null,
        notes,
        discrepancyNotes,
        closedAt: new Date(),
        status: 'CERRADA'
      },
      include: {
        cashRegister: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error closing cash session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
