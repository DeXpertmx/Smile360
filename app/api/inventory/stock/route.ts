
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
    const locationId = searchParams.get('locationId');
    const productId = searchParams.get('productId');
    const lowStock = searchParams.get('lowStock') === 'true';
    const zeroStock = searchParams.get('zeroStock') === 'true';

    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (zeroStock) {
      where.quantity = 0;
    } else if (lowStock) {
      // Para stock bajo, necesitamos hacer un join con product
      where.product = {
        OR: [
          { totalStock: { lte: { product: { minStock: true } } } }
        ]
      };
    }

    const stocks = await prisma.stock.findMany({
      where,
      orderBy: [
        { quantity: 'asc' },
        { product: { name: 'asc' } }
      ],
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true,
            minStock: true,
            maxStock: true,
            totalStock: true,
            supplier: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true
          }
        }
      }
    });

    // Filtrar stock bajo manualmente si es necesario
    let filteredStocks = stocks;
    if (lowStock && !zeroStock) {
      filteredStocks = stocks.filter(stock => 
        stock.quantity <= stock.product.minStock && stock.quantity > 0
      );
    }

    return NextResponse.json(filteredStocks);

  } catch (error) {
    console.error('Error al obtener stock:', error);
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
      quantity,
      minStock,
      maxStock,
      unitCost,
      lotNumber,
      expirationDate
    } = body;

    // Verificar que no exista ya stock para este producto/ubicación/lote
    const existingStock = await prisma.stock.findFirst({
      where: {
        productId,
        locationId,
        lotNumber: lotNumber || null
      }
    });

    if (existingStock) {
      return NextResponse.json(
        { error: 'Ya existe stock para este producto en esta ubicación' },
        { status: 400 }
      );
    }

    const stock = await prisma.stock.create({
      data: {
        productId,
        locationId,
        quantity: parseInt(quantity.toString()),
        available: parseInt(quantity.toString()),
        minStock: parseInt(minStock?.toString() || '0'),
        maxStock: parseInt(maxStock?.toString() || '0'),
        unitCost: parseFloat(unitCost?.toString() || '0'),
        totalValue: parseInt(quantity.toString()) * parseFloat(unitCost?.toString() || '0'),
        lotNumber: lotNumber || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null
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
        }
      }
    });

    // Actualizar stock total del producto
    const totalStock = await prisma.stock.aggregate({
      where: { productId },
      _sum: { quantity: true }
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        totalStock: totalStock._sum.quantity || 0
      }
    });

    return NextResponse.json(stock);

  } catch (error) {
    console.error('Error al crear stock:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
