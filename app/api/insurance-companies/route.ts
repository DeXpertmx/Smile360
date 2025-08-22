
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para crear/actualizar aseguradora
const insuranceCompanySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().min(1, 'El código es requerido'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contractNumber: z.string().optional(),
  coveragePercentage: z.number().optional(),
  isPreferred: z.boolean().optional(),
  billingAddress: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  status: z.enum(['Activa', 'Inactiva', 'Suspendida']).default('Activa'),
  notes: z.string().optional(),
});

// GET - Obtener todas las aseguradoras
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      // Convertir status del frontend a campo isActive de la base de datos
      if (status === 'Activa') {
        where.isActive = true;
      } else if (status === 'Inactiva') {
        where.isActive = false;
      }
      // Para 'Suspendida' no filtramos ya que no tenemos ese estado en la BD
    }

    // Obtener aseguradoras con paginación
    const [companiesRaw, total] = await Promise.all([
      prisma.insuranceCompany.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: {
              policies: true,
              claims: true,
            },
          },
        },
      }),
      prisma.insuranceCompany.count({ where }),
    ]);

    // Transformar isActive a status para compatibilidad con el frontend
    const companies = companiesRaw.map(company => ({
      ...company,
      status: company.isActive ? 'Activa' : 'Inactiva',
      _count: {
        patientPolicies: company._count.policies || 0,
        claims: company._count.claims || 0,
      },
    }));

    return NextResponse.json({
      companies,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    });

  } catch (error) {
    console.error('Error al obtener aseguradoras:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva aseguradora
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = insuranceCompanySchema.parse(body);

    console.log('Datos recibidos para crear aseguradora:', validatedData);

    // Verificar que el código no exista
    const existingCompany = await prisma.insuranceCompany.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Ya existe una aseguradora con este código' },
        { status: 400 }
      );
    }

    // Preparar datos para crear, asegurándonos de usar solo campos válidos
    const createData: any = {
      name: validatedData.name,
      code: validatedData.code,
      phone: validatedData.phone || null,
      email: validatedData.email || null,
      website: validatedData.website || null,
      address: validatedData.address || null,
      contactPerson: validatedData.contactPerson || null,
      paymentTerms: validatedData.paymentTerms || null,
      isActive: validatedData.status === 'Activa',
      isPreferred: false, // Por defecto
      notes: validatedData.notes || null,
    };

    // Solo agregar contractNumber si está presente
    if (body.contractNumber) {
      createData.contractNumber = body.contractNumber;
    }

    // Solo agregar coveragePercentage si está presente y es válido
    if (body.coveragePercentage && !isNaN(parseFloat(body.coveragePercentage))) {
      createData.coveragePercentage = parseFloat(body.coveragePercentage);
    }

    console.log('Datos preparados para Prisma:', createData);

    // Crear la aseguradora
    const companyRaw = await prisma.insuranceCompany.create({
      data: createData,
      include: {
        _count: {
          select: {
            policies: true,
            claims: true,
          },
        },
      },
    });

    console.log('Aseguradora creada exitosamente:', companyRaw.id);

    // Transformar para compatibilidad con el frontend
    const company = {
      ...companyRaw,
      status: companyRaw.isActive ? 'Activa' : 'Inactiva',
      _count: {
        patientPolicies: companyRaw._count.policies || 0,
        claims: companyRaw._count.claims || 0,
      },
    };

    return NextResponse.json(company, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al crear aseguradora:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
