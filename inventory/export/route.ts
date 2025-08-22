
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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    // Obtener datos del inventario para exportar
    const products = await prisma.product.findMany({
      include: {
        supplier: {
          select: {
            name: true,
            code: true
          }
        },
        stocks: {
          include: {
            location: {
              select: {
                name: true,
                code: true
              }
            }
          }
        },
        _count: {
          select: {
            stocks: true,
            movements: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Generar CSV
    const csvHeader = [
      'Código',
      'Nombre',
      'Descripción',
      'Categoría',
      'Proveedor',
      'Precio Compra',
      'Precio Venta',
      'Stock Total',
      'Stock Mínimo',
      'Stock Máximo',
      'Ubicaciones',
      'Estado',
      'Fecha Vencimiento',
      'Lote',
      'Total Movimientos'
    ].join(',');

    const csvRows = products.map(product => {
      const totalStock = product.stocks ? product.stocks.reduce((sum: number, stock: any) => sum + (stock.currentStock || 0), 0) : 0;
      const locations = product.stocks ? product.stocks.map((stock: any) => `${stock.location?.name || 'N/A'} (${stock.currentStock || 0})`).join('; ') : '';
      const expirationDates = product.stocks ? 
        product.stocks
          .filter((stock: any) => stock.expirationDate)
          .map((stock: any) => new Date(stock.expirationDate).toLocaleDateString())
          .join('; ') : '';
      const batchNumbers = product.stocks ?
        product.stocks
          .filter((stock: any) => stock.batchNumber)
          .map((stock: any) => stock.batchNumber)
          .join('; ') : '';

      return [
        product.code || '',
        `"${product.name || ''}"`,
        `"${product.description || ''}"`,
        `"${product.category || ''}"`,
        `"${product.supplier?.name || ''}"`,
        product.purchasePrice || 0,
        product.salePrice || 0,
        totalStock,
        product.minStock || 0,
        product.maxStock || 0,
        `"${locations}"`,
        product.isActive ? 'Activo' : 'Inactivo',
        `"${expirationDates}"`,
        `"${batchNumbers}"`,
        product._count?.movements || 0
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Configurar headers para descarga
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="inventario_${new Date().toISOString().split('T')[0]}.csv"`);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    // Agregar BOM para compatibilidad con Excel
    const bomCsvContent = '\uFEFF' + csvContent;

    console.log('Exportando CSV con', products.length, 'productos');
    console.log('Tamaño del contenido:', bomCsvContent.length);

    return new NextResponse(bomCsvContent, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error al exportar inventario:', error);
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

    const body = await request.json();
    const { 
      format = 'csv', 
      includeStocks = true, 
      includeMovements = false,
      locationIds = [],
      categoryIds = [],
      supplierIds = []
    } = body;

    let whereClause: any = {};

    // Filtros adicionales
    if (locationIds.length > 0) {
      whereClause.stocks = {
        some: {
          locationId: {
            in: locationIds
          }
        }
      };
    }

    if (categoryIds.length > 0) {
      whereClause.categoryId = {
        in: categoryIds
      };
    }

    if (supplierIds.length > 0) {
      whereClause.supplierId = {
        in: supplierIds
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        supplier: {
          select: {
            name: true,
            code: true
          }
        },
        stocks: includeStocks ? {
          include: {
            location: {
              select: {
                name: true,
                code: true
              }
            }
          }
        } : false,
        movements: includeMovements ? {
          include: {
            location: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100 // Limitar movimientos para evitar archivos muy grandes
        } : false,
        _count: {
          select: {
            stocks: true,
            movements: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Generar CSV personalizado
    const csvHeader = [
      'Código',
      'Nombre',
      'Descripción',
      'Categoría',
      'Proveedor',
      'Precio Compra',
      'Precio Venta',
      'Stock Total',
      'Stock Mínimo',
      'Stock Máximo',
      'Estado',
      ...(includeStocks ? ['Ubicaciones', 'Fecha Vencimiento', 'Lote'] : []),
      ...(includeMovements ? ['Últimos Movimientos'] : [])
    ].join(',');

    const csvRows = products.map(product => {
      const totalStock = includeStocks && product.stocks ? 
        product.stocks.reduce((sum: number, stock: any) => sum + (stock.currentStock || 0), 0) : 0;
      
      const locations = includeStocks && product.stocks ? 
        product.stocks.map((stock: any) => `${stock.location?.name || 'N/A'} (${stock.currentStock || 0})`).join('; ') : '';
      
      const expirationDates = includeStocks && product.stocks ? 
        product.stocks
          .filter((stock: any) => stock.expirationDate)
          .map((stock: any) => new Date(stock.expirationDate).toLocaleDateString())
          .join('; ') : '';
      
      const batchNumbers = includeStocks && product.stocks ?
        product.stocks
          .filter((stock: any) => stock.batchNumber)
          .map((stock: any) => stock.batchNumber)
          .join('; ') : '';

      const lastMovements = includeMovements && product.movements ?
        product.movements.slice(0, 5)
          .map((movement: any) => `${movement.type} ${movement.quantity} - ${new Date(movement.createdAt).toLocaleDateString()}`)
          .join('; ') : '';

      return [
        product.code || '',
        `"${product.name || ''}"`,
        `"${product.description || ''}"`,
        `"${product.category || ''}"`,
        `"${product.supplier?.name || ''}"`,
        product.purchasePrice || 0,
        product.salePrice || 0,
        totalStock,
        product.minStock || 0,
        product.maxStock || 0,
        product.isActive ? 'Activo' : 'Inactivo',
        ...(includeStocks ? [`"${locations}"`, `"${expirationDates}"`, `"${batchNumbers}"`] : []),
        ...(includeMovements ? [`"${lastMovements}"`] : [])
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="inventario_personalizado_${new Date().toISOString().split('T')[0]}.csv"`);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    const bomCsvContent = '\uFEFF' + csvContent;

    console.log('Exportando CSV personalizado con', products.length, 'productos');
    console.log('Tamaño del contenido:', bomCsvContent.length);

    return new NextResponse(bomCsvContent, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error al exportar inventario personalizado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
