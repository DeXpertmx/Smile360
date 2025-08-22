
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID de paciente requerido' }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      birthDate,
      gender,
      occupation,
      emergencyContact,
      emergencyPhone,
      bloodType,
      allergies,
      medicalHistory,
      insuranceInfo,
      status
    } = await request.json();

    // Validar campos requeridos
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Nombre, apellido, email y teléfono son campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el email ya está en uso por otro paciente
    if (email && email !== existingPatient.email) {
      const emailInUse = await prisma.patient.findFirst({
        where: { 
          email,
          id: { not: id }
        }
      });

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Ya existe otro paciente con este email' },
          { status: 400 }
        );
      }
    }

    // Actualizar el paciente
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address: address || null,
        city: city || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: gender || null,
        occupation: occupation || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        medicalHistory: medicalHistory || null,
        insuranceInfo: insuranceInfo || null,
        status: status || 'Activo',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      patient: updatedPatient,
      message: 'Paciente actualizado exitosamente' 
    });

  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID de paciente requerido' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ patient });

  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID de paciente requerido' }, { status: 400 });
    }

    // Verificar que el paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // En lugar de eliminar, cambiamos el estado a "Eliminado" para mantener integridad referencial
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        status: 'Eliminado',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Paciente eliminado exitosamente',
      patient: updatedPatient
    });

  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
