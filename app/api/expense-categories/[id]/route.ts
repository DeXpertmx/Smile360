
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

    const category = await prisma.expenseCategory.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            expenses: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching expense category:', error);
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

    const body = await request.json();
    const { nombre, descripcion, color, icono } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Verificar si ya existe otra categoría con el mismo nombre
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        AND: [
          { name: { equals: nombre, mode: 'insensitive' } },
          { id: { not: params.id } }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }

    const category = await prisma.expenseCategory.update({
      where: {
        id: params.id
      },
      data: {
        name: nombre,
        description: descripcion || null,
        color: color || '#3B82F6',
        icon: icono || 'tag'
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating expense category:', error);
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

    // Verificar si la categoría tiene gastos asociados
    const expensesCount = await prisma.expense.count({
      where: {
        categoryId: params.id
      }
    });

    if (expensesCount > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar la categoría porque tiene ${expensesCount} gasto(s) asociado(s)` 
        }, 
        { status: 409 }
      );
    }

    await prisma.expenseCategory.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
