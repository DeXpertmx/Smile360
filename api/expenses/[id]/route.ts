
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const canView = session.user?.role === 'ADMIN' || 
                   session.user?.role === 'DOCTOR';
                   // @ts-ignore - permisos property might not exist in type
                   // || session.user?.permisos?.includes('GASTOS_VER');

    if (!canView) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

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
    const canEdit = session.user?.role === 'ADMIN' || 
                   session.user?.role === 'DOCTOR';
                   // @ts-ignore - permisos property might not exist in type
                   // || session.user?.permisos?.includes('GASTOS_EDITAR');

    if (!canEdit) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    // Verificar que el gasto existe
    const existingExpense = await prisma.expense.findUnique({
      where: { id: params.id }
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
    }

    const data = await request.json();
    const {
      description,
      amount,
      categoryId,
      expenseDate,
      paymentMethod,
      vendor,
      invoiceNumber,
      receiptNumber,
      taxAmount,
      totalAmount,
      status,
      notes,
      receiptUrl,
      taxDeductible,
      isRecurring,
      recurringType,
      tags,
      requiresApproval
    } = data;

    // Si se cambia la categoría, verificar que existe y está activa
    if (categoryId && categoryId !== existingExpense.categoryId) {
      const category = await prisma.expenseCategory.findFirst({
        where: {
          id: categoryId,
          isActive: true
        }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Categoría no válida o inactiva' },
          { status: 400 }
        );
      }
    }

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        ...(description !== undefined && { description: description.trim() }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(taxAmount !== undefined && { taxAmount: parseFloat(taxAmount || 0) }),
        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount || amount) }),
        ...(categoryId !== undefined && { categoryId }),
        ...(expenseDate !== undefined && { expenseDate: new Date(expenseDate) }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(vendor !== undefined && { vendor: vendor?.trim() || null }),
        ...(invoiceNumber !== undefined && { invoiceNumber: invoiceNumber?.trim() || null }),
        ...(receiptNumber !== undefined && { receiptNumber: receiptNumber?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(receiptUrl !== undefined && { receiptUrl }),
        ...(taxDeductible !== undefined && { taxDeductible }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurringType !== undefined && { recurringType }),
        ...(tags !== undefined && { tags: tags?.trim() || null }),
        ...(requiresApproval !== undefined && { requiresApproval })
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error updating expense:', error);
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
    const canDelete = session.user?.role === 'ADMIN' || 
                     session.user?.role === 'DOCTOR';
                     // @ts-ignore - permisos property might not exist in type
                     // || session.user?.permisos?.includes('GASTOS_ELIMINAR');

    if (!canDelete) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    // Verificar que el gasto existe
    const existingExpense = await prisma.expense.findUnique({
      where: { id: params.id }
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
