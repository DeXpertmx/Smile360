// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const { plan, email } = await req.json();

  const prices = {
    basic: process.env.STRIPE_PRICE_BASIC,
    pro: process.env.STRIPE_PRICE_PRO,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE
  };

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: prices[plan], quantity: 1 }],
    success_url: 'https://app.smile360.io/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://smile360.io/pricing',
    metadata: { plan, email }
  });

  return NextResponse.json({ url: session.url });
}