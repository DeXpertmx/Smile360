
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const templates = await prisma.financingTemplate.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching financing templates:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo administradores pueden crear plantillas
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden crear plantillas' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      name,
      description,
      defaultInterestRate,
      defaultNumberOfPayments,
      defaultPaymentFrequency,
      defaultDownPaymentPercent,
      terms,
      requiresApproval,
      requiresGuarantor,
      gracePeriodDays,
      lateFeePercent,
      isDefault,
      minAmount,
      maxAmount,
    } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la plantilla es requerido' },
        { status: 400 }
      );
    }

    // Si se marca como default, desmarcar otras plantillas
    if (isDefault) {
      await prisma.financingTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.financingTemplate.create({
      data: {
        name,
        description,
        defaultInterestRate: defaultInterestRate || 0,
        defaultNumberOfPayments: defaultNumberOfPayments || 12,
        defaultPaymentFrequency: defaultPaymentFrequency || 'Mensual',
        defaultDownPaymentPercent: defaultDownPaymentPercent || 0,
        terms,
        requiresApproval: requiresApproval ?? true,
        requiresGuarantor: requiresGuarantor ?? false,
        gracePeriodDays: gracePeriodDays || 5,
        lateFeePercent: lateFeePercent || 0,
        isDefault: isDefault || false,
        minAmount,
        maxAmount,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating financing template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
