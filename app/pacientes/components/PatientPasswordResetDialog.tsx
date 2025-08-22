
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PatientPasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export function PatientPasswordResetDialog({ 
  isOpen, 
  onClose, 
  patient 
}: PatientPasswordResetDialogProps) {
  const [email, setEmail] = useState(patient.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔄 Enviando reset de contraseña para paciente:', patient.id);
      
      const response = await fetch('/api/password-recovery', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al enviar el email de recuperación');
        return;
      }

      if (data.emailSent) {
        setEmailSent(true);
        toast.success(`Email de recuperación enviado a ${email}`);
        console.log('✅ Email de recuperación enviado exitosamente');
      } else {
        setError('No se pudo enviar el email. Intenta nuevamente.');
      }

    } catch (error) {
      console.error('❌ Error enviando reset:', error);
      setError('Error de conexión. Verifica la configuración e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    setError('');
    setEmail(patient.email || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {emailSent ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Email Enviado</span>
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                <span>Enviar Recuperación de Contraseña</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {emailSent ? (
              `Se ha enviado el enlace de recuperación a ${email}`
            ) : (
              `Paciente: ${patient.firstName} ${patient.lastName}`
            )}
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                El paciente recibirá un enlace válido por 1 hora para restablecer su contraseña.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Instrucciones para el paciente:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Revisar bandeja de entrada y spam</li>
                <li>Hacer clic en el enlace recibido</li>
                <li>Seguir las instrucciones para crear nueva contraseña</li>
                <li>El enlace expira en 1 hora por seguridad</li>
              </ul>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del paciente</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Debe ser el email registrado para este paciente
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !email}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {emailSent && (
          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
