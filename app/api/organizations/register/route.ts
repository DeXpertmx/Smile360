
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateSlug } from '@/lib/utils/slug';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clinicName,
      ownerName,
      ownerEmail,
      ownerPhone,
      password,
      country = 'MX',
      plan = 'basic'
    } = body;

    // Validaciones básicas
    if (!clinicName || !ownerName || !ownerEmail || !password) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findFirst({
      where: { email: ownerEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      );
    }

    // Generar slug único
    let slug = generateSlug(clinicName);
    let slugExists = await prisma.organization.findUnique({
      where: { slug }
    });
    
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(clinicName)}-${counter}`;
      slugExists = await prisma.organization.findUnique({
        where: { slug }
      });
      counter++;
    }

    // Configurar límites según el plan
    const planLimits = {
      basic: { maxUsers: 5, maxPatients: 100 },
      pro: { maxUsers: 15, maxPatients: 500 },
      enterprise: { maxUsers: -1, maxPatients: -1 }
    };

    const limits = planLimits[plan as keyof typeof planLimits] || planLimits.basic;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear organización y usuario propietario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la organización
      const organization = await tx.organization.create({
        data: {
          name: clinicName,
          slug,
          email: ownerEmail,
          phone: ownerPhone,
          country,
          plan,
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
          maxUsers: limits.maxUsers,
          maxPatients: limits.maxPatients,
          ownerName,
          ownerEmail,
          ownerPhone,
          features: plan === 'basic' ? ['agenda', 'pacientes', 'tratamientos'] : 
                   plan === 'pro' ? ['agenda', 'pacientes', 'tratamientos', 'inventario', 'reportes'] :
                   ['agenda', 'pacientes', 'tratamientos', 'inventario', 'reportes', 'facturacion', 'crm']
        }
      });

      // Crear usuario propietario
      const owner = await tx.user.create({
        data: {
          organizationId: organization.id,
          firstName: ownerName.split(' ')[0],
          lastName: ownerName.split(' ').slice(1).join(' ') || '',
          email: ownerEmail,
          password: hashedPassword,
          phone: ownerPhone,
          role: 'ADMIN',
          estado: 'ACTIVO',
          emailVerified: new Date()
        }
      });

      return { organization, owner };
    });

    // Preparar datos de respuesta sin información sensible
    const response = {
      success: true,
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        plan: result.organization.plan,
        status: result.organization.status,
        trialEndsAt: result.organization.trialEndsAt
      },
      loginUrl: `/auth/signin?org=${result.organization.slug}`
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    console.log('Checking availability for slug:', slug);

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requerido' },
        { status: 400 }
      );
    }

    // Validar formato del slug
    if (slug.length < 3 || slug.length > 50) {
      return NextResponse.json(
        { 
          error: 'El slug debe tener entre 3 y 50 caracteres',
          available: false 
        },
        { status: 400 }
      );
    }

    // Verificar disponibilidad del slug
    const existing = await prisma.organization.findUnique({
      where: { slug }
    });

    console.log('Existing organization found:', !!existing);

    return NextResponse.json({
      available: !existing,
      slug: slug
    });

  } catch (error) {
    console.error('Error checking slug availability:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
