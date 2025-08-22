
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const staffMember = await prisma.staffMember.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        positionRef: true,
        evaluations: {
          orderBy: { evaluationDate: 'desc' }
        },
        timeRecords: {
          orderBy: { date: 'desc' },
          take: 30
        },
        payrollRecords: {
          orderBy: { startDate: 'desc' }
        },
        commissions: {
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!staffMember) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    // Calcular edad si hay fecha de nacimiento
    const staffMemberWithAge = {
      ...staffMember,
      age: staffMember.birthDate ? calculateAge(staffMember.birthDate) : null,
      certifications: staffMember.certifications ? JSON.parse(staffMember.certifications) : [],
      specializations: staffMember.specializations ? JSON.parse(staffMember.specializations) : [],
      workSchedule: staffMember.workSchedule ? JSON.parse(staffMember.workSchedule) : null,
      trainingRecords: staffMember.trainingRecords ? JSON.parse(staffMember.trainingRecords) : [],
      incidentRecords: staffMember.incidentRecords ? JSON.parse(staffMember.incidentRecords) : [],
    };

    return NextResponse.json({ 
      success: true, 
      staffMember: staffMemberWithAge 
    });

  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { error: 'Error al cargar el empleado' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const data = await req.json();

    // Actualizar el perfil de staff
    const staffMember = await prisma.staffMember.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender,
        nationality: data.nationality,
        street: data.street,
        apartment: data.apartment,
        postalCode: data.postalCode,
        city: data.city,
        state: data.state,
        country: data.country,
        landline: data.landline,
        personalEmail: data.personalEmail,
        position: data.position,
        professionalLicense: data.professionalLicense,
        licenseDocument: data.licenseDocument,
        university: data.university,
        degree: data.degree,
        graduationDate: data.graduationDate ? new Date(data.graduationDate) : null,
        degreeDocument: data.degreeDocument,
        specializations: data.specializations ? JSON.stringify(data.specializations.split ? data.specializations.split(',').map((s: string) => s.trim()) : data.specializations) : null,
        certifications: data.certifications ? JSON.stringify(data.certifications) : null,
        insuranceNumber: data.insuranceNumber,
        insuranceCompany: data.insuranceCompany,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        contractType: data.contractType,
        contractDocument: data.contractDocument,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
        currency: data.currency,
        commissionStructure: data.commissionStructure,
        bonusStructure: data.bonusStructure,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        clabe: data.clabe,
        workSchedule: data.workSchedule ? JSON.stringify(data.workSchedule) : null,
        username: data.username,
        systemRole: data.systemRole,
        permissions: data.permissions || [],
        emergencyContactName: data.emergencyContactName,
        emergencyRelationship: data.emergencyRelationship,
        emergencyPhone: data.emergencyPhone,
        bloodType: data.bloodType,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        status: data.status,
        notes: data.notes
      },
      include: {
        user: true
      }
    });

    // También actualizar el usuario relacionado si existe
    if (staffMember.userId && data.systemRole) {
      await prisma.user.update({
        where: { id: staffMember.userId },
        data: {
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.systemRole,
          phone: data.phone,
          especialidad: data.specializations,
          licencia: data.professionalLicense,
          active: data.status === 'Activo'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      staffMember 
    });

  } catch (error) {
    console.error('Error updating staff member:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un empleado con ese email o nombre de usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar el empleado' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Verificar si el empleado existe
    const existingStaff = await prisma.staffMember.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el usuario relacionado si existe
    if (existingStaff.userId) {
      await prisma.user.delete({
        where: { id: existingStaff.userId }
      });
    }

    // Eliminar el perfil de staff
    await prisma.staffMember.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Empleado eliminado exitosamente' 
    });

  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el empleado' },
      { status: 500 }
    );
  }
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
