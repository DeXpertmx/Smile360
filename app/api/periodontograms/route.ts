

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mapeo de numeración FDI - Dientes del 11 al 48
const FDI_TEETH = [
  // Maxilar superior derecho: 11-18
  18, 17, 16, 15, 14, 13, 12, 11,
  // Maxilar superior izquierdo: 21-28  
  21, 22, 23, 24, 25, 26, 27, 28,
  // Maxilar inferior izquierdo: 31-38
  31, 32, 33, 34, 35, 36, 37, 38,
  // Maxilar inferior derecho: 41-48
  41, 42, 43, 44, 45, 46, 47, 48
];

// GET - Obtener periodontogramas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let periodontograms;
    if (patientId) {
      periodontograms = await prisma.periodontogram.findMany({
        where: { patientId },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              numeroExpediente: true
            }
          },
          doctor: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true
            }
          },
          measurements: true,
          toothStatuses: true,
          _count: {
            select: {
              measurements: true,
              toothStatuses: true
            }
          }
        },
        orderBy: { examinationDate: 'desc' }
      });
    } else {
      periodontograms = await prisma.periodontogram.findMany({
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              numeroExpediente: true
            }
          },
          doctor: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              measurements: true,
              toothStatuses: true
            }
          }
        },
        orderBy: { examinationDate: 'desc' }
      });
    }

    return NextResponse.json(periodontograms);
  } catch (error) {
    console.error('Error al obtener periodontogramas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo periodontograma
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, title, notes, diagnosis, recommendations, riskLevel } = body;

    // Verificar que el paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    const periodontogram = await prisma.periodontogram.create({
      data: {
        patientId,
        doctorId: session.user.id,
        title: title || 'Periodontograma',
        notes,
        diagnosis,
        recommendations,
        riskLevel,
        examinationDate: new Date()
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            numeroExpediente: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Inicializar mediciones para todos los dientes FDI (11-48)
    const measurements = [];
    const toothStatuses = [];

    for (const toothNumber of FDI_TEETH) {
      // Crear mediciones vestibulares y linguales/palatinas para cada diente
      measurements.push({
        periodontogramId: periodontogram.id,
        toothNumber,
        position: 'vestibular'
      });
      
      measurements.push({
        periodontogramId: periodontogram.id,
        toothNumber,
        position: 'lingual'
      });

      // Crear estado del diente
      toothStatuses.push({
        periodontogramId: periodontogram.id,
        toothNumber,
        status: 'Presente'
      });
    }

    // Crear todas las mediciones y estados
    await prisma.periodontalMeasurement.createMany({
      data: measurements
    });

    await prisma.toothStatus.createMany({
      data: toothStatuses
    });

    return NextResponse.json(periodontogram, { status: 201 });
  } catch (error) {
    console.error('Error al crear periodontograma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
