
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden ver el personal
    if (session.user.role !== 'ADMIN' && session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const staffMembers = await prisma.staffMember.findMany({
      include: {
        user: true,
        positionRef: true,
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 1
        },
        payrollRecords: {
          orderBy: { startDate: 'desc' },
          take: 1
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      staffMembers: staffMembers.map(member => ({
        ...member,
        age: member.birthDate ? calculateAge(member.birthDate) : null
      }))
    });
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return NextResponse.json(
      { error: 'Error al cargar el personal' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const data = await req.json();

    // Crear usuario del sistema si se proporcionan credenciales
    let userId = null;
    let tempPassword = null;
    if (data.systemRole && data.username) {
      tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      const user = await prisma.user.create({
        data: {
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: hashedPassword,
          role: data.systemRole,
          phone: data.phone,
          especialidad: data.specializations,
          licencia: data.professionalLicense,
          tempPassword: true,
          active: data.status === 'Activo'
        }
      });

      userId = user.id;
    }

    // Crear el perfil completo de staff
    const staffMember = await prisma.staffMember.create({
      data: {
        userId,
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
        country: data.country || 'México',
        landline: data.landline,
        personalEmail: data.personalEmail,
        position: data.position,
        professionalLicense: data.professionalLicense,
        licenseDocument: data.licenseDocument,
        university: data.university,
        degree: data.degree,
        graduationDate: data.graduationDate ? new Date(data.graduationDate) : null,
        degreeDocument: data.degreeDocument,
        specializations: data.specializations ? JSON.stringify(data.specializations.split(',').map((s: string) => s.trim())) : null,
        certifications: data.certifications ? JSON.stringify(data.certifications) : null,
        insuranceNumber: data.insuranceNumber,
        insuranceCompany: data.insuranceCompany,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
        hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        contractType: data.contractType || 'Indefinido',
        contractDocument: data.contractDocument,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
        currency: data.currency || 'MXN',
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
        status: data.status || 'Activo',
        notes: data.notes
      },
      include: {
        user: true
      }
    });

    const response: any = {
      success: true,
      staffMember
    };

    // Si se creó un usuario, incluir la contraseña temporal
    if (userId && data.systemRole) {
      response.tempPassword = tempPassword;
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating staff member:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un empleado con ese email o nombre de usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el empleado' },
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

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8).toUpperCase();
}
