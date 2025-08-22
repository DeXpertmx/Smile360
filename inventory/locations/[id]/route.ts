
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        stocks: {
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
          },
          orderBy: { updatedAt: 'desc' }
        },
        movements: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: {
            stocks: true,
            movements: true
          }
        }
      }
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);

  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      name,
      type,
      description,
      building,
      floor,
      room,
      section,
      capacity,
      managerId,
      requiresAuth,
      isActive,
      isDefault
    } = body;

    // Verificar que el código no exista en otra ubicación
    const existingLocation = await prisma.location.findFirst({
      where: { 
        code,
        NOT: { id: params.id }
      }
    });

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Ya existe otra ubicación con este código' },
        { status: 400 }
      );
    }

    // Si se marca como default, desmarcar las demás
    if (isDefault) {
      await prisma.location.updateMany({
        where: { 
          isDefault: true,
          NOT: { id: params.id }
        },
        data: { isDefault: false }
      });
    }

    const location = await prisma.location.update({
      where: { id: params.id },
      data: {
        code,
        name,
        type: type || 'ALMACEN',
        description: description || null,
        building: building || null,
        floor: floor || null,
        room: room || null,
        section: section || null,
        capacity: capacity ? parseInt(capacity.toString()) : null,
        managerId: managerId || null,
        requiresAuth: requiresAuth || false,
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault || false
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            stocks: true,
            movements: true
          }
        }
      }
    });

    return NextResponse.json(location);

  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si la ubicación tiene stock
    const stockCount = await prisma.stock.count({
      where: { locationId: params.id }
    });

    if (stockCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la ubicación porque tiene productos en stock' },
        { status: 400 }
      );
    }

    await prisma.location.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Ubicación eliminada correctamente' });

  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
