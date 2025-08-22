
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Smile, Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔄 Enviando solicitud de recuperación para:', email);
      
      const response = await fetch('/api/password-recovery', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 Datos de respuesta:', data);

      if (!response.ok) {
        setError(data.error || 'Error al procesar la solicitud');
        return;
      }

      if (data.emailSent) {
        setEmailSent(true);
        toast.success('¡Email de recuperación enviado!');
        console.log('✅ Email enviado exitosamente');
      } else {
        setError('No se pudo enviar el email. Intenta nuevamente.');
      }

    } catch (error) {
      console.error('❌ Error en cliente:', error);
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">¡Email Enviado!</CardTitle>
              <CardDescription>
                Revisa tu bandeja de entrada
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                  El enlace es válido por 1 hora.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>Si no recibes el email en los próximos minutos:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Revisa tu carpeta de spam</li>
                  <li>Verifica que el email sea correcto</li>
                  <li>Contacta la clínica si persisten los problemas</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setError('');
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Enviar a otro email
                </Button>
                
                <Link href="/portal/login" className="block">
                  <Button className="w-full">
                    Volver al Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back to login */}
        <div className="mb-6">
          <Link
            href="/portal/login"
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al login
          </Link>
        </div>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Smile className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h1>
          <p className="text-gray-600 mt-2">Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        {/* Forgot Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              Ingresa tu email para recibir instrucciones de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email registrado</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Debe ser el email que usaste al registrarte en la clínica
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !email}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar enlace de recuperación
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/portal/login" className="text-blue-600 hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• El enlace de recuperación es válido por 1 hora</p>
              <p>• Si no tienes acceso a tu email, contacta la clínica</p>
              <p>• Revisa también la carpeta de spam</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 SmileSys. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
