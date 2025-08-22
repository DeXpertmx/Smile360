
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');
    const category = searchParams.get('category');

    const selectedDate = new Date(month + '-01');
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const where: any = {
      expenseDate: {
        gte: monthStart,
        lte: monthEnd
      }
    };

    if (category) {
      where.categoryId = category;
    }

    // Total de gastos del mes
    const totalExpenses = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true
      }
    });

    // Gastos por categoría
    const categoryExpenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true
      },
      _count: true
    });

    // Obtener nombres de categorías
    const categories = await prisma.expenseCategory.findMany();
    const categoryMap = categories.reduce((acc: any, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    const categoryExpensesWithNames = categoryExpenses.map(item => ({
      category: categoryMap[item.categoryId] || 'Sin categoría',
      amount: item._sum.amount || 0,
      count: item._count
    }));

    // Tendencia de los últimos 6 meses
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const trendMonth = subMonths(selectedDate, i);
      const trendStart = startOfMonth(trendMonth);
      const trendEnd = endOfMonth(trendMonth);

      const monthTotal = await prisma.expense.aggregate({
        where: {
          expenseDate: {
            gte: trendStart,
            lte: trendEnd
          }
        },
        _sum: {
          amount: true
        }
      });

      monthlyTrend.push({
        month: format(trendMonth, 'MMM yyyy'),
        amount: monthTotal._sum.amount || 0
      });
    }

    // Top categorías
    const topCategories = categoryExpensesWithNames
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);

    // Gastos recientes
    const recentExpenses = await prisma.expense.findMany({
      where,
      orderBy: {
        expenseDate: 'desc'
      },
      take: 10
    });

    const reportData = {
      totalExpenses: totalExpenses._sum.amount || 0,
      monthlyExpenses: categoryExpensesWithNames,
      categoryExpenses: categoryExpensesWithNames,
      monthlyTrend,
      topCategories,
      recentExpenses
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
