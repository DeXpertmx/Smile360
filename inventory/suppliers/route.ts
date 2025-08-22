
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

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        _count: {
          select: {
            products: true,
            purchaseOrders: true
          }
        }
      }
    });

    return NextResponse.json(suppliers);

  } catch (error) {
    console.error('Error al obtener proveedores:', error);
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
      commercialName,
      contactPerson,
      phone,
      email,
      website,
      address,
      city,
      state,
      postalCode,
      country,
      taxId,
      vatNumber,
      paymentTerms,
      creditLimit,
      discount,
      bankName,
      bankAccount,
      deliveryDays,
      minOrderAmount,
      rating,
      notes,
      isPreferred
    } = body;

    // Verificar que el código no exista
    const existingSupplier = await prisma.supplier.findUnique({
      where: { code }
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con este código' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        code,
        name,
        commercialName: commercialName || null,
        contactPerson: contactPerson || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        address: address || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || 'México',
        taxId: taxId || null,
        vatNumber: vatNumber || null,
        paymentTerms: paymentTerms || null,
        creditLimit: creditLimit ? parseFloat(creditLimit.toString()) : null,
        discount: discount ? parseFloat(discount.toString()) : 0,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
        deliveryDays: deliveryDays ? parseInt(deliveryDays.toString()) : 7,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount.toString()) : null,
        rating: rating ? parseInt(rating.toString()) : 5,
        notes: notes || null,
        isPreferred: isPreferred || false
      },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true
          }
        }
      }
    });

    return NextResponse.json(supplier);

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
