
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es un paciente
    const patient = await prisma.patient.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email }
        ]
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    // Obtener órdenes de tratamiento del paciente
    const treatmentOrders = await prisma.treatmentOrder.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            especialidad: true
          }
        },
        budget: {
          select: {
            budgetNumber: true,
            title: true,
            total: true
          }
        },
        treatmentPlan: {
          select: {
            title: true,
            description: true
          }
        }
      },
      orderBy: { createdDate: 'desc' }
    });

    return NextResponse.json({ treatmentOrders });

  } catch (error) {
    console.error('Error obteniendo órdenes de tratamiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
