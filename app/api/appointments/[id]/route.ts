

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const {
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      type,
      reason,
      notes,
      duration,
      status
    } = await request.json();

    // Check for conflicts with other appointments (excluding current one)
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        doctorId,
        date: new Date(date),
        status: {
          not: 'Cancelada' // No considerar citas canceladas como conflicto
        },
        OR: [
          // Caso 1: La nueva cita comienza durante una cita existente
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          // Caso 2: La nueva cita termina durante una cita existente
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          // Caso 3: La nueva cita engloba completamente una cita existente
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          },
          // Caso 4: Misma hora exacta de inicio
          {
            startTime: startTime
          }
        ]
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (conflictingAppointment) {
      const conflictPatientName = `${conflictingAppointment.patient.firstName} ${conflictingAppointment.patient.lastName}`;
      return NextResponse.json(
        { 
          error: `Ya existe una cita en este horario para el doctor (${conflictingAppointment.startTime} - ${conflictingAppointment.endTime} con ${conflictPatientName})` 
        },
        { status: 400 }
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientId,
        doctorId,
        date: new Date(date),
        startTime,
        endTime,
        type,
        reason: reason || null,
        notes: notes || null,
        duration: duration || 30,
        status: status || 'Programada'
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            numeroExpediente: true,
            phone: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            especialidad: true
          }
        }
      }
    });

    return NextResponse.json(updatedAppointment);

  } catch (error) {
    console.error('Error al actualizar cita:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Cita eliminada' });

  } catch (error) {
    console.error('Error al eliminar cita:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

