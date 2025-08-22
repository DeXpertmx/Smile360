


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { payrollPeriodId, staffMemberIds } = await request.json();

    if (!payrollPeriodId) {
      return NextResponse.json(
        { error: 'ID del período de nómina requerido' },
        { status: 400 }
      );
    }

    // Obtener período de nómina
    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: payrollPeriodId }
    });

    if (!payrollPeriod) {
      return NextResponse.json(
        { error: 'Período de nómina no encontrado' },
        { status: 404 }
      );
    }

    let staffMembers;

    if (staffMemberIds && staffMemberIds.length > 0) {
      // Generar para empleados específicos
      staffMembers = await prisma.staffMember.findMany({
        where: {
          id: { in: staffMemberIds },
          status: 'Activo'
        }
      });
    } else {
      // Generar para todos los empleados activos
      staffMembers = await prisma.staffMember.findMany({
        where: { status: 'Activo' }
      });
    }

    const generatedPayrolls = [];
    const errors = [];

    for (const staffMember of staffMembers) {
      try {
        // Verificar si ya existe registro para este período
        const existingRecord = await prisma.payrollRecord.findUnique({
          where: {
            staffMemberId_payrollPeriodId: {
              staffMemberId: staffMember.id,
              payrollPeriodId: payrollPeriodId
            }
          }
        });

        if (existingRecord) {
          errors.push(`Ya existe registro de nómina para ${staffMember.fullName || staffMember.firstName}`);
          continue;
        }

        const payrollRecord = await generateStaffPayroll(staffMember, payrollPeriod, session.user.id);
        generatedPayrolls.push(payrollRecord);

      } catch (error) {
        console.error(`Error generando nómina para ${staffMember.fullName}:`, error);
        errors.push(`Error al generar nómina para ${staffMember.fullName || staffMember.firstName}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedPayrolls.length,
      errors: errors,
      payrolls: generatedPayrolls
    });

  } catch (error) {
    console.error('Error en generación automática de nómina:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function generateStaffPayroll(staffMember: any, payrollPeriod: any, processedBy: string) {
  // 1. Calcular horas trabajadas del período
  const timeRecords = await prisma.timeRecord.findMany({
    where: {
      staffMemberId: staffMember.id,
      date: {
        gte: payrollPeriod.startDate,
        lte: payrollPeriod.endDate
      },
      isApproved: true
    }
  });

  const regularHours = timeRecords.reduce((sum, record) => {
    if (record.recordType === 'Regular' && record.totalHours) {
      return sum + parseFloat(record.totalHours.toString());
    }
    return sum;
  }, 0);

  const overtimeHours = timeRecords.reduce((sum, record) => {
    if (record.recordType === 'Overtime' && record.totalHours) {
      return sum + parseFloat(record.totalHours.toString());
    }
    return sum;
  }, 0);

  // 2. Calcular comisiones pendientes del período
  const commissions = await prisma.commission.findMany({
    where: {
      staffMemberId: staffMember.id,
      serviceDate: {
        gte: payrollPeriod.startDate,
        lte: payrollPeriod.endDate
      },
      status: 'Aprobada',
      payrollRecordId: null
    }
  });

  const commissionsAmount = commissions.reduce((sum, commission) => 
    sum + parseFloat(commission.commissionAmount.toString()), 0);

  // 3. Calcular pagos base
  const baseSalaryAmount = staffMember.baseSalary ? 
    parseFloat(staffMember.baseSalary.toString()) : 0;

  // Calcular pago por horas regulares (si es por horas)
  const hourlyRate = baseSalaryAmount / 160; // Asumiendo 160 horas mensuales
  const regularPay = staffMember.position?.includes('Por Horas') ? 
    regularHours * hourlyRate : baseSalaryAmount;

  // Horas extra (1.5x la tarifa regular)
  const overtimePay = overtimeHours * hourlyRate * 1.5;

  // 4. Calcular bonos
  const bonusAmount = await calculateBonuses(staffMember.id, payrollPeriod);

  // 5. Calcular totales antes de deducciones
  const grossAmount = regularPay + overtimePay + commissionsAmount + bonusAmount;

  // 6. Calcular deducciones
  const { taxDeductions, socialSecurityDeductions, healthInsuranceDeductions } = 
    calculateDeductions(grossAmount, staffMember);

  const totalDeductions = taxDeductions + socialSecurityDeductions + healthInsuranceDeductions;
  const netAmount = grossAmount - totalDeductions;

  // 7. Crear registro de nómina
  const payrollRecord = await prisma.payrollRecord.create({
    data: {
      staffMemberId: staffMember.id,
      payrollPeriodId: payrollPeriod.id,
      startDate: payrollPeriod.startDate,
      endDate: payrollPeriod.endDate,
      regularHours: regularHours,
      overtimeHours: overtimeHours,
      baseSalaryAmount: regularPay,
      overtimeAmount: overtimePay,
      commissionsAmount: commissionsAmount,
      bonusAmount: bonusAmount,
      taxDeductions: taxDeductions,
      socialSecurityDeductions: socialSecurityDeductions,
      otherDeductions: healthInsuranceDeductions,
      grossAmount: grossAmount,
      netAmount: netAmount,
      status: 'Procesado',
      processedAt: new Date(),
      processedBy: processedBy,
      notes: `Nómina generada automáticamente para ${payrollPeriod.name}. ` +
             `Horas regulares: ${regularHours}, Horas extra: ${overtimeHours}, ` +
             `Comisiones: $${commissionsAmount.toFixed(2)}`
    }
  });

  // 8. Asociar comisiones al registro de nómina
  if (commissions.length > 0) {
    await prisma.commission.updateMany({
      where: {
        id: { in: commissions.map(c => c.id) }
      },
      data: {
        status: 'Pagada',
        payrollRecordId: payrollRecord.id,
        paidAt: new Date()
      }
    });
  }

  return payrollRecord;
}

async function calculateBonuses(staffMemberId: string, payrollPeriod: any): Promise<number> {
  // Ejemplo de cálculo de bonos
  // Podrías implementar bonos por productividad, cumplimiento de metas, etc.
  
  // Bono por puntualidad (si no tiene faltas ni retardos)
  const lateRecords = await prisma.timeRecord.count({
    where: {
      staffMemberId: staffMemberId,
      date: {
        gte: payrollPeriod.startDate,
        lte: payrollPeriod.endDate
      },
      recordType: 'Late' // Asumiendo que tienes un tipo "Late"
    }
  });

  let punctualityBonus = 0;
  if (lateRecords === 0) {
    punctualityBonus = 1000; // $1000 MXN bono por puntualidad
  }

  // Agregar más tipos de bonos según sea necesario
  
  return punctualityBonus;
}

function calculateDeductions(grossAmount: number, staffMember: any) {
  // Cálculos básicos para México
  // ISR (Impuesto sobre la Renta) - Tabla simplificada
  let taxDeductions = 0;
  
  if (grossAmount > 125900) {
    taxDeductions = grossAmount * 0.35; // Tarifa máxima
  } else if (grossAmount > 103218) {
    taxDeductions = grossAmount * 0.30;
  } else if (grossAmount > 49500) {
    taxDeductions = grossAmount * 0.21;
  } else if (grossAmount > 20548) {
    taxDeductions = grossAmount * 0.16;
  } else if (grossAmount > 8601) {
    taxDeductions = grossAmount * 0.10;
  } else if (grossAmount > 5952) {
    taxDeductions = grossAmount * 0.06;
  } else {
    taxDeductions = grossAmount * 0.02;
  }

  // IMSS (Instituto Mexicano del Seguro Social) - 4.025% trabajador
  const socialSecurityDeductions = grossAmount * 0.04025;

  // Seguro médico privado (si aplica)
  const healthInsuranceDeductions = 0; // Podría ser un campo del empleado

  return {
    taxDeductions: Math.round(taxDeductions * 100) / 100,
    socialSecurityDeductions: Math.round(socialSecurityDeductions * 100) / 100,
    healthInsuranceDeductions: Math.round(healthInsuranceDeductions * 100) / 100
  };
}
