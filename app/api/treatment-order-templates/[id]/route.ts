
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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const template = await prisma.treatmentOrderTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }

    return NextResponse.json(template);

  } catch (error) {
    console.error('Error al obtener plantilla:', error);
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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      content,
      variables,
      requiresSignature,
      legalDisclaimer,
      termsConditions,
      isDefault,
      isActive
    } = body;

    // Si se marca como default, desmarcar otros defaults de la misma categoría
    if (isDefault) {
      await prisma.treatmentOrderTemplate.updateMany({
        where: { 
          category: category,
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      });
    }

    const template = await prisma.treatmentOrderTemplate.update({
      where: { id: params.id },
      data: {
        name,
        category,
        description,
        content,
        variables: variables ? JSON.stringify(variables) : null,
        requiresSignature: requiresSignature ?? true,
        legalDisclaimer,
        termsConditions,
        isDefault: isDefault ?? false,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json(template);

  } catch (error) {
    console.error('Error al actualizar plantilla:', error);
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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Marcar como inactiva en lugar de eliminar
    const template = await prisma.treatmentOrderTemplate.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Plantilla desactivada correctamente' });

  } catch (error) {
    console.error('Error al desactivar plantilla:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
