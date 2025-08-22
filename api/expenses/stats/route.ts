
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Total de gastos
    const totalExpenses = await prisma.expense.count();

    // Monto total de gastos
    const totalAmountResult = await prisma.expense.aggregate({
      _sum: {
        totalAmount: true
      }
    });

    // Gastos del mes actual
    const monthlyExpensesResult = await prisma.expense.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        expenseDate: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth
        }
      }
    });

    // Gastos pendientes de aprobación o pago
    const pendingExpenses = await prisma.expense.count({
      where: {
        OR: [
          { status: 'Pendiente' },
          { 
            AND: [
              { requiresApproval: true },
              { isApproved: false }
            ]
          }
        ]
      }
    });

    // Top 5 categorías con más gastos este mes
    const topCategories = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        expenseDate: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      },
      take: 5
    });

    // Obtener información de las categorías
    const categoryIds = topCategories.map(cat => cat.categoryId);
    const categories = await prisma.expenseCategory.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true,
        color: true
      }
    });

    const topCategoriesWithInfo = topCategories.map(cat => ({
      ...cat,
      category: categories.find(c => c.id === cat.categoryId)
    }));

    const stats = {
      totalExpenses,
      totalAmount: totalAmountResult._sum.totalAmount || 0,
      monthlyExpenses: monthlyExpensesResult._sum.totalAmount || 0,
      pendingExpenses,
      topCategories: topCategoriesWithInfo
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
