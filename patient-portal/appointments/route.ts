
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar paciente por email
    const patient = await prisma.patient.findFirst({
      where: { 
        email: session.user.email 
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    // Obtener citas del paciente
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            especialidad: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ appointments });

  } catch (error) {
    console.error('Error obteniendo citas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const patient = await prisma.patient.findFirst({
      where: { 
        email: session.user.email 
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { date, time, treatment, notes } = body;

    // Buscar un doctor disponible (por ahora tomar el primero)
    const defaultDoctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' }
    });

    if (!defaultDoctor) {
      return NextResponse.json({ error: 'No hay doctores disponibles' }, { status: 500 });
    }

    // Crear solicitud de cita con campos requeridos
    const appointmentDate = new Date(`${date} ${time}`);
    const startTime = time; // Ya viene como string HH:MM
    const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
    const endTime = endDate.toTimeString().substring(0, 5); // Convertir a HH:MM

    const appointment = await prisma.appointment.create({
      data: {
        organizationId: patient.organizationId,
        patientId: patient.id,
        date: appointmentDate,
        startTime,
        endTime,
        type: treatment,
        notes,
        status: 'Programada',
        doctorId: defaultDoctor.id
      }
    });

    return NextResponse.json({ appointment });

  } catch (error) {
    console.error('Error creando cita:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
