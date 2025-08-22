
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const canView = session.user?.role === 'ADMIN' || 
                   session.user?.role === 'DOCTOR';
                   // @ts-ignore - permisos property might not exist in type
                   // || session.user?.permisos?.includes('GASTOS_VER');

    if (!canView) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let where: any = {};

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const canCreate = session.user?.role === 'ADMIN' || 
                     session.user?.role === 'DOCTOR';
                     // @ts-ignore - permisos property might not exist in type
                     // || session.user?.permisos?.includes('GASTOS_CREAR');

    if (!canCreate) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    const data = await request.json();
    const {
      description,
      amount,
      categoryId,
      expenseDate,
      paymentMethod,
      vendor,
      invoiceNumber,
      receiptNumber,
      taxAmount,
      totalAmount,
      status,
      notes,
      receiptUrl,
      taxDeductible,
      isRecurring,
      recurringType,
      tags,
      requiresApproval
    } = data;

    // Validation
    if (!description?.trim() || !amount || !categoryId || !expenseDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: descripción, monto, categoría y fecha' },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe y está activa
    const category = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        isActive: true
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no válida o inactiva' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        description: description.trim(),
        amount: parseFloat(amount),
        taxAmount: parseFloat(taxAmount || 0),
        totalAmount: parseFloat(totalAmount || amount),
        categoryId,
        expenseDate: new Date(expenseDate),
        paymentMethod: paymentMethod || 'Efectivo',
        vendor: vendor?.trim() || null,
        invoiceNumber: invoiceNumber?.trim() || null,
        receiptNumber: receiptNumber?.trim() || null,
        status: status || 'Pendiente',
        notes: notes?.trim() || null,
        receiptUrl: receiptUrl || null,
        taxDeductible: taxDeductible || false,
        isRecurring: isRecurring || false,
        recurringType: recurringType || null,
        tags: tags?.trim() || null,
        requiresApproval: requiresApproval || false,
        isApproved: !requiresApproval, // Si no requiere aprobación, se marca como aprobado automáticamente
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
