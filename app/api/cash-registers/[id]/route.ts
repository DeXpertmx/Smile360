
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener caja específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const cashRegister = await prisma.cashRegister.findUnique({
      where: { id: params.id },
      include: {
        responsible: {
          select: { id: true, name: true, email: true }
        },
        sessions: {
          where: { status: 'ABIERTA' },
          orderBy: { openedAt: 'desc' }
        },
        movements: {
          take: 10,
          orderBy: { movementDate: 'desc' },
          include: {
            user: {
              select: { id: true, name: true }
            },
            patient: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!cashRegister) {
      return NextResponse.json(
        { error: 'Caja no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(cashRegister);
  } catch (error) {
    console.error('Error fetching cash register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar caja
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
    const { name, description, location, responsibleUser, isActive } = data;

    const cashRegister = await prisma.cashRegister.update({
      where: { id: params.id },
      data: {
        name,
        description,
        location,
        responsibleUser,
        isActive
      },
      include: {
        responsible: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(cashRegister);
  } catch (error) {
    console.error('Error updating cash register:', error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Caja no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar caja (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si tiene sesiones abiertas
    const openSessions = await prisma.cashSession.findFirst({
      where: {
        cashRegisterId: params.id,
        status: 'ABIERTA'
      }
    });

    if (openSessions) {
      return NextResponse.json(
        { error: 'No se puede eliminar una caja con sesiones abiertas' },
        { status: 400 }
      );
    }

    const cashRegister = await prisma.cashRegister.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json(cashRegister);
  } catch (error) {
    console.error('Error deleting cash register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
