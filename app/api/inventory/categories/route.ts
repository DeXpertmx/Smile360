
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

    // Obtener categorías únicas de productos
    const categories = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        category: true
      },
      distinct: ['category']
    });

    const categoryList = categories.map(p => p.category).filter(Boolean).sort();

    return NextResponse.json({
      success: true,
      categories: categoryList,
      count: categoryList.length
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
