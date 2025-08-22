
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener datos del dashboard de caja
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cashRegisterId = searchParams.get('cashRegisterId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    // Filtros de fecha
    const dateFilter = {
      movementDate: {
        gte: startDate ? new Date(startDate) : todayStart,
        lte: endDate ? new Date(endDate) : todayEnd
      }
    };

    const whereClause = cashRegisterId 
      ? { ...dateFilter, cashRegisterId }
      : dateFilter;

    // Datos principales
    const [
      totalIncome,
      totalExpense,
      activeCashRegisters,
      openSessions,
      todayMovements,
      movementsByCategory,
      movementsByPaymentMethod,
      recentMovements
    ] = await Promise.all([
      // Total ingresos
      prisma.cashMovement.aggregate({
        where: { ...whereClause, type: 'INGRESO' },
        _sum: { amount: true }
      }),
      
      // Total egresos
      prisma.cashMovement.aggregate({
        where: { ...whereClause, type: 'EGRESO' },
        _sum: { amount: true }
      }),
      
      // Cajas activas
      prisma.cashRegister.count({
        where: { isActive: true }
      }),
      
      // Sesiones abiertas
      prisma.cashSession.count({
        where: { status: 'ABIERTA' }
      }),
      
      // Movimientos de hoy
      prisma.cashMovement.count({
        where: whereClause
      }),
      
      // Movimientos por categoría
      prisma.cashMovement.groupBy({
        by: ['category', 'type'],
        where: whereClause,
        _sum: { amount: true },
        _count: { id: true }
      }),
      
      // Movimientos por método de pago
      prisma.cashMovement.groupBy({
        by: ['paymentMethod'],
        where: whereClause,
        _sum: { amount: true },
        _count: { id: true }
      }),
      
      // Movimientos recientes
      prisma.cashMovement.findMany({
        where: cashRegisterId ? { cashRegisterId } : {},
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
        },
        orderBy: { movementDate: 'desc' },
        take: 10
      })
    ]);

    // Balance actual por caja
    const cashRegistersWithBalance = await prisma.cashRegister.findMany({
      where: cashRegisterId ? { id: cashRegisterId } : { isActive: true },
      select: {
        id: true,
        name: true,
        currentBalance: true,
        _count: {
          select: {
            sessions: {
              where: { status: 'ABIERTA' }
            }
          }
        }
      }
    });

    // Resumen de sesiones del día
    const todaySessionsFilter = {
      workingDate: {
        gte: todayStart,
        lte: todayEnd
      }
    };

    const todaySessions = await prisma.cashSession.findMany({
      where: cashRegisterId 
        ? { ...todaySessionsFilter, cashRegisterId }
        : todaySessionsFilter,
      include: {
        cashRegister: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { openedAt: 'desc' }
    });

    const dashboard = {
      summary: {
        totalIncome: Number(totalIncome._sum.amount || 0),
        totalExpense: Number(totalExpense._sum.amount || 0),
        netFlow: Number(totalIncome._sum.amount || 0) - Number(totalExpense._sum.amount || 0),
        activeCashRegisters,
        openSessions,
        todayMovements
      },
      cashRegisters: cashRegistersWithBalance,
      todaySessions,
      recentMovements,
      analytics: {
        movementsByCategory: movementsByCategory.map(item => ({
          category: item.category,
          type: item.type,
          amount: Number(item._sum.amount || 0),
          count: item._count.id
        })),
        movementsByPaymentMethod: movementsByPaymentMethod.map(item => ({
          paymentMethod: item.paymentMethod,
          amount: Number(item._sum.amount || 0),
          count: item._count.id
        }))
      }
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error fetching cash dashboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
