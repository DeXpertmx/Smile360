
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Delete or deactivate the Cal.com configuration
    await prisma.calComConfig.deleteMany({
      where: { userId: session.user.id }
    });

    // Optionally, you could also reset sync status of appointments
    await prisma.appointment.updateMany({
      where: {
        doctorId: session.user.id,
        calComBookingId: { not: null }
      },
      data: {
        syncStatus: 'disconnected',
        calComBookingId: null,
        calComEventId: null
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error disconnecting Cal.com:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
