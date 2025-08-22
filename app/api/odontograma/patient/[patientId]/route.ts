
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { patientId } = params;

    const odontogramas = await prisma.odontograma.findMany({
      where: {
        patientId: patientId,
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Parsear los JSON strings
    const odontogramasFormateados = odontogramas.map(o => ({
      ...o,
      datos: o.datos ? JSON.parse(o.datos) : [],
      tratamientosSugeridos: o.tratamientosSugeridos ? JSON.parse(o.tratamientosSugeridos) : [],
    }));

    return NextResponse.json(odontogramasFormateados);
  } catch (error) {
    console.error('Error al obtener odontogramas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
