
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  Zap 
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface SubscriptionStatus {
  status: string;
  plan: string;
  trialDaysRemaining: number;
  trialEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
  maxUsers: number;
  maxPatients: number;
}

interface SubscriptionStatusProps {
  compact?: boolean;
  showActions?: boolean;
}

export default function SubscriptionStatus({ compact = false, showActions = true }: SubscriptionStatusProps) {
  const { data: session } = useSession() || {};
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchStatus();
    }
  }, [session]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/billing/subscription-status');
      const data = await response.json();

      if (data.success) {
        setStatus(data.data.organization);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trial':
        return 'bg-blue-500';
      case 'canceled':
      case 'cancelled':
        return 'bg-red-500';
      case 'past_due':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'trial':
        return <Calendar className="w-4 h-4" />;
      case 'canceled':
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      case 'past_due':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'pro':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) return null;
  if (!status) return null;

  const isTrialExpiringSoon = status.status === 'trial' && status.trialDaysRemaining <= 3;
  const isTrialExpired = status.status === 'trial' && status.trialDaysRemaining <= 0;

  if (compact) {
    return (
      <div className="p-3 bg-card rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPlanIcon(status.plan)}
            <span className="font-medium capitalize">
              Plan {status.plan}
            </span>
            <Badge 
              className={`${getStatusColor(status.status)} text-white`}
              variant="secondary"
            >
              {getStatusIcon(status.status)}
              <span className="ml-1 capitalize">
                {status.status === 'trial' ? 'Prueba' : 
                 status.status === 'active' ? 'Activo' : status.status}
              </span>
            </Badge>
          </div>
          
          {status.status === 'trial' && (
            <span className="text-sm text-muted-foreground">
              {status.trialDaysRemaining} días restantes
            </span>
          )}
        </div>

        {(isTrialExpiringSoon || status.cancelAtPeriodEnd) && (
          <div className="mt-2">
            <Alert variant={isTrialExpired ? "destructive" : "default"} className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {isTrialExpired ? (
                  'Tu período de prueba ha expirado'
                ) : isTrialExpiringSoon ? (
                  `Tu prueba expira en ${status.trialDaysRemaining} días`
                ) : (
                  'Suscripción se cancelará al final del período'
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlanIcon(status.plan)}
          Plan {status.plan.charAt(0).toUpperCase() + status.plan.slice(1)}
        </CardTitle>
        <CardDescription>
          Estado de tu suscripción
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estado:</span>
          <Badge className={`${getStatusColor(status.status)} text-white`}>
            {getStatusIcon(status.status)}
            <span className="ml-1 capitalize">
              {status.status === 'trial' ? 'Prueba' : 
               status.status === 'active' ? 'Activo' : status.status}
            </span>
          </Badge>
        </div>

        {status.status === 'trial' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Días restantes:</span>
              <span className={`font-medium ${isTrialExpiringSoon ? 'text-red-500' : ''}`}>
                {status.trialDaysRemaining}
              </span>
            </div>
            {status.trialEndsAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expira:</span>
                <span className="text-sm">
                  {new Date(status.trialEndsAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Usuarios:</span>
              <div className="font-medium">
                {status.maxUsers === -1 ? 'Ilimitados' : status.maxUsers}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Pacientes:</span>
              <div className="font-medium">
                {status.maxPatients === -1 ? 'Ilimitados' : status.maxPatients}
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {isTrialExpired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tu período de prueba ha expirado. Elige un plan para continuar usando SmileSys.
            </AlertDescription>
          </Alert>
        )}

        {isTrialExpiringSoon && !isTrialExpired && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu período de prueba expira pronto. ¡Elige un plan para no interrumpir tu servicio!
            </AlertDescription>
          </Alert>
        )}

        {status.cancelAtPeriodEnd && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tu suscripción se cancelará al final del período actual.
            </AlertDescription>
          </Alert>
        )}

        {/* Acciones */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {status.status === 'trial' && (
              <Button asChild size="sm" className="flex-1">
                <Link href="/planes">
                  <Crown className="w-4 h-4 mr-2" />
                  Elegir Plan
                </Link>
              </Button>
            )}

            {status.status !== 'trial' && (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/facturacion/suscripcion">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gestionar
                </Link>
              </Button>
            )}

            {(status.status === 'trial' || status.plan === 'basic') && (
              <Button asChild variant="outline" size="sm">
                <Link href="/planes">
                  Actualizar
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
