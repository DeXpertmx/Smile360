
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Mock data for now - en una implementación real, esto vendría de la base de datos
    const periods = [
      {
        id: '1',
        name: 'Diciembre 2024',
        type: 'Mensual',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        status: 'Activo',
        payrollRecords: []
      }
    ];

    return NextResponse.json({ 
      success: true, 
      periods 
    });

  } catch (error) {
    console.error('Error fetching payroll periods:', error);
    return NextResponse.json(
      { error: 'Error al cargar períodos de nómina' },
      { status: 500 }
    );
  }
}
