
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const staffMemberId = searchParams.get('staffMemberId');

    // Mock data for now - en una implementación real, esto vendría de la base de datos
    const records = [];

    return NextResponse.json({ 
      success: true, 
      records 
    });

  } catch (error) {
    console.error('Error fetching payroll records:', error);
    return NextResponse.json(
      { error: 'Error al cargar registros de nómina' },
      { status: 500 }
    );
  }
}
