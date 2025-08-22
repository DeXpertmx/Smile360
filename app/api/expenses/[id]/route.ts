
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id: params.id
      },
      include: {
        category: true
      }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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

    const formData = await request.formData();
    
    const updateData = {
      expenseDate: new Date(formData.get('fecha') as string),
      amount: parseFloat(formData.get('monto') as string),
      totalAmount: parseFloat(formData.get('monto') as string),
      categoryId: formData.get('categoriaId') as string,
      description: formData.get('descripcion') as string,
      paymentMethod: formData.get('metodoPago') as string,
      vendor: formData.get('proveedor') as string || null,
      invoiceNumber: formData.get('numeroFactura') as string || null,
      notes: formData.get('observaciones') as string || null
    };

    const expense = await prisma.expense.update({
      where: {
        id: params.id
      },
      data: updateData,
      include: {
        category: true
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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

    await prisma.expense.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
