
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role && role !== 'all') {
      where.systemRole = role;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const staff = await prisma.staffMember.findMany({
      where,
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
      },
      orderBy: [
        { status: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Transformar datos para compatibilidad con el frontend
    const transformedStaff = staff.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: member.fullName || `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone,
      role: member.systemRole || 'AUXILIAR',
      position: member.position,
      professionalLicense: member.professionalLicense,
      estado: member.status,
      fechaIngreso: member.hireDate,
      baseSalary: member.baseSalary,
      permissions: member.permissions || [],
      horarioTrabajo: member.workSchedule ? JSON.parse(member.workSchedule) : null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      // Campos adicionales
      photo: member.photo,
      birthDate: member.birthDate,
      age: member.age,
      gender: member.gender,
      nationality: member.nationality,
      // Dirección
      address: `${member.street || ''} ${member.apartment || ''}`.trim() || null,
      street: member.street,
      apartment: member.apartment,
      postalCode: member.postalCode,
      city: member.city,
      state: member.state,
      country: member.country,
      // Contacto adicional
      landline: member.landline,
      personalEmail: member.personalEmail,
      // Información profesional
      university: member.university,
      degree: member.degree,
      graduationDate: member.graduationDate,
      specializations: member.specializations ? JSON.parse(member.specializations) : [],
      certifications: member.certifications,
      // Seguro
      insuranceNumber: member.insuranceNumber,
      insuranceCompany: member.insuranceCompany,
      insuranceExpiry: member.insuranceExpiry,
      // Información contractual
      contractType: member.contractType,
      currency: member.currency,
      bankName: member.bankName,
      bankAccount: member.bankAccount,
      clabe: member.clabe,
      // Emergencia
      emergencyContactName: member.emergencyContactName,
      emergencyRelationship: member.emergencyRelationship,
      emergencyPhone: member.emergencyPhone,
      bloodType: member.bloodType,
      allergies: member.allergies,
      chronicConditions: member.chronicConditions,
      // Sistema
      username: member.username,
      hasPassword: !!member.password, // Indica si tiene contraseña configurada
      requirePasswordChange: member.requirePasswordChange,
      notes: member.notes,
      // Estadísticas
      totalEvaluations: member._count.evaluations,
      totalTimeRecords: member._count.timeRecords,
      pendingCommissions: member.commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0),
      lastPayrollRecord: member.payrollRecords[0]
    }));

    return NextResponse.json({
      staff: transformedStaff,
      total: staff.length
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validaciones básicas
    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: firstName, lastName, email' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingStaff = await prisma.staffMember.findUnique({
      where: { email: data.email }
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Ya existe un empleado con este correo electrónico' },
        { status: 400 }
      );
    }

    // Verificar username si se proporciona
    if (data.username) {
      const existingUsername = await prisma.staffMember.findUnique({
        where: { username: data.username }
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Ya existe un empleado con este nombre de usuario' },
          { status: 400 }
        );
      }
    }

    // Hash de la contraseña si se proporciona
    let hashedPassword = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12);
    }

    // Preparar datos para crear el registro
    const staffData = {
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
      hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
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
      password: hashedPassword,
      systemRole: data.systemRole || data.role || 'AUXILIAR',
      permissions: data.permissions || [],
      requirePasswordChange: data.requirePasswordChange !== undefined ? data.requirePasswordChange : true,
      
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
      status: data.status || 'Activo',
      notes: data.notes || null
    };

    const newStaff = await prisma.staffMember.create({
      data: staffData,
      include: {
        user: true,
        positionRef: true
      }
    });

    return NextResponse.json({
      message: 'Personal creado exitosamente',
      staff: newStaff
    });

  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
