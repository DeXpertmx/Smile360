
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

    // Métricas generales
    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    });

    const totalSuppliers = await prisma.supplier.count({
      where: { isActive: true }
    });

    const totalLocations = await prisma.location.count({
      where: { isActive: true }
    });

    // Valor total del inventario
    const inventoryValue = await prisma.stock.aggregate({
      _sum: { totalValue: true }
    });

    // Productos con stock bajo
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        totalStock: { lte: prisma.product.fields.minStock }
      },
      select: {
        id: true,
        sku: true,
        name: true,
        totalStock: true,
        minStock: true,
        unit: true,
        category: true
      }
    });

    // Productos sin stock
    const outOfStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        totalStock: 0
      }
    });

    // Alertas activas
    const activeAlerts = await prisma.inventoryAlert.count({
      where: {
        isResolved: false
      }
    });

    // Movimientos recientes
    const recentMovements = await prisma.inventoryMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
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

    // Productos más utilizados (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const mostUsedProducts = await prisma.inventoryMovement.groupBy({
      by: ['productId'],
      where: {
        type: { in: ['SALIDA', 'CONSUMO'] },
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    // Obtener detalles de los productos más utilizados
    const mostUsedProductsDetails = await Promise.all(
      mostUsedProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
            category: true
          }
        });
        return {
          ...product,
          totalUsed: Math.abs(item._sum.quantity || 0)
        };
      })
    );

    // Distribución por categorías
    const categoryDistribution = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
      _sum: { totalStock: true }
    });

    // Movimientos por tipo (últimos 30 días)
    const movementsByType = await prisma.inventoryMovement.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { type: true },
      _sum: { quantity: true }
    });

    return NextResponse.json({
      metrics: {
        totalProducts,
        totalSuppliers,
        totalLocations,
        inventoryValue: inventoryValue._sum.totalValue || 0,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts,
        activeAlertsCount: activeAlerts
      },
      lowStockProducts,
      recentMovements,
      mostUsedProducts: mostUsedProductsDetails,
      categoryDistribution,
      movementsByType
    });

  } catch (error) {
    console.error('Error al obtener dashboard de inventario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
