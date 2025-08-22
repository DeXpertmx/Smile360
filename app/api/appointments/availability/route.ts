


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
    const date = searchParams.get('date');
    const doctorId = searchParams.get('doctorId');
    
    if (!date || !doctorId) {
      return NextResponse.json(
        { error: 'Fecha y doctor son requeridos' },
        { status: 400 }
      );
    }

    // Obtener todas las citas del doctor para la fecha específica
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          not: 'Cancelada'
        }
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        type: true,
        status: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Transformar para incluir información del paciente
    const occupiedSlots = appointments.map(apt => ({
      id: apt.id,
      startTime: apt.startTime,
      endTime: apt.endTime,
      patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
      type: apt.type,
      status: apt.status
    }));

    return NextResponse.json(occupiedSlots);

  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


