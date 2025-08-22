
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isRead = searchParams.get('isRead');
    const isResolved = searchParams.get('isResolved');

    const where: any = {};

    if (type && type !== 'all') {
      where.type = type;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    if (isResolved !== null) {
      where.isResolved = isResolved === 'true';
    }

    const alerts = await prisma.inventoryAlert.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true,
            totalStock: true,
            minStock: true,
            supplier: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(alerts);

  } catch (error) {
    console.error('Error al obtener alertas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      productId,
      type,
      message,
      priority
    } = body;

    const alert = await prisma.inventoryAlert.create({
      data: {
        productId,
        type,
        message,
        priority: priority || 'Normal'
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true
          }
        }
      }
    });

    return NextResponse.json(alert);

  } catch (error) {
    console.error('Error al crear alerta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { alertIds, action } = body;

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un ID de alerta' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'mark_read':
        updateData = { isRead: true, readAt: new Date() };
        break;
      case 'mark_unread':
        updateData = { isRead: false, readAt: null };
        break;
      case 'resolve':
        updateData = { isResolved: true, resolvedAt: new Date() };
        break;
      case 'unresolve':
        updateData = { isResolved: false, resolvedAt: null };
        break;
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    await prisma.inventoryAlert.updateMany({
      where: {
        id: { in: alertIds }
      },
      data: updateData
    });

    return NextResponse.json({ 
      message: `${alertIds.length} alerta(s) actualizada(s) correctamente` 
    });

  } catch (error) {
    console.error('Error al actualizar alertas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
