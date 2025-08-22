
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const categoria = searchParams.get('categoria');
    const clinica = searchParams.get('clinica');
    const busqueda = searchParams.get('busqueda');

    const where: any = {};

    // Filtros de fecha
    if (fechaInicio && fechaFin) {
      where.expenseDate = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    } else if (fechaInicio) {
      where.expenseDate = {
        gte: new Date(fechaInicio)
      };
    } else if (fechaFin) {
      where.expenseDate = {
        lte: new Date(fechaFin)
      };
    }

    // Filtro de categoría
    if (categoria) {
      where.categoryId = categoria;
    }

    // Filtro de búsqueda
    if (busqueda) {
      where.OR = [
        { description: { contains: busqueda, mode: 'insensitive' } },
        { vendor: { contains: busqueda, mode: 'insensitive' } },
        { invoiceNumber: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        expenseDate: 'desc'
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const expenseData = {
      expenseDate: new Date(formData.get('fecha') as string),
      amount: parseFloat(formData.get('monto') as string),
      totalAmount: parseFloat(formData.get('monto') as string),
      categoryId: formData.get('categoriaId') as string,
      description: formData.get('descripcion') as string,
      paymentMethod: formData.get('metodoPago') as string,
      vendor: formData.get('proveedor') as string || null,
      invoiceNumber: formData.get('numeroFactura') as string || null,
      notes: formData.get('observaciones') as string || null,
      userId: session.user.id,
      status: 'Pagado'
    };

    // Procesar archivos de comprobantes (guardados pero no vinculados por ahora)
    const receipts: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('receipt_') && value instanceof File) {
        receipts.push(value);
      }
    }

    // Guardar archivos en el sistema de archivos
    if (receipts.length > 0) {
      const uploadsDir = join(process.cwd(), 'uploads', 'expenses');
      await mkdir(uploadsDir, { recursive: true });

      for (const receipt of receipts) {
        const bytes = await receipt.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const filename = `${Date.now()}-${receipt.name}`;
        const filepath = join(uploadsDir, filename);
        
        await writeFile(filepath, buffer);
        // Nota: Los comprobantes se guardan en el sistema de archivos 
        // pero no se vinculan al modelo por ahora
      }
    }

    const expense = await prisma.expense.create({
      data: expenseData,
      include: {
        category: true
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
