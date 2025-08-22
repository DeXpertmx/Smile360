
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, Calendar, Download, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SubscriptionData {
  organization: {
    id: string;
    name: string;
    status: string;
    plan: string;
    billingCycle: string;
    trialEndsAt?: string;
    trialDaysRemaining: number;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd: boolean;
    maxUsers: number;
    maxPatients: number;
    features: string[];
  };
  subscription?: {
    id: string;
    status: string;
    planType: string;
    billingCycle: string;
    amount: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    canceledAt?: string;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    paidAt?: string;
    failedAt?: string;
    paymentMethodLast4?: string;
    paymentMethodBrand?: string;
  }>;
  recentInvoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    periodStart: string;
    periodEnd: string;
    hostedInvoiceUrl?: string;
    invoicePdf?: string;
    paidAt?: string;
  }>;
}

export default function SuscripcionPage() {
  const { data: session } = useSession() || {};
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchSubscriptionData();
    }
  }, [session]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/billing/subscription-status');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Error al cargar información de facturación');
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Error al cargar información de facturación');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción? Se cancelará al final del período de facturación actual.')) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchSubscriptionData();
      } else {
        toast.error(result.error || 'Error al cancelar suscripción');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Error al cancelar suscripción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);

    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reactivate',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchSubscriptionData();
      } else {
        toast.error(result.error || 'Error al reactivar suscripción');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Error al reactivar suscripción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setActionLoading(true);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const result = await response.json();

      if (result.success && result.portalUrl) {
        window.open(result.portalUrl, '_blank');
      } else {
        toast.error(result.error || 'Error al abrir portal de facturación');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Error al abrir portal de facturación');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Activa</Badge>;
      case 'trial':
        return <Badge variant="secondary"><Calendar className="w-3 h-3 mr-1" />Prueba</Badge>;
      case 'canceled':
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Cancelada</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Vencida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Cargando información...</h1>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p>No se pudo cargar la información de facturación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Facturación y Suscripción</h1>
        <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
      </div>

      {/* Estado del Trial */}
      {data.organization.status === 'trial' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Período de prueba activo:</strong> Te quedan {data.organization.trialDaysRemaining} días de prueba gratuita.
            {data.organization.trialEndsAt && (
              <> Expira el {format(new Date(data.organization.trialEndsAt), 'PPP', { locale: es })}.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Cancelación pendiente */}
      {data.organization.cancelAtPeriodEnd && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Suscripción programada para cancelar:</strong> Tu suscripción se cancelará el {' '}
            {data.organization.currentPeriodEnd && 
              format(new Date(data.organization.currentPeriodEnd), 'PPP', { locale: es })}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Información de Suscripción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Suscripción Actual
              {getStatusBadge(data.organization.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">
                Plan {data.organization.plan.charAt(0).toUpperCase() + data.organization.plan.slice(1)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Facturación {data.organization.billingCycle === 'monthly' ? 'mensual' : 'anual'}
              </p>
            </div>

            {data.subscription && (
              <div>
                <p className="font-medium">
                  {formatPrice(data.subscription.amount, data.subscription.currency)} / {' '}
                  {data.subscription.billingCycle === 'monthly' ? 'mes' : 'año'}
                </p>
                {data.organization.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Próxima renovación: {format(new Date(data.organization.currentPeriodEnd), 'PPP', { locale: es })}
                  </p>
                )}
              </div>
            )}

            <div>
              <h4 className="font-medium">Límites actuales:</h4>
              <ul className="text-sm text-muted-foreground">
                <li>
                  {data.organization.maxUsers === -1 ? 'Usuarios ilimitados' : `${data.organization.maxUsers} usuarios`}
                </li>
                <li>
                  {data.organization.maxPatients === -1 ? 'Pacientes ilimitados' : `${data.organization.maxPatients} pacientes`}
                </li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              {data.organization.status !== 'trial' && (
                <Button 
                  onClick={handleOpenBillingPortal} 
                  disabled={actionLoading}
                  size="sm"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gestionar Facturación
                </Button>
              )}

              {data.organization.status === 'trial' && (
                <Button onClick={() => window.location.href = '/planes'} size="sm">
                  Elegir Plan
                </Button>
              )}
            </div>

            {data.subscription && (
              <div className="pt-2 border-t">
                {data.organization.cancelAtPeriodEnd ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading}
                  >
                    Reactivar Suscripción
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                  >
                    Cancelar Suscripción
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pagos Recientes</CardTitle>
            <CardDescription>Últimos movimientos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentPayments.length > 0 ? (
              <div className="space-y-3">
                {data.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">
                        {formatPrice(payment.amount, payment.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.description || 'Pago de suscripción'}
                      </p>
                      {payment.paidAt && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.paidAt), 'PPP', { locale: es })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(payment.status)}
                      {payment.paymentMethodBrand && payment.paymentMethodLast4 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {payment.paymentMethodBrand.toUpperCase()} •••• {payment.paymentMethodLast4}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay pagos registrados
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Facturas Recientes */}
      {data.recentInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Facturas Recientes</CardTitle>
            <CardDescription>Descarga tus facturas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">
                      {formatPrice(invoice.amount, invoice.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.periodStart), 'PPP', { locale: es })} - {' '}
                      {format(new Date(invoice.periodEnd), 'PPP', { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invoice.status)}
                    <div className="flex gap-1">
                      {invoice.hostedInvoiceUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {invoice.invoicePdf && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invoice.invoicePdf, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
