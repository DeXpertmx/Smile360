
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: session.user.organizationId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        country: true,
        currency: true,
        language: true,
        logo: true,
        plan: true,
        status: true,
        trialEndsAt: true,
        maxUsers: true,
        maxPatients: true,
        features: true,
        timezone: true,
        createdAt: true
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    // Obtener estadísticas de uso
    const [userCount, patientCount] = await Promise.all([
      prisma.user.count({
        where: { organizationId: organization.id }
      }),
      prisma.patient.count({
        where: { organizationId: organization.id }
      })
    ]);

    return NextResponse.json({
      success: true,
      organization: {
        ...organization,
        usage: {
          users: userCount,
          patients: patientCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching current organization:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      phone,
      website,
      address,
      city,
      state,
      timezone,
      currency,
      language
    } = body;

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: session.user.organizationId
      },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(website && { website }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(timezone && { timezone }),
        ...(currency && { currency }),
        ...(language && { language })
      },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        country: true,
        currency: true,
        language: true,
        timezone: true
      }
    });

    return NextResponse.json({
      success: true,
      organization: updatedOrganization
    });

  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
