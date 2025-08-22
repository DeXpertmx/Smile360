
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const category = searchParams.get('category') || 'all';
    const supplier = searchParams.get('supplier') || 'all';

    // Filtros base
    const productFilter: any = {
      isActive: true,
      ...(category !== 'all' && { category })
    };

    const movementFilter: any = {
      movementDate: {
        gte: startDate,
        lte: endDate
      },
      ...(category !== 'all' && { 
        product: { category } 
      })
    };

    // 1. Valor total del inventario
    const inventoryValue = await calculateInventoryValue(productFilter);

    // 2. Rotación de productos
    const productRotation = await calculateProductRotation(productFilter, startDate, endDate);

    // 3. Performance de proveedores
    const supplierPerformance = await calculateSupplierPerformance(supplier, startDate, endDate);

    // 4. Consumo por tratamiento
    const consumptionByTreatment = await calculateConsumptionByTreatment(startDate, endDate);

    // 5. Alertas de stock
    const stockAlerts = await calculateStockAlerts();

    // 6. Tendencias de movimientos
    const movementsTrend = await calculateMovementsTrend(movementFilter);

    return NextResponse.json({
      inventoryValue,
      productRotation,
      supplierPerformance,
      consumptionByTreatment,
      stockAlerts,
      movementsTrend,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        category,
        supplier
      }
    });

  } catch (error) {
    console.error('Error generando reporte avanzado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Funciones auxiliares

async function calculateInventoryValue(productFilter: any) {
  const products = await prisma.product.findMany({
    where: productFilter,
    select: {
      id: true,
      category: true,
      totalStock: true,
      averageCost: true,
      salePrice: true
    }
  });

  const total = products.reduce((sum, product) => {
    return sum + (product.totalStock * Number(product.averageCost));
  }, 0);

  const byCategory = products.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.category === product.category);
    const value = product.totalStock * Number(product.averageCost);
    
    if (existing) {
      existing.value += value;
      existing.count += 1;
    } else {
      acc.push({
        category: product.category,
        value,
        count: 1
      });
    }
    return acc;
  }, []);

  // Calcular tendencia (simulada por ahora)
  const trend = Math.random() * 20 - 10; // Entre -10% y +10%

  return {
    total,
    byCategory,
    trend
  };
}

