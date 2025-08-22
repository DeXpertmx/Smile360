
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  appInfo: {
    name: 'SmileSys',
    version: '1.0.0',
  },
});

// Configuración de productos y precios
export const STRIPE_PRODUCTS = {
  BASIC: {
    name: 'SmileSys Básico',
    description: 'Perfecto para clínicas pequeñas que inician',
    features: [
      'Hasta 5 usuarios',
      'Hasta 100 pacientes',
      'Gestión de agenda',
      'Historia clínica digital',
      'Tratamientos básicos',
      'Soporte por email'
    ]
  },
  PRO: {
    name: 'SmileSys Profesional',
    description: 'Para clínicas en crecimiento con más funcionalidades',
    features: [
      'Hasta 15 usuarios',
      'Hasta 500 pacientes',
      'Todo lo del plan Básico',
      'Inventario y stock',
      'Reportes avanzados',
      'Facturación electrónica',
      'WhatsApp integrado',
      'Soporte prioritario'
    ]
  },
  ENTERPRISE: {
    name: 'SmileSys Empresarial',
    description: 'Para grandes clínicas y cadenas dentales',
    features: [
      'Usuarios ilimitados',
      'Pacientes ilimitados',
      'Todo lo del plan Profesional',
      'CRM avanzado',
      'API personalizada',
      'Soporte dedicado',
      'Capacitación incluida'
    ]
  }
};

// Precios por plan (en centavos)
export const PRICING = {
  BASIC: {
    monthly: 2999, // $29.99 USD
    yearly: 29990  // $299.90 USD (equivale a 10 meses)
  },
  PRO: {
    monthly: 5999, // $59.99 USD
    yearly: 59990  // $599.90 USD (equivale a 10 meses)
  },
  ENTERPRISE: {
    monthly: 9999, // $99.99 USD
    yearly: 99990  // $999.90 USD (equivale a 10 meses)
  }
};

// Función para crear un customer en Stripe
export async function createStripeCustomer(organizationData: {
  email: string;
  name: string;
  phone?: string;
  organizationId: string;
}) {
  const customer = await stripe.customers.create({
    email: organizationData.email,
    name: organizationData.name,
    phone: organizationData.phone,
    metadata: {
      organizationId: organizationData.organizationId,
    },
  });

  return customer;
}

// Función para crear una sesión de checkout
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  organizationId: string;
  planType: string;
  billingCycle: 'monthly' | 'yearly';
}) {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      organizationId: params.organizationId,
      planType: params.planType,
      billingCycle: params.billingCycle,
    },
    subscription_data: {
      metadata: {
        organizationId: params.organizationId,
        planType: params.planType,
        billingCycle: params.billingCycle,
      },
    },
  });

  return session;
}

// Función para cancelar suscripción
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

// Función para reactivar suscripción
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

// Función para crear un billing portal session
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portalSession;
}
