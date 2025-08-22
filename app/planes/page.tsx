
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxPatients: number;
  features: string[];
  isPopular: boolean;
  trialDays: number;
}

export default function PlanesPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/organizations/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      } else {
        toast.error('Error al cargar los planes');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planSlug: string) => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setLoadingSubscription(true);
    setSelectedPlan(planSlug);

    try {
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planSlug,
          billingCycle,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/planes?subscription=cancelled`,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirigir a Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.error || 'Error al procesar la suscripción');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Error al procesar la suscripción');
    } finally {
      setLoadingSubscription(false);
      setSelectedPlan('');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateYearlyDiscount = (monthly: number, yearly: number) => {
    const monthlyAnnual = monthly * 12;
    const discount = ((monthlyAnnual - yearly) / monthlyAnnual) * 100;
    return Math.round(discount);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Cargando planes...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Elige el plan perfecto para tu clínica
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Comienza con 14 días gratis, sin necesidad de tarjeta de crédito
        </p>

        {/* Toggle de facturación */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
            Mensual
          </span>
          <Switch
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <span className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
            Anual
          </span>
          {billingCycle === 'yearly' && (
            <Badge variant="secondary" className="ml-2">
              Ahorra hasta 17%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Más Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  {formatPrice(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                </div>
                <div className="text-sm text-muted-foreground">
                  por {billingCycle === 'monthly' ? 'mes' : 'año'}
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-green-600 font-medium">
                    Ahorras {calculateYearlyDiscount(plan.monthlyPrice, plan.yearlyPrice)}%
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                {plan.trialDays} días de prueba gratis
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">
                    {plan.maxUsers === -1 ? 'Usuarios ilimitados' : `Hasta ${plan.maxUsers} usuarios`}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">
                    {plan.maxPatients === -1 ? 'Pacientes ilimitados' : `Hasta ${plan.maxPatients} pacientes`}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Incluye:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.isPopular ? "default" : "outline"}
                size="lg"
                onClick={() => handleSubscribe(plan.slug)}
                disabled={loadingSubscription}
              >
                {loadingSubscription && selectedPlan === plan.slug ? (
                  'Procesando...'
                ) : (
                  <>
                    {session?.user?.organizationStatus === 'trial' ? 
                      'Actualizar Plan' : 
                      'Comenzar Prueba Gratis'
                    }
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>
          ¿Tienes preguntas? 
          <a href="mailto:soporte@smilesys.com" className="text-primary hover:underline ml-1">
            Contáctanos
          </a>
        </p>
        <p className="mt-2">
          Todos los planes incluyen soporte técnico y actualizaciones gratuitas
        </p>
      </div>
    </div>
  );
}
