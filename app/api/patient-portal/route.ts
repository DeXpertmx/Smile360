
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

    // Buscar paciente por email (ya que no hay relación directa User-Patient)
    const patient = await prisma.patient.findFirst({
      where: { 
        email: session.user.email 
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

    // Estadísticas del progreso
    const totalOrders = treatmentOrders.length;
    const completedOrders = treatmentOrders.filter(o => o.status === 'Completada').length;
    const signedOrders = treatmentOrders.filter(o => o.status === 'Firmada').length;
    const pendingOrders = treatmentOrders.filter(o => o.status === 'Pendiente').length;
    
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'Completada').length;
    const upcomingAppointments = appointments.filter(a => 
      a.status === 'Programada' && new Date(a.date) > new Date()
    ).length;

    return NextResponse.json({
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        numeroExpediente: patient.numeroExpediente
      },
      treatmentOrders,
      appointments,
      stats: {
        totalOrders,
        completedOrders,
        signedOrders,
        pendingOrders,
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        progressPercentage: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error en portal del paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