async function calculateProductRotation(productFilter: any, startDate: Date, endDate: Date) {
  const products = await prisma.product.findMany({
    where: productFilter,
    include: {
      movements: {
        where: {
          movementDate: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _count: {
        select: {
          movements: {
            where: {
              movementDate: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      }
    },
    take: 50 // Limitar para performance
  });

  return products.map(product => {
    const totalMovements = product._count.movements;
    const avgStock = product.totalStock || 1;
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // Calcular salidas en el período
    const exits = product.movements
      .filter(m => m.quantity < 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    const rotationRate = avgStock > 0 ? (exits / avgStock) : 0;
    const dailyConsumption = exits / daysDiff;
    const daysToDepletion = dailyConsumption > 0 ? Math.ceil(product.totalStock / dailyConsumption) : -1;
    
    let status: 'high' | 'medium' | 'low' | 'stagnant';
    if (rotationRate >= 2) status = 'high';
    else if (rotationRate >= 1) status = 'medium';
    else if (rotationRate >= 0.5) status = 'low';
    else status = 'stagnant';

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      totalMovements,
      rotationRate,
      daysToDepletion,
      status
    };
  }).sort((a, b) => b.rotationRate - a.rotationRate);
}

async function calculateSupplierPerformance(supplierId: string, startDate: Date, endDate: Date) {
  const filter = {
    ...(supplierId !== 'all' && { id: supplierId }),
    isActive: true
  };

  const suppliers = await prisma.supplier.findMany({
    where: filter,
    include: {
      purchaseOrders: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
    take: 20
  });

  return suppliers.map(supplier => {
    const orders = supplier.purchaseOrders;
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + Number(order.total), 0);
    
    // Calcular tiempo promedio de entrega
    const deliveredOrders = orders.filter(order => order.receivedDate);
    const avgDeliveryDays = deliveredOrders.length > 0 
      ? Math.ceil(deliveredOrders.reduce((sum, order) => {
          const orderDate = new Date(order.orderDate);
          const receivedDate = new Date(order.receivedDate!);
          return sum + (receivedDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        }, 0) / deliveredOrders.length)
      : 0;

    // Calcular puntualidad (simulado)
    const onTimeDelivery = Math.min(100, Math.max(60, 100 - (avgDeliveryDays - supplier.deliveryDays) * 5));
    
    // Determinar status
    let status: 'excellent' | 'good' | 'average' | 'poor';
    if (onTimeDelivery >= 90 && avgDeliveryDays <= supplier.deliveryDays) status = 'excellent';
    else if (onTimeDelivery >= 80) status = 'good';
    else if (onTimeDelivery >= 70) status = 'average';
    else status = 'poor';

    return {
      supplierId: supplier.id,
      name: supplier.name,
      totalOrders,
      totalAmount,
      avgDeliveryDays,
      onTimeDelivery: Math.round(onTimeDelivery),
      qualityRating: supplier.rating,
      status
    };
  });
}

async function calculateConsumptionByTreatment(startDate: Date, endDate: Date) {
  const consumptions = await prisma.materialConsumption.findMany({
    where: {
      consumedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      treatment: {
        select: {
          category: true
        }
      }
    }
  });

  const grouped = consumptions.reduce((acc: any, consumption) => {
    const treatmentType = consumption.treatment.category;
    if (!acc[treatmentType]) {
      acc[treatmentType] = {
        treatmentType,
        totalCost: 0,
        productCount: 0,
        treatments: new Set()
      };
    }
    
    acc[treatmentType].totalCost += Number(consumption.totalCost);
    acc[treatmentType].productCount += 1;
    acc[treatmentType].treatments.add(consumption.treatmentId);
    
    return acc;
  }, {});

  return Object.values(grouped).map((item: any) => ({
    treatmentType: item.treatmentType,
    totalCost: item.totalCost,
    productCount: item.productCount,
    avgCostPerTreatment: item.treatments.size > 0 ? item.totalCost / item.treatments.size : 0
  }));
}

async function calculateStockAlerts() {
  const [lowStock, outOfStock, expiringProducts, overstock] = await Promise.all([
    // Simular conteos para las alertas de stock
    Promise.resolve(Math.floor(Math.random() * 20) + 5), // lowStock
    Promise.resolve(Math.floor(Math.random() * 10) + 1), // outOfStock
    Promise.resolve(Math.floor(Math.random() * 15) + 2), // expiringProducts
    Promise.resolve(Math.floor(Math.random() * 8) + 1)   // overstock
  ]);

  return {
    lowStock,
    outOfStock,
    expiringProducts,
    overstock
  };
}

async function calculateMovementsTrend(movementFilter: any) {
  const movements = await prisma.inventoryMovement.findMany({
    where: movementFilter,
    select: {
      movementDate: true,
      quantity: true,
      type: true
    }
  });

  // Agrupar por día
  const grouped = movements.reduce((acc: any, movement) => {
    const date = movement.movementDate.toISOString().split('T')[0];
    
    if (!acc[date]) {
      acc[date] = {
        date,
        entries: 0,
        exits: 0,
        adjustments: 0,
        net: 0
      };
    }
    
    const quantity = movement.quantity;
    
    if (movement.type === 'ENTRADA') {
      acc[date].entries += Math.abs(quantity);
    } else if (movement.type === 'SALIDA') {
      acc[date].exits += Math.abs(quantity);
    } else {
      acc[date].adjustments += Math.abs(quantity);
    }
    
    acc[date].net += quantity;
    
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
