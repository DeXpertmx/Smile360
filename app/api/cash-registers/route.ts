
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las cajas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const cashRegisters = await prisma.cashRegister.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        responsible: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            movements: {
              where: {
                movementDate: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            },
            sessions: {
              where: {
                status: 'ABIERTA'
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(cashRegisters);
  } catch (error) {
    console.error('Error fetching cash registers:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva caja
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, initialAmount, location, responsibleUser } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la caja es requerido' },
        { status: 400 }
      );
    }

    const cashRegister = await prisma.cashRegister.create({
      data: {
        name,
        description,
        initialAmount: initialAmount ? parseFloat(initialAmount) : 0,
        currentBalance: initialAmount ? parseFloat(initialAmount) : 0,
        location,
        responsibleUser
      },
      include: {
        responsible: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(cashRegister, { status: 201 });
  } catch (error) {
    console.error('Error creating cash register:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ya existe una caja con ese nombre' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
