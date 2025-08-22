
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
    const category = searchParams.get('category');
    const supplierId = searchParams.get('supplierId');
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search');

    const where: any = {
      isActive: true
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        stocks: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        _count: {
          select: {
            movements: true,
            alerts: true
          }
        }
      }
    });

    // Filtrar productos con stock bajo si se solicita
    let filteredProducts = products;
    if (lowStock) {
      filteredProducts = products.filter(product => 
        product.totalStock <= product.minStock
      );
    }

    return NextResponse.json(filteredProducts);

  } catch (error) {
    console.error('Error al obtener productos:', error);
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
      sku,
      code,
      name,
      description,
      category,
      subcategory,
      brand,
      model,
      supplierId,
      supplierCode,
      purchasePrice,
      salePrice,
      unit,
      presentation,
      minStock,
      maxStock,
      reorderPoint,
      requiresLot,
      hasExpiration,
      isConsumable,
      barcode,
      initialStock,
      locationId
    } = body;

    // Verificar que el SKU no exista
    const existingSku = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este SKU' },
        { status: 400 }
      );
    }

    // Verificar que el código no exista
    const existingCode = await prisma.product.findUnique({
      where: { code }
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este código' },
        { status: 400 }
      );
    }

    // Obtener ubicación por defecto si no se especifica
    let defaultLocationId = locationId;
    if (!defaultLocationId) {
      const defaultLocation = await prisma.location.findFirst({
        where: { isDefault: true }
      });
      if (defaultLocation) {
        defaultLocationId = defaultLocation.id;
      }
    }

    const product = await prisma.product.create({
      data: {
        sku,
        code,
        name,
        description: description || null,
        category,
        subcategory: subcategory || null,
        brand: brand || null,
        model: model || null,
        supplierId: supplierId || null,
        supplierCode: supplierCode || null,
        purchasePrice: parseFloat(purchasePrice?.toString() || '0'),
        averageCost: parseFloat(purchasePrice?.toString() || '0'),
        salePrice: parseFloat(salePrice?.toString() || '0'),
        unit: unit || 'UNIDAD',
        presentation: presentation || null,
        totalStock: parseInt(initialStock?.toString() || '0'),
        minStock: parseInt(minStock?.toString() || '0'),
        maxStock: parseInt(maxStock?.toString() || '0'),
        reorderPoint: parseInt(reorderPoint?.toString() || '0'),
        requiresLot: requiresLot || false,
        hasExpiration: hasExpiration || false,
        isConsumable: isConsumable !== undefined ? isConsumable : true,
        barcode: barcode || null,
        isActive: true
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Si hay stock inicial y ubicación, crear stock y movimiento
    if (initialStock && parseInt(initialStock.toString()) > 0 && defaultLocationId) {
      const stockQuantity = parseInt(initialStock.toString());
      const unitCost = parseFloat(purchasePrice?.toString() || '0');

      // Crear stock en la ubicación
      await prisma.stock.create({
        data: {
          productId: product.id,
          locationId: defaultLocationId,
          quantity: stockQuantity,
          available: stockQuantity,
          unitCost: unitCost,
          totalValue: stockQuantity * unitCost
        }
      });

      // Crear movimiento de stock inicial
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          locationId: defaultLocationId,
          type: 'ENTRADA',
          subtype: 'STOCK_INICIAL',
          quantity: stockQuantity,
          quantityBefore: 0,
          quantityAfter: stockQuantity,
          unitCost: unitCost,
          totalCost: stockQuantity * unitCost,
          description: 'Stock inicial del producto',
          userId: session.user.id
        }
      });
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
