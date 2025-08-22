
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if category exists
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { id: params.id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // If updating name, check if it conflicts with another category
    if (name && name.trim() !== existingCategory.name) {
      const duplicateCategory = await prisma.expenseCategory.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          id: { not: params.id }
        }
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Ya existe otra categoría con este nombre' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
        ...(monthlyBudget !== undefined && { monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null }),
        ...(yearlyBudget !== undefined && { yearlyBudget: yearlyBudget ? parseFloat(yearlyBudget) : null })
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating expense category:', error);
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

    // Check if category has associated expenses
    const expensesCount = await prisma.expense.count({
      where: { categoryId: params.id }
    });

    if (expensesCount > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar la categoría porque tiene ${expensesCount} gastos asociados. Primero debe reasignar o eliminar estos gastos.` 
        },
        { status: 400 }
      );
    }

    await prisma.expenseCategory.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
