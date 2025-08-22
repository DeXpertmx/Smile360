
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PatientLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setupSuccess = searchParams.get('setup') === 'success';
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<any>({});

  useEffect(() => {
    if (setupSuccess) {
      toast.success('¡Acceso configurado correctamente! Ahora puedes iniciar sesión.');
    }
  }, [setupSuccess]);

  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/patient-portal/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Error al iniciar sesión');
        return;
      }

      // Guardar token y datos del paciente en localStorage
      localStorage.setItem('patientToken', data.token);
      localStorage.setItem('patientData', JSON.stringify(data.patient));

      toast.success(`¡Bienvenido ${data.patient.firstName}!`);
      
      // Redirigir al portal del paciente
      router.push('/portal');

    } catch (error) {
      toast.error('Error al conectar con el servidor');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors((prev: any) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/icon.png" 
              alt="Smile360 Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Bienvenido a Smile360
          </CardTitle>
          <CardDescription className="text-gray-600">
            Inicia sesión en tu cuenta para continuar
          </CardDescription>
        </CardHeader>
        
        {setupSuccess && (
          <div className="mx-6 mb-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                ¡Tu acceso fue configurado exitosamente! Ahora puedes iniciar sesión.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${validationErrors.email ? "border-red-500" : ""}`}
                  placeholder="tu@email.com"
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${validationErrors.password ? "border-red-500" : ""}`}
                  placeholder="Tu contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            <Alert>
              <AlertDescription>
                Si no tienes acceso al portal, contacta a la clínica para solicitar una invitación.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              <p>
                ¿Problemas para acceder?{' '}
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  Contactar clínica
                </Button>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
