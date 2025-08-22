
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const staff = await prisma.staffMember.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        positionRef: true,
        payrollRecords: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        },
        commissions: {
          where: {
            status: 'Pendiente'
          }
        },
        _count: {
          select: {
            evaluations: true,
            timeRecords: true
          }
        }
      }
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      );
    }

    // Transformar datos para compatibilidad con el frontend
    const transformedStaff = {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      fullName: staff.fullName || `${staff.firstName} ${staff.lastName}`,
      email: staff.email,
      phone: staff.phone,
      role: staff.systemRole || 'AUXILIAR',
      position: staff.position,
      professionalLicense: staff.professionalLicense,
      estado: staff.status,
      fechaIngreso: staff.hireDate,
      baseSalary: staff.baseSalary,
      permissions: staff.permissions || [],
      horarioTrabajo: staff.workSchedule ? JSON.parse(staff.workSchedule) : null,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      // Campos adicionales
      photo: staff.photo,
      birthDate: staff.birthDate,
      age: staff.age,
      gender: staff.gender,
      nationality: staff.nationality,
      // Dirección
      address: `${staff.street || ''} ${staff.apartment || ''}`.trim() || null,
      street: staff.street,
      apartment: staff.apartment,
      postalCode: staff.postalCode,
      city: staff.city,
      state: staff.state,
      country: staff.country,
      // Contacto adicional
      landline: staff.landline,
      personalEmail: staff.personalEmail,
      // Información profesional
      university: staff.university,
      degree: staff.degree,
      graduationDate: staff.graduationDate,
      specializations: staff.specializations ? JSON.parse(staff.specializations) : [],
      certifications: staff.certifications,
      // Seguro
      insuranceNumber: staff.insuranceNumber,
      insuranceCompany: staff.insuranceCompany,
      insuranceExpiry: staff.insuranceExpiry,
      // Información contractual
      contractType: staff.contractType,
      currency: staff.currency,
      bankName: staff.bankName,
      bankAccount: staff.bankAccount,
      clabe: staff.clabe,
      // Emergencia
      emergencyContactName: staff.emergencyContactName,
      emergencyRelationship: staff.emergencyRelationship,
      emergencyPhone: staff.emergencyPhone,
      bloodType: staff.bloodType,
      allergies: staff.allergies,
      chronicConditions: staff.chronicConditions,
      // Sistema
      username: staff.username,
      requirePasswordChange: staff.requirePasswordChange,
      notes: staff.notes,
      // Estadísticas
      totalEvaluations: staff._count.evaluations,
      totalTimeRecords: staff._count.timeRecords,
      pendingCommissions: staff.commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0),
      lastPayrollRecord: staff.payrollRecords[0]
    };

    return NextResponse.json(transformedStaff);

  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Verificar si el staff member existe
    const existingStaff = await prisma.staffMember.findUnique({
      where: { id: params.id }
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      );
    }

    // Verificar email único si se está cambiando
    if (data.email && data.email !== existingStaff.email) {
      const emailExists = await prisma.staffMember.findUnique({
        where: { email: data.email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe un empleado con este correo electrónico' },
          { status: 400 }
        );
      }
    }

    // Verificar username único si se está cambiando
    if (data.username && data.username !== existingStaff.username) {
      const usernameExists = await prisma.staffMember.findUnique({
        where: { username: data.username }
      });

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Ya existe un empleado con este nombre de usuario' },
          { status: 400 }
        );
      }
    }

    // Hash de la contraseña si se proporciona una nueva
    let updateData: any = {};
    
    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 12);
      updateData.requirePasswordChange = data.requirePasswordChange !== undefined ? data.requirePasswordChange : false;
    }

    // Preparar datos de actualización
    const staffUpdateData = {
      ...updateData,
      // Información básica
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone || null,
      
      // Información personal
      photo: data.photo || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      age: data.age || null,
      gender: data.gender || null,
      nationality: data.nationality || null,
      
      // Dirección
      street: data.street || null,
      apartment: data.apartment || null,
      postalCode: data.postalCode || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || 'México',
      
      // Contacto adicional
      landline: data.landline || null,
      personalEmail: data.personalEmail || null,
      
      // Información profesional
      position: data.position || null,
      professionalLicense: data.professionalLicense || null,
      university: data.university || null,
      degree: data.degree || null,
      graduationDate: data.graduationDate ? new Date(data.graduationDate) : null,
      specializations: data.specializations ? JSON.stringify(Array.isArray(data.specializations) ? data.specializations : data.specializations.split(',').map((s: string) => s.trim())) : null,
      certifications: data.certifications || null,
      
      // Seguro
      insuranceNumber: data.insuranceNumber || null,
      insuranceCompany: data.insuranceCompany || null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      
      // Información contractual
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      contractType: data.contractType || 'Indefinido',
      baseSalary: data.baseSalary ? parseFloat(data.baseSalary.toString()) : null,
      currency: data.currency || 'MXN',
      commissionStructure: data.commissionStructure || null,
      bonusStructure: data.bonusStructure || null,
      
      // Datos bancarios
      bankName: data.bankName || null,
      bankAccount: data.bankAccount || null,
      clabe: data.clabe || null,
      
      // Horario
      workSchedule: data.workSchedule || null,
      
      // Acceso al sistema
      username: data.username || null,
      systemRole: data.systemRole || data.role || 'AUXILIAR',
      permissions: data.permissions || [],
      
      // Capacitación
      trainingRecords: data.trainingRecords || null,
      incidentRecords: data.incidentRecords || null,
      
      // Emergencia
      emergencyContactName: data.emergencyContactName || null,
      emergencyRelationship: data.emergencyRelationship || null,
      emergencyPhone: data.emergencyPhone || null,
      bloodType: data.bloodType || null,
      allergies: data.allergies || null,
      chronicConditions: data.chronicConditions || null,
      
      // Estado
      status: data.status || data.estado || 'Activo',
      notes: data.notes || null,
      
      // Campos que solo se actualizan si no están definidos (requirePasswordChange solo si se está cambiando password)
      ...(data.requirePasswordChange !== undefined && !updateData.requirePasswordChange ? { requirePasswordChange: data.requirePasswordChange } : {})
    };

    const updatedStaff = await prisma.staffMember.update({
      where: { id: params.id },
      data: staffUpdateData,
      include: {
        user: true,
        positionRef: true
      }
    });

    return NextResponse.json({
      message: 'Personal actualizado exitosamente',
      staff: updatedStaff
    });

  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar si el staff member existe
    const existingStaff = await prisma.staffMember.findUnique({
      where: { id: params.id }
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      );
    }

    // En lugar de eliminar, marcamos como "Terminado"
    const updatedStaff = await prisma.staffMember.update({
      where: { id: params.id },
      data: {
        status: 'Terminado',
        endDate: new Date(),
        terminationReason: 'Eliminado desde el sistema'
      }
    });

    return NextResponse.json({
      message: 'Personal marcado como terminado exitosamente',
      staff: updatedStaff
    });

  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
