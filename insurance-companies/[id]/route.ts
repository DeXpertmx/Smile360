
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const insuranceCompanyUpdateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  code: z.string().min(1, 'El código es requerido').optional(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  website: z.string().url().optional().nullable().or(z.literal('')),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal('')),
  coverageTypes: z.string().optional().nullable(),
  copayAmount: z.number().optional().nullable(),
  deductible: z.number().optional().nullable(),
  maxCoverage: z.number().optional().nullable(),
  billingAddress: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  status: z.enum(['Activa', 'Inactiva', 'Suspendida']).optional(),
  notes: z.string().optional().nullable(),
});

// GET - Obtener aseguradora por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const companyRaw = await prisma.insuranceCompany.findUnique({
      where: { id: params.id },
      include: {
        policies: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        claims: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            policies: true,
            claims: true,
          },
        },
      },
    });

    if (!companyRaw) {
      return NextResponse.json(
        { error: 'Aseguradora no encontrada' },
        { status: 404 }
      );
    }

    // Transformar para compatibilidad con el frontend
    const company = {
      ...companyRaw,
      status: companyRaw.isActive ? 'Activa' : 'Inactiva',
      _count: {
        patientPolicies: companyRaw._count.policies || 0,
        claims: companyRaw._count.claims || 0,
      },
    };

    return NextResponse.json(company);

  } catch (error) {
    console.error('Error al obtener aseguradora:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar aseguradora
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = insuranceCompanyUpdateSchema.parse(body);

    console.log('Datos recibidos para actualizar aseguradora:', params.id, validatedData);

    // Verificar que la aseguradora existe
    const existingCompany = await prisma.insuranceCompany.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Aseguradora no encontrada' },
        { status: 404 }
      );
    }

    // Si se está actualizando el código, verificar que no exista otro
    if (validatedData.code && validatedData.code !== existingCompany.code) {
      const codeExists = await prisma.insuranceCompany.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Ya existe una aseguradora con este código' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización solo con campos válidos de la BD
    const updateData: any = {};
    
    // Campos básicos
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.code !== undefined) updateData.code = validatedData.code;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.email !== undefined) updateData.email = validatedData.email;
    if (validatedData.website !== undefined) updateData.website = validatedData.website;
    if (validatedData.address !== undefined) updateData.address = validatedData.address;
    if (validatedData.contactPerson !== undefined) updateData.contactPerson = validatedData.contactPerson;
    if (validatedData.paymentTerms !== undefined) updateData.paymentTerms = validatedData.paymentTerms;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    // Convertir status a isActive
    if (validatedData.status !== undefined) {
      updateData.isActive = validatedData.status === 'Activa';
    }

    // Campos adicionales del body
    if (body.contractNumber !== undefined) updateData.contractNumber = body.contractNumber;
    if (body.coveragePercentage !== undefined && !isNaN(parseFloat(body.coveragePercentage))) {
      updateData.coveragePercentage = parseFloat(body.coveragePercentage);
    }

    console.log('Datos preparados para actualizar:', updateData);

    // Actualizar la aseguradora
    const updatedCompanyRaw = await prisma.insuranceCompany.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            policies: true,
            claims: true,
          },
        },
      },
    });

    console.log('Aseguradora actualizada exitosamente:', updatedCompanyRaw.id);

    // Transformar para compatibilidad con el frontend
    const updatedCompany = {
      ...updatedCompanyRaw,
      status: updatedCompanyRaw.isActive ? 'Activa' : 'Inactiva',
      _count: {
        patientPolicies: updatedCompanyRaw._count.policies || 0,
        claims: updatedCompanyRaw._count.claims || 0,
      },
    };

    return NextResponse.json(updatedCompany);

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al actualizar aseguradora:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar aseguradora
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que la aseguradora existe
    const existingCompany = await prisma.insuranceCompany.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            policies: true,
            claims: true,
          },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Aseguradora no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si tiene pólizas o reclamos asociados
    if (existingCompany._count.policies > 0 || existingCompany._count.claims > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar la aseguradora porque tiene pólizas o reclamos asociados',
          details: {
            policies: existingCompany._count.policies,
            claims: existingCompany._count.claims,
          },
        },
        { status: 400 }
      );
    }

    // Eliminar la aseguradora
    await prisma.insuranceCompany.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Aseguradora eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar aseguradora:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
