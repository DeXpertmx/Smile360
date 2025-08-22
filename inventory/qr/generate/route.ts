
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productIds, format = 'png' } = await req.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Lista de productos requerida' }, { status: 400 });
    }

    // Obtener productos
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        },
        isActive: true
      },
      select: {
        id: true,
        sku: true,
        name: true,
        category: true,
        brand: true,
        salePrice: true,
        totalStock: true
      }
    });

    // Generar códigos QR
    const qrCodes = await Promise.all(
      products.map(async (product) => {
        const qrData = {
          id: product.id,
          sku: product.sku,
          name: product.name,
          type: 'inventory_product',
          generated: new Date().toISOString()
        };

        const qrString = JSON.stringify(qrData);
        const qrDataUrl = await QRCode.toDataURL(qrString, {
          errorCorrectionLevel: 'M',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 200
        });

        return {
          productId: product.id,
          product,
          qrCode: qrDataUrl,
          qrData: qrString
        };
      })
    );

    // Registrar actividad - comentado por ahora
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: {
    //     lastActivity: new Date()
    //   }
    // });

    return NextResponse.json({
      success: true,
      qrCodes,
      count: qrCodes.length
    });

  } catch (error) {
    console.error('Error generando códigos QR:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
