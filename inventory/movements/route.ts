
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const locationId = searchParams.get('locationId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true
          }
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        treatment: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const total = await prisma.inventoryMovement.count({ where });

    return NextResponse.json({
      movements,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
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
      productId,
      locationId,
      type,
      subtype,
      quantity,
      unitCost,
      lotNumber,
      expirationDate,
      reference,
      documentNumber,
      description,
      notes,
      supplierId,
      patientId,
      treatmentId
    } = body;

    // Validar que el producto y ubicación existan
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    // Obtener stock actual en la ubicación
    const currentStock = await prisma.stock.findFirst({
      where: {
        productId,
        locationId,
        lotNumber: lotNumber || null
      }
    });

    const currentQuantity = currentStock?.quantity || 0;
    const movementQuantity = parseInt(quantity.toString());

    // Validar que hay suficiente stock para salidas
    if ((type === 'SALIDA' || type === 'CONSUMO') && currentQuantity < Math.abs(movementQuantity)) {
      return NextResponse.json(
        { error: 'Stock insuficiente para realizar el movimiento' },
        { status: 400 }
      );
    }

    // Calcular nueva cantidad
    let newQuantity = currentQuantity;
    if (type === 'ENTRADA') {
      newQuantity += Math.abs(movementQuantity);
    } else if (type === 'SALIDA' || type === 'CONSUMO') {
      newQuantity -= Math.abs(movementQuantity);
    } else if (type === 'AJUSTE') {
      newQuantity = Math.abs(movementQuantity);
    }

    // Crear el movimiento
    const movement = await prisma.inventoryMovement.create({
      data: {
        productId,
        locationId,
        type,
        subtype: subtype || null,
        quantity: type === 'ENTRADA' ? Math.abs(movementQuantity) : -Math.abs(movementQuantity),
        quantityBefore: currentQuantity,
        quantityAfter: newQuantity,
        unitCost: unitCost ? parseFloat(unitCost.toString()) : null,
        totalCost: unitCost ? Math.abs(movementQuantity) * parseFloat(unitCost.toString()) : null,
        lotNumber: lotNumber || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        reference: reference || null,
        documentNumber: documentNumber || null,
        description: description || null,
        notes: notes || null,
        supplierId: supplierId || null,
        patientId: patientId || null,
        treatmentId: treatmentId || null,
        userId: session.user.id
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true
          }
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Actualizar o crear stock
    const stockData = {
      quantity: newQuantity,
      available: newQuantity, // Por ahora, disponible = cantidad total
      unitCost: unitCost ? parseFloat(unitCost.toString()) : currentStock?.unitCost || 0,
      totalValue: newQuantity * (unitCost ? parseFloat(unitCost.toString()) : Number(currentStock?.unitCost) || 0),
      lastMovement: new Date(),
      ...(lotNumber && { lotNumber }),
      ...(expirationDate && { expirationDate: new Date(expirationDate) })
    };

    if (currentStock) {
      await prisma.stock.update({
        where: { id: currentStock.id },
        data: stockData
      });
    } else {
      await prisma.stock.create({
        data: {
          productId,
          locationId,
          ...stockData
        }
      });
    }

    // Actualizar stock total del producto
    const totalStock = await prisma.stock.aggregate({
      where: { productId },
      _sum: { quantity: true }
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        totalStock: totalStock._sum.quantity || 0,
        ...(unitCost && type === 'ENTRADA' && {
          purchasePrice: parseFloat(unitCost.toString())
        })
      }
    });

    // Verificar si se debe crear una alerta de stock bajo
    if (newQuantity <= product.minStock) {
      const existingAlert = await prisma.inventoryAlert.findFirst({
        where: {
          productId,
          type: 'stock_bajo',
          isResolved: false
        }
      });

      if (!existingAlert) {
        await prisma.inventoryAlert.create({
          data: {
            productId,
            type: 'stock_bajo',
            message: `El producto ${product.name} tiene stock bajo (${newQuantity} ${product.unit})`,
            priority: newQuantity === 0 ? 'Alta' : 'Normal'
          }
        });
      }
    }

    return NextResponse.json(movement);

  } catch (error) {
    console.error('Error al crear movimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
