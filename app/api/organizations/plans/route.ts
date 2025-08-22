
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PRICING } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        monthlyPrice: 'asc'
      }
    });

    // Si no hay planes en la DB, devolver planes por defecto
    if (plans.length === 0) {
      const defaultPlans = [
        {
          id: 'basic',
          name: 'Básico',
          slug: 'basic',
          description: 'Perfecto para clínicas pequeñas que inician',
          monthlyPrice: PRICING.BASIC.monthly / 100, // Convertir de centavos
          yearlyPrice: PRICING.BASIC.yearly / 100,
          maxUsers: 5,
          maxPatients: 100,
          storageLimit: 5,
          trialDays: 14,
          features: [
            'Gestión de agenda',
            'Historia clínica digital',
            'Gestión de pacientes',
            'Tratamientos básicos',
            'Soporte por email'
          ],
          isPopular: false,
          stripePricing: {
            monthly: PRICING.BASIC.monthly,
            yearly: PRICING.BASIC.yearly
          }
        },
        {
          id: 'pro',
          name: 'Profesional',
          slug: 'pro',
          description: 'Para clínicas en crecimiento con más funcionalidades',
          monthlyPrice: PRICING.PRO.monthly / 100,
          yearlyPrice: PRICING.PRO.yearly / 100,
          maxUsers: 15,
          maxPatients: 500,
          storageLimit: 25,
          trialDays: 14,
          features: [
            'Todo lo del plan Básico',
            'Inventario y stock',
            'Reportes avanzados',
            'Facturación electrónica',
            'WhatsApp integrado',
            'Soporte prioritario'
          ],
          isPopular: true,
          stripePricing: {
            monthly: PRICING.PRO.monthly,
            yearly: PRICING.PRO.yearly
          }
        },
        {
          id: 'enterprise',
          name: 'Empresarial',
          slug: 'enterprise',
          description: 'Para grandes clínicas y cadenas dentales',
          monthlyPrice: PRICING.ENTERPRISE.monthly / 100,
          yearlyPrice: PRICING.ENTERPRISE.yearly / 100,
          maxUsers: -1,
          maxPatients: -1,
          storageLimit: 100,
          trialDays: 14,
          features: [
            'Todo lo del plan Profesional',
            'Usuarios ilimitados',
            'Pacientes ilimitados',
            'CRM avanzado',
            'API personalizada',
            'Soporte dedicado',
            'Capacitación incluida'
          ],
          isPopular: false,
          stripePricing: {
            monthly: PRICING.ENTERPRISE.monthly,
            yearly: PRICING.ENTERPRISE.yearly
          }
        }
      ];

      return NextResponse.json({
        success: true,
        plans: defaultPlans
      });
    }

    return NextResponse.json({
      success: true,
      plans
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
