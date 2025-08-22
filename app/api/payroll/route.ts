


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
    const periodId = searchParams.get('periodId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let whereClause: any = {};
    
    if (staffMemberId) {
      whereClause.staffMemberId = staffMemberId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    if (periodId) {
      whereClause.payrollPeriodId = periodId;
    }

    const payrollRecords = await prisma.payrollRecord.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        staffMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            position: true,
            employeeNumber: true
          }
        },
        payrollPeriod: true,
        commissions: {
          include: {
            staffMember: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ payrollRecords });

  } catch (error) {
    console.error('Error al obtener registros de nómina:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { staffMemberId, payrollPeriodId, generateAutomatic } = await request.json();

    if (generateAutomatic) {
      // Generar nómina automática
      const payrollRecord = await generateAutomaticPayroll(staffMemberId, payrollPeriodId);
      return NextResponse.json(payrollRecord, { status: 201 });
    } else {
      // Crear registro manual
      const data = await request.json();
      const payrollRecord = await prisma.payrollRecord.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          payDate: data.payDate ? new Date(data.payDate) : null,
        },
        include: {
          staffMember: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true
            }
          },
          payrollPeriod: true
        }
      });

      return NextResponse.json(payrollRecord, { status: 201 });
    }

  } catch (error) {
    console.error('Error al crear registro de nómina:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para generar nómina automática
async function generateAutomaticPayroll(staffMemberId: string, payrollPeriodId: string) {
  // Obtener datos del empleado y período
  const [staffMember, payrollPeriod] = await Promise.all([
    prisma.staffMember.findUnique({ where: { id: staffMemberId } }),
    prisma.payrollPeriod.findUnique({ where: { id: payrollPeriodId } })
  ]);

  if (!staffMember || !payrollPeriod) {
    throw new Error('Empleado o período no encontrado');
  }

  // Calcular horas trabajadas del período
  const timeRecords = await prisma.timeRecord.findMany({
    where: {
      staffMemberId: staffMemberId,
      date: {
        gte: payrollPeriod.startDate,
        lte: payrollPeriod.endDate
      },
      isApproved: true
    }
  });

  const regularHours = timeRecords.reduce((sum, record) => 
    sum + (record.totalHours ? parseFloat(record.totalHours.toString()) : 0), 0);

  // Calcular comisiones del período
  const commissions = await prisma.commission.findMany({
    where: {
      staffMemberId: staffMemberId,
      serviceDate: {
        gte: payrollPeriod.startDate,
        lte: payrollPeriod.endDate
      },
      status: 'Aprobado',
      isPaid: false
    }
  });

  const commissionsAmount = commissions.reduce((sum, commission) => 
    sum + parseFloat(commission.commissionAmount.toString()), 0);

  // Calcular salario base
  const baseSalaryAmount = staffMember.baseSalary ? 
    parseFloat(staffMember.baseSalary.toString()) : 0;

  // Calcular totales
  const grossAmount = baseSalaryAmount + commissionsAmount;
  
  // Calcular deducciones (ejemplo básico - 16% ISR + 6.5% IMSS)
  const taxDeductions = grossAmount * 0.16;
  const socialSecurityDeductions = grossAmount * 0.065;
  const totalDeductions = taxDeductions + socialSecurityDeductions;
  
  const netAmount = grossAmount - totalDeductions;

  // Crear registro de nómina
  const payrollRecord = await prisma.payrollRecord.create({
    data: {
      staffMemberId: staffMemberId,
      payrollPeriodId: payrollPeriodId,
      startDate: payrollPeriod.startDate,
      endDate: payrollPeriod.endDate,
      regularHours: regularHours,
      baseSalaryAmount: baseSalaryAmount,
      commissionsAmount: commissionsAmount,
      taxDeductions: taxDeductions,
      socialSecurityDeductions: socialSecurityDeductions,
      grossAmount: grossAmount,
      netAmount: netAmount,
      status: 'Procesado',
      processedAt: new Date(),
      processedBy: staffMemberId,
      notes: `Nómina generada automáticamente para el período ${payrollPeriod.name}`
    },
    include: {
      staffMember: {
        select: {
          firstName: true,
          lastName: true,
          fullName: true
        }
      },
      payrollPeriod: true
    }
  });

  // Marcar comisiones como pagadas
  await prisma.commission.updateMany({
    where: {
      id: { in: commissions.map(c => c.id) }
    },
    data: {
      isPaid: true,
      payrollRecordId: payrollRecord.id
    }
  });

  return payrollRecord;
}
