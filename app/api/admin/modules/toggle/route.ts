
import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkModuleAccess } from '@/lib/module-access';

export async function POST(req: NextRequest) {
  try {
    // Verificar que el usuario tenga acceso al módulo de configuración
    const { hasAccess, session } = await checkModuleAccess('configuracion');

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Verificar que sea administrador
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden gestionar módulos' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { feature, enabled } = body;

    if (!feature || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Feature y enabled son requeridos' },
        { status: 400 }
      );
    }

    const organizationId = session.user.organizationId;

    // Obtener la organización actual
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { features: true }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    let newFeatures = [...organization.features];

    if (enabled) {
      // Agregar feature si no existe
      if (!newFeatures.includes(feature)) {
        newFeatures.push(feature);
      }
    } else {
      // Remover feature
      newFeatures = newFeatures.filter(f => f !== feature);
    }

    // Actualizar la organización
    await prisma.organization.update({
      where: { id: organizationId },
      data: { features: newFeatures }
    });

    return NextResponse.json({
      success: true,
      message: `Módulo ${feature} ${enabled ? 'activado' : 'desactivado'} correctamente`,
      features: newFeatures
    });

  } catch (error) {
    console.error('Error toggling module:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
