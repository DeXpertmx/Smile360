
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener sesiones de caja
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cashRegisterId = searchParams.get('cashRegisterId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (cashRegisterId) {
      where.cashRegisterId = cashRegisterId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.workingDate = {};
      if (startDate) {
        where.workingDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.workingDate.lte = new Date(endDate);
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.cashSession.findMany({
        where,
        include: {
          cashRegister: {
            select: { id: true, name: true }
          },
          user: {
            select: { id: true, name: true }
          },
          _count: {
            select: { movements: true }
          }
        },
        orderBy: { workingDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.cashSession.count({ where })
    ]);

    return NextResponse.json({
      sessions,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching cash sessions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Abrir nueva sesión de caja
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { cashRegisterId, openingBalance, workingDate, notes } = data;

    if (!cashRegisterId || openingBalance === undefined) {
      return NextResponse.json(
        { error: 'Campos requeridos: cashRegisterId, openingBalance' },
        { status: 400 }
      );
    }

    const parsedOpeningBalance = parseFloat(openingBalance);
    if (isNaN(parsedOpeningBalance) || parsedOpeningBalance < 0) {
      return NextResponse.json(
        { error: 'El balance inicial debe ser un número válido' },
        { status: 400 }
      );
    }

    // Verificar que no hay otra sesión abierta para esta caja
    const existingSession = await prisma.cashSession.findFirst({
      where: {
        cashRegisterId,
        status: 'ABIERTA'
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { error: 'Ya existe una sesión abierta para esta caja' },
        { status: 400 }
      );
    }

    // Generar número de sesión consecutivo
    const lastSession = await prisma.cashSession.findFirst({
      where: { cashRegisterId },
      orderBy: { sessionNumber: 'desc' }
    });

    const sessionNumber = lastSession 
      ? String(parseInt(lastSession.sessionNumber) + 1).padStart(4, '0')
      : '0001';

    const cashSession = await prisma.cashSession.create({
      data: {
        cashRegisterId,
        userId: session.user.id,
        sessionNumber,
        openingBalance: parsedOpeningBalance,
        expectedClosing: parsedOpeningBalance,
        workingDate: workingDate ? new Date(workingDate) : new Date(),
        notes
      },
      include: {
        cashRegister: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(cashSession, { status: 201 });
  } catch (error) {
    console.error('Error creating cash session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
