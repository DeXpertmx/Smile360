
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const patientId = params.id;

    // Buscar el periodontogram más reciente del paciente
    const periodontogram = await prisma.periodontogram.findFirst({
      where: {
        patientId: patientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!periodontogram) {
      return NextResponse.json({
        teeth: [],
        hasData: false,
        message: 'No se encontró odontograma para este paciente'
      });
    }

    // Convertir los datos del periodontogram a formato de odontograma
    const teethData = (periodontogram as any).teethData;
    const odontogramData = {
      teeth: teethData ? Object.entries(teethData).map(([number, data]: [string, any]) => ({
        number: parseInt(number),
        status: determineToothStatus(data),
        treatments: data.treatments || [],
        notes: data.notes || ''
      })) : [],
      hasData: true,
      createdAt: periodontogram.createdAt,
      updatedAt: periodontogram.updatedAt
    };

    return NextResponse.json(odontogramData);
  } catch (error) {
    console.error('Error fetching odontogram:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para determinar el estado del diente
function determineToothStatus(toothData: any): string {
  if (!toothData || toothData.missing) {
    return 'ausente';
  }
  
  if (toothData.caries && toothData.caries.length > 0) {
    return 'cariado';
  }
  
  if (toothData.restorations && toothData.restorations.length > 0) {
    return 'obturado';
  }
  
  if (toothData.crown || toothData.implant) {
    return 'restaurado';
  }
  
  return 'sano';
}
