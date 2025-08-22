
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            purchasePrice: true,
            totalStock: true
          }
        },
        purchaseOrders: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            status: true,
            total: true
          },
          orderBy: { orderDate: 'desc' },
          take: 10
        },
        _count: {
          select: {
            products: true,
            purchaseOrders: true
          }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);

  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      isActive,
      isPreferred
    } = body;

    // Verificar que el código no exista en otro proveedor
    const existingSupplier = await prisma.supplier.findFirst({
      where: { 
        code,
        NOT: { id: params.id }
      }
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Ya existe otro proveedor con este código' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
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
        isActive: isActive !== undefined ? isActive : true,
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
    console.error('Error al actualizar proveedor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si el proveedor tiene productos asociados
    const productsCount = await prisma.product.count({
      where: { supplierId: params.id }
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el proveedor porque tiene productos asociados' },
        { status: 400 }
      );
    }

    // Verificar si el proveedor tiene órdenes de compra
    const ordersCount = await prisma.purchaseOrder.count({
      where: { supplierId: params.id }
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el proveedor porque tiene órdenes de compra asociadas' },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Proveedor eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
