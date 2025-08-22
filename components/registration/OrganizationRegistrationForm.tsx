
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
  storageLimit: number;
  features: string[];
  isPopular: boolean;
}

export default function OrganizationRegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const [slugChecked, setSlugChecked] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(false);
  
  const [formData, setFormData] = useState({
    clinicName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    password: '',
    confirmPassword: '',
    country: 'MX'
  });

  // Cargar planes al montar
  React.useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/organizations/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset slug check if clinic name changes
    if (field === 'clinicName') {
      setSlugChecked(false);
      setSlugAvailable(false);
    }
  };

  const checkSlugAvailability = async () => {
    if (!formData.clinicName.trim()) {
      toast.error('Ingresa el nombre de la clínica primero');
      return;
    }

    const slug = formData.clinicName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (slug.length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres');
      return;
    }

    try {
      const response = await fetch(`/api/organizations/register?slug=${encodeURIComponent(slug)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setSlugChecked(true);
      setSlugAvailable(data.available);
      
      if (data.available) {
        toast.success('¡Nombre disponible!');
      } else {
        toast.error('Este nombre ya está en uso, prueba con otro');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Error al verificar disponibilidad');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slugChecked || !slugAvailable) {
      toast.error('Verifica la disponibilidad del nombre de la clínica');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/organizations/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Registro exitoso! Redirigiendo...');
        
        // Redirigir al login con el slug de la organización
        setTimeout(() => {
          router.push(data.loginUrl);
        }, 2000);
      } else {
        toast.error(data.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(p => p.slug === selectedPlan);
  const price = selectedPlanData ? 
    (billingType === 'monthly' ? selectedPlanData.monthlyPrice : selectedPlanData.yearlyPrice) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crea tu Clínica Digital con <span className="text-blue-600">Smile 360</span>
          </h1>
          <p className="text-xl text-gray-600">
            Únete a cientos de clínicas que ya digitalizaron su gestión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Selección de Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Selecciona tu Plan</CardTitle>
              <CardDescription>
                Elige el plan que mejor se adapte a tu clínica. Puedes cambiar en cualquier momento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Selector de facturación */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg">
                  <Button
                    type="button"
                    variant={billingType === 'monthly' ? 'default' : 'ghost'}
                    onClick={() => setBillingType('monthly')}
                    className="px-4 py-2"
                  >
                    Mensual
                  </Button>
                  <Button
                    type="button"
                    variant={billingType === 'yearly' ? 'default' : 'ghost'}
                    onClick={() => setBillingType('yearly')}
                    className="px-4 py-2"
                  >
                    Anual (2 meses gratis)
                  </Button>
                </div>
              </div>

              {/* Grid de planes */}
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`relative cursor-pointer transition-all ${
                      selectedPlan === plan.slug 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-md'
                    } ${plan.isPopular ? 'border-blue-200' : ''}`}
                    onClick={() => setSelectedPlan(plan.slug)}
                  >
                    {plan.isPopular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                        Más Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-blue-600">
                        ${billingType === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                        <span className="text-sm text-gray-500">
                          /{billingType === 'monthly' ? 'mes' : 'año'}
                        </span>
                      </div>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                        <div>Usuarios: {plan.maxUsers === -1 ? 'Ilimitados' : plan.maxUsers}</div>
                        <div>Pacientes: {plan.maxPatients === -1 ? 'Ilimitados' : plan.maxPatients.toLocaleString()}</div>
                        <div>Almacenamiento: {plan.storageLimit} GB</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Información de la Clínica */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Clínica</CardTitle>
              <CardDescription>
                Proporciona los datos básicos de tu clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nombre de la Clínica *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="clinicName"
                      value={formData.clinicName}
                      onChange={(e) => handleInputChange('clinicName', e.target.value)}
                      placeholder="Ej: Clínica Dental Sonríe"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={checkSlugAvailability}
                      disabled={!formData.clinicName.trim()}
                    >
                      {slugChecked ? (
                        slugAvailable ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )
                      ) : (
                        'Verificar'
                      )}
                    </Button>
                  </div>
                  {slugChecked && (
                    <p className={`text-sm ${slugAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {slugAvailable 
                        ? '✓ Nombre disponible' 
                        : '✗ Nombre no disponible'
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MX">México</SelectItem>
                      <SelectItem value="ES">España</SelectItem>
                      <SelectItem value="CO">Colombia</SelectItem>
                      <SelectItem value="AR">Argentina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Propietario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Administrador Principal</CardTitle>
              <CardDescription>
                Datos de la persona que administrará la clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nombre Completo *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    placeholder="Ej: Dr. Juan Pérez"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    placeholder="admin@clinica.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Teléfono</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                    placeholder="+52 555 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen y Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Plan seleccionado:</span>
                  <Badge variant="secondary">{selectedPlanData?.name}</Badge>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Precio:</span>
                  <span className="font-bold text-lg">
                    ${price.toFixed(2)} USD/{billingType === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Prueba gratuita:</span>
                  <span className="text-green-600 font-medium">15 días</span>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={loading || !slugChecked || !slugAvailable}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando clínica...
                  </>
                ) : (
                  'Crear mi Clínica Digital'
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Al registrarte aceptas nuestros términos de servicio y política de privacidad.
                No se realizará ningún cargo durante los primeros 15 días.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
