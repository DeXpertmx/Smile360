
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const defaultCategories = [
  {
    name: 'Material Dental',
    description: 'Materiales y suministros dentales',
    color: '#3b82f6',
    monthlyBudget: 5000.00,
    yearlyBudget: 60000.00
  },
  {
    name: 'Equipo Médico',
    description: 'Equipos y herramientas médicas',
    color: '#10b981',
    monthlyBudget: 2000.00,
    yearlyBudget: 24000.00
  },
  {
    name: 'Servicios Públicos',
    description: 'Electricidad, agua, gas, internet',
    color: '#f59e0b',
    monthlyBudget: 1500.00,
    yearlyBudget: 18000.00
  },
  {
    name: 'Alquiler/Renta',
    description: 'Alquiler del local o consultorios',
    color: '#ef4444',
    monthlyBudget: 8000.00,
    yearlyBudget: 96000.00
  },
  {
    name: 'Salarios y Nómina',
    description: 'Salarios del personal',
    color: '#8b5cf6',
    monthlyBudget: 15000.00,
    yearlyBudget: 180000.00
  },
  {
    name: 'Marketing y Publicidad',
    description: 'Gastos en marketing y publicidad',
    color: '#ec4899',
    monthlyBudget: 1000.00,
    yearlyBudget: 12000.00
  },
  {
    name: 'Seguros',
    description: 'Seguros médicos, de responsabilidad civil, etc.',
    color: '#06b6d4',
    monthlyBudget: 800.00,
    yearlyBudget: 9600.00
  },
  {
    name: 'Mantenimiento',
    description: 'Mantenimiento de equipos e instalaciones',
    color: '#84cc16',
    monthlyBudget: 500.00,
    yearlyBudget: 6000.00
  },
  {
    name: 'Limpieza y Desinfección',
    description: 'Productos de limpieza y desinfección',
    color: '#14b8a6',
    monthlyBudget: 300.00,
    yearlyBudget: 3600.00
  },
  {
    name: 'Capacitación',
    description: 'Cursos, seminarios y capacitaciones',
    color: '#6366f1',
    monthlyBudget: 500.00,
    yearlyBudget: 6000.00
  },
  {
    name: 'Software y Licencias',
    description: 'Licencias de software y aplicaciones',
    color: '#f97316',
    monthlyBudget: 200.00,
    yearlyBudget: 2400.00
  },
  {
    name: 'Transporte y Viáticos',
    description: 'Gastos de transporte y viáticos',
    color: '#64748b',
    monthlyBudget: 400.00,
    yearlyBudget: 4800.00
  },
  {
    name: 'Papelería y Oficina',
    description: 'Materiales de oficina y papelería',
    color: '#a855f7',
    monthlyBudget: 200.00,
    yearlyBudget: 2400.00
  },
  {
    name: 'Impuestos y Tasas',
    description: 'Impuestos, tasas y contribuciones',
    color: '#dc2626',
    monthlyBudget: 1000.00,
    yearlyBudget: 12000.00
  },
  {
    name: 'Otros Gastos',
    description: 'Gastos diversos no clasificados',
    color: '#374151',
    monthlyBudget: 500.00,
    yearlyBudget: 6000.00
  }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos (solo ADMIN puede crear categorías predeterminadas)
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo los administradores pueden crear categorías predeterminadas' }, { status: 403 });
    }

    // Verificar si ya existen categorías
    const existingCategories = await prisma.expenseCategory.count();
    if (existingCategories > 0) {
      return NextResponse.json({ error: 'Ya existen categorías en el sistema' }, { status: 400 });
    }

    // Crear categorías predeterminadas
    const createdCategories = await Promise.all(
      defaultCategories.map(category =>
        prisma.expenseCategory.create({
          data: category
        })
      )
    );

    return NextResponse.json({ 
      message: `${createdCategories.length} categorías predeterminadas creadas exitosamente`,
      categories: createdCategories 
    });

  } catch (error) {
    console.error('Error creating default categories:', error);
    return NextResponse.json(
      { error: 'Error al crear categorías predeterminadas' },
      { status: 500 }
    );
  }
}
