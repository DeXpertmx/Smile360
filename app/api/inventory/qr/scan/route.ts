
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { qrData } = await req.json();

    if (!qrData) {
      return NextResponse.json({ error: 'Datos QR requeridos' }, { status: 400 });
    }

    try {
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.type !== 'inventory_product' || !parsedData.id) {
        return NextResponse.json({ error: 'QR no válido para inventario' }, { status: 400 });
      }

      // Buscar producto
      const product = await prisma.product.findUnique({
        where: {
          id: parsedData.id,
          isActive: true
        },
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
              transactions: true
            }
          }
        }
      });

      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }

      // Registrar el scan en la actividad del usuario
      // await prisma.user.update({
      //   where: { id: session.user.id },
      //   data: {
      //     lastActivity: new Date()
      //   }
      // });

      return NextResponse.json({
        success: true,
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          model: product.model,
          purchasePrice: product.purchasePrice,
          averageCost: product.averageCost,
          salePrice: product.salePrice,
          unit: product.unit,
          presentation: product.presentation,
          totalStock: product.totalStock,
          minStock: product.minStock,
          maxStock: product.maxStock,
          reorderPoint: product.reorderPoint,
          isActive: product.isActive,
          requiresLot: product.requiresLot,
          hasExpiration: product.hasExpiration,
          supplier: product.supplier,
          locations: product.stocks.map(stock => ({
            location: stock.location,
            stock: stock.quantity,
            reserved: stock.reserved,
            available: stock.available
          })),
          movementCount: product._count.movements,
          transactionCount: product._count.transactions,
          scannedAt: new Date().toISOString()
        }
      });

    } catch (parseError) {
      return NextResponse.json({ error: 'Formato QR inválido' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error escaneando QR:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
