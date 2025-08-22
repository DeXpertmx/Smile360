
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Generate random password
function generateRandomPassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
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

    // Only administrators can change passwords
    if (session.user.role !== 'Administrador') {
      return NextResponse.json(
        { error: 'Sin permisos para cambiar contraseñas' },
        { status: 403 }
      );
    }

    const { password, generateRandom } = await req.json();
    const staffId = params.id;

    // Check if staff member exists
    const staffMember = await prisma.user.findUnique({
      where: { id: staffId }
    });

    if (!staffMember) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      );
    }

    let finalPassword: string;
    let tempPassword: string | undefined;

    if (generateRandom) {
      tempPassword = generateRandomPassword();
      finalPassword = tempPassword;
    } else {
      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }
      finalPassword = password;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(finalPassword, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: staffId },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    const response: any = { 
      message: 'Contraseña actualizada exitosamente' 
    };

    // Include temp password if generated
    if (tempPassword) {
      response.tempPassword = tempPassword;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
