
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const templates = await prisma.treatmentOrderTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);

  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      isDefault
    } = body;

    // Si se marca como default, desmarcar otros defaults de la misma categoría
    if (isDefault) {
      await prisma.treatmentOrderTemplate.updateMany({
        where: { 
          category: category,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    const template = await prisma.treatmentOrderTemplate.create({
      data: {
        name,
        category,
        description,
        content,
        variables: variables ? JSON.stringify(variables) : null,
        requiresSignature: requiresSignature ?? true,
        legalDisclaimer,
        termsConditions,
        isDefault: isDefault ?? false
      }
    });

    return NextResponse.json(template);

  } catch (error) {
    console.error('Error al crear plantilla:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
