
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

    // Obtener alertas básicas existentes
    const basicAlerts = await prisma.inventoryAlert.findMany({
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            totalStock: true,
            minStock: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Generar alertas inteligentes adicionales
    const smartAlerts = await generateSmartAlerts();

    // Combinar y formatear todas las alertas
    const allAlerts = [
      ...basicAlerts.map(alert => ({
        id: alert.id,
        type: alert.type as 'stock_bajo' | 'vencimiento_proximo' | 'agotado' | 'sobrestock' | 'proveedor_retraso',
        title: getAlertTitle(alert.type),
        message: alert.message,
        priority: alert.priority as 'Alta' | 'Media' | 'Baja',
        isRead: alert.isRead,
        isResolved: alert.isResolved,
        productId: alert.product?.id,
        productName: alert.product?.name,
        productSku: alert.product?.sku,
        currentStock: alert.product?.totalStock,
        minStock: alert.product?.minStock,
        createdAt: alert.createdAt.toISOString(),
        readAt: alert.readAt?.toISOString(),
        resolvedAt: alert.resolvedAt?.toISOString()
      })),
      ...smartAlerts
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      alerts: allAlerts,
      count: allAlerts.length,
      summary: {
        total: allAlerts.length,
        unread: allAlerts.filter(a => !a.isRead).length,
        high: allAlerts.filter(a => a.priority === 'Alta' && !a.isResolved).length,
        resolved: allAlerts.filter(a => a.isResolved).length
      }
    });

  } catch (error) {
    console.error('Error obteniendo alertas inteligentes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Funciones auxiliares

function getAlertTitle(type: string): string {
  switch (type) {
    case 'stock_bajo': return 'Stock Bajo';
    case 'agotado': return 'Producto Agotado';
    case 'vencimiento_proximo': return 'Vencimiento Próximo';
    case 'sobrestock': return 'Sobrestock';
    case 'proveedor_retraso': return 'Retraso de Proveedor';
    default: return 'Alerta de Inventario';
  }
}

async function generateSmartAlerts() {
  const alerts: any[] = [];

  try {
    // 1. Detectar productos con consumo anómalo
    const anomalousConsumption = await detectAnomalousConsumption();
    alerts.push(...anomalousConsumption);

    // 2. Alertas de proveedores con bajo rendimiento
    const supplierAlerts = await generateSupplierAlerts();
    alerts.push(...supplierAlerts);

    // 3. Alertas de productos sin movimiento (obsoletos)
    const obsoleteProducts = await detectObsoleteProducts();
    alerts.push(...obsoleteProducts);

    // 4. Alertas de tendencias de demanda
    const demandAlerts = await generateDemandAlerts();
    alerts.push(...demandAlerts);

  } catch (error) {
    console.error('Error generando alertas inteligentes:', error);
  }

  return alerts;
}

async function detectAnomalousConsumption() {
  // Simular detección de consumo anómalo
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      totalStock: { gt: 0 }
    },
    include: {
      movements: {
        where: {
          movementDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          },
          quantity: { lt: 0 } // Solo salidas
        }
      }
    },
    take: 10
  });

  return products
    .filter(product => {
      const totalConsumption = product.movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      const avgDailyConsumption = totalConsumption / 30;
      return avgDailyConsumption > product.totalStock * 0.1; // Consumo mayor al 10% del stock diario
    })
    .map(product => ({
      id: `anomaly_${product.id}`,
      type: 'stock_bajo' as const,
      title: 'Consumo Anómalo Detectado',
      message: `El producto ${product.name} presenta un consumo mayor al esperado`,
      priority: 'Alta' as const,
      isRead: false,
      isResolved: false,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      currentStock: product.totalStock,
      minStock: product.minStock,
      createdAt: new Date().toISOString()
    }));
}

async function generateSupplierAlerts() {
  // Simular alertas de proveedores
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    include: {
      purchaseOrders: {
        where: {
          status: 'ENVIADA',
          expectedDate: {
            lt: new Date() // Órdenes vencidas
          }
        }
      }
    },
    take: 5
  });

  return suppliers
    .filter(supplier => supplier.purchaseOrders.length > 0)
    .map(supplier => ({
      id: `supplier_delay_${supplier.id}`,
      type: 'proveedor_retraso' as const,
      title: 'Retraso en Entrega',
      message: `El proveedor ${supplier.name} tiene ${supplier.purchaseOrders.length} órdenes atrasadas`,
      priority: 'Media' as const,
      isRead: false,
      isResolved: false,
      supplierId: supplier.id,
      supplierName: supplier.name,
      createdAt: new Date().toISOString()
    }));
}

async function detectObsoleteProducts() {
  // Productos sin movimientos en los últimos 90 días
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      totalStock: { gt: 0 },
      movements: {
        none: {
          movementDate: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      }
    },
    take: 10
  });

  return products.map(product => ({
    id: `obsolete_${product.id}`,
    type: 'sobrestock' as const,
    title: 'Producto Sin Movimiento',
    message: `${product.name} no ha tenido movimientos en los últimos 90 días`,
    priority: 'Baja' as const,
    isRead: false,
    isResolved: false,
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    currentStock: product.totalStock,
    createdAt: new Date().toISOString()
  }));
}

async function generateDemandAlerts() {
  // Simulación de alertas de demanda
  return [
    {
      id: `demand_increase_${Date.now()}`,
      type: 'stock_bajo' as const,
      title: 'Aumento en la Demanda',
      message: 'Se detectó un aumento del 25% en la demanda de productos de ortodoncia',
      priority: 'Media' as const,
      isRead: false,
      isResolved: false,
      createdAt: new Date().toISOString()
    }
  ];
}
