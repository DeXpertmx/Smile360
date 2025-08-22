
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
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

    return NextResponse.json(locations);

  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
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
      isDefault
    } = body;

    // Verificar que el código no exista
    const existingLocation = await prisma.location.findUnique({
      where: { code }
    });

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Ya existe una ubicación con este código' },
        { status: 400 }
      );
    }

    // Si se marca como default, desmarcar las demás
    if (isDefault) {
      await prisma.location.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const location = await prisma.location.create({
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
    console.error('Error al crear ubicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
