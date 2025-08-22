


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
    const staffMemberId = searchParams.get('staffMemberId');
    const status = searchParams.get('status');
    const sourceType = searchParams.get('sourceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let whereClause: any = {};
    
    if (staffMemberId) {
      whereClause.staffMemberId = staffMemberId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    if (sourceType) {
      whereClause.sourceType = sourceType;
    }

    if (startDate && endDate) {
      whereClause.serviceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const commissions = await prisma.commission.findMany({
      where: whereClause,
      take: limit,
      orderBy: { serviceDate: 'desc' },
      include: {
        staffMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            position: true
          }
        },
        payrollRecord: {
          select: {
            id: true,
            payrollPeriodId: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({ commissions });

  } catch (error) {
    console.error('Error al obtener comisiones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    // Auto-calcular comisión si es necesario
    if (data.autoCalculate) {
      const commissionAmount = await calculateCommission(data);
      data.commissionAmount = commissionAmount;
    }

    const commission = await prisma.commission.create({
      data: {
        ...data,
        serviceDate: new Date(data.serviceDate),
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        calculatedBy: session.user.id,
      },
      include: {
        staffMember: {
          select: {
            firstName: true,
            lastName: true,
            fullName: true
          }
        }
      }
    });

    return NextResponse.json(commission, { status: 201 });

  } catch (error) {
    console.error('Error al crear comisión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para auto-calcular comisiones
async function calculateCommission(data: any): Promise<number> {
  const { staffMemberId, commissionType, commissionRate, serviceAmount, collectedAmount, commissionBase } = data;

  // Obtener configuración de comisiones del empleado
  const staffMember = await prisma.staffMember.findUnique({
    where: { id: staffMemberId }
  });

  if (!staffMember) {
    throw new Error('Empleado no encontrado');
  }

  const baseAmount = commissionBase === 'CollectedAmount' ? collectedAmount : serviceAmount;
  let commissionAmount = 0;

  switch (commissionType) {
    case 'Percentage':
      commissionAmount = baseAmount * (commissionRate / 100);
      break;
    case 'Fixed':
      commissionAmount = commissionRate;
      break;
    case 'Tiered':
      // Implementar lógica de comisiones escalonadas
      commissionAmount = calculateTieredCommission(baseAmount, commissionRate);
      break;
    default:
      commissionAmount = baseAmount * (commissionRate / 100);
  }

  return Math.round(commissionAmount * 100) / 100; // Redondear a 2 decimales
}

function calculateTieredCommission(baseAmount: number, rate: number): number {
  // Ejemplo de comisiones escalonadas
  // 0-5000: 5%, 5001-15000: 7%, 15001+: 10%
  
  let commission = 0;
  
  if (baseAmount <= 5000) {
    commission = baseAmount * 0.05;
  } else if (baseAmount <= 15000) {
    commission = (5000 * 0.05) + ((baseAmount - 5000) * 0.07);
  } else {
    commission = (5000 * 0.05) + (10000 * 0.07) + ((baseAmount - 15000) * 0.10);
  }
  
  return commission;
}
