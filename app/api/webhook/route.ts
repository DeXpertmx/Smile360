// app/api/webhook/route.ts
import { buffer } from 'micro';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmailToClinic } from '@/lib/email';
import bcrypt from 'bcryptjs';

export const config = { api: { bodyParser: false } };

// Mapeo de planes a módulos
function getFeaturesForPlan(plan: string): string[] {
  const plans: Record<string, string[]> = {
    basic: ['dashboard', 'agenda', 'pacientes', 'expedientes', 'configuracion'],
    pro: ['dashboard', 'agenda', 'pacientes', 'expedientes', 'presupuestos', 'facturacion', 'inventario', 'reportes'],
    enterprise: [
      'dashboard', 'agenda', 'pacientes', 'expedientes', 'odontograma', 'periodontograma',
      'presupuestos', 'facturacion', 'inventario', 'reportes', 'gastos', 'aseguradoras',
      'morosidad', 'crm', 'personal', 'configuracion'
    ]
  };
  return plans[plan] || [];
}

// Límites por plan
function getLimitsForPlan(plan: string) {
  const limits = {
    basic: { maxUsers: 5, maxPatients: 100 },
    pro: { maxUsers: 15, maxPatients: 500 },
    enterprise: { maxUsers: 999, maxPatients: 9999 }
  };
  return limits[plan] || limits.basic;
}

export async function POST(req: NextRequest) {
  const buf = await buffer(req);
  const sig = req.headers.get('Stripe-Signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { plan } = session.metadata || { plan: 'basic' };
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'Estimado cliente';

    if (!customerEmail) {
      console.error('❌ No hay email en la sesión de Stripe');
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    // Generar slug seguro
    const slug = customerEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
      // 1. Crear organización
      const organization = await prisma.organization.create({
        data: {
          name: session.customer_details?.name || 'Clínica sin nombre',
          email: customerEmail,
          slug,
          plan,
          status: 'active',
          features: getFeaturesForPlan(plan),
          ...getLimitsForPlan(plan),
        }
      });

      // 2. Generar contraseña temporal
      const tempPassword = 'Temporal123!';
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // 3. Crear usuario ADMIN
      await prisma.user.create({
        data: {
          email: customerEmail,
          firstName: customerName.split(' ')[0],
          lastName: customerName.split(' ').slice(1).join(' ') || '',
          role: 'ADMIN',
          organizationId: organization.id,
          password: hashedPassword,
          estado: 'ACTIVO',
        }
      });

      // 4. Enviar email de bienvenida
      await sendWelcomeEmailToClinic(customerEmail, customerName, slug, organization.name);

      console.log(`✅ Organización creada: ${organization.slug}`);
    } catch (error) {
      console.error('❌ Error creando organización:', error);
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}