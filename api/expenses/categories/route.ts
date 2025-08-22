
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const categories = await prisma.expenseCategory.findMany({
      where: {
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const canManage = session.user?.role === 'ADMIN' || 
                     session.user?.role === 'DOCTOR';
                     // @ts-ignore - permisos property might not exist in type
                     // || session.user?.permisos?.includes('GASTOS_ADMINISTRAR');

    if (!canManage) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    const data = await request.json();
    const {
      name,
      description,
      color,
      isActive,
      monthlyBudget,
      yearlyBudget
    } = data;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este nombre' },
        { status: 400 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3b82f6',
        isActive: isActive !== false,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        yearlyBudget: yearlyBudget ? parseFloat(yearlyBudget) : null
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense category:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
