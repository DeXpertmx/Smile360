
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PenTool, 
  Trash2, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  Smartphone,
  FileText,
  User,
  Stethoscope
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

interface TreatmentOrder {
  id: string;
  orderNumber: string;
  procedureType: string;
  procedureDescription?: string;
  treatmentDetails?: string;
  diagnosis?: string;
  risks?: string;
  alternatives?: string;
  postOperativeCare?: string;
  expectedOutcome?: string;
  status: string;
  totalCost: number;
  paymentTerms?: string;
  scheduledDate?: string;
  patientSignature?: string;
  signatureDate?: string;
  notes?: string;
  patient: {
    firstName: string;
    lastName: string;
    numeroExpediente: string;
    email?: string;
    phone?: string;
  };
  doctor: {
    firstName: string;
    lastName: string;
    especialidad?: string;
  };
  budget?: {
    budgetNumber: string;
    title: string;
    total: number;
  };
  treatmentPlan?: {
    title: string;
    description: string;
  };
}

export default function SignTreatmentOrderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const token = searchParams.get('token');

  const [order, setOrder] = useState<TreatmentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId, token]);

  const loadOrder = async () => {
    try {
      const url = token 
        ? `/api/treatment-orders/${orderId}?token=${token}`
        : `/api/treatment-orders/${orderId}`;
        
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        
        if (data.status !== 'Pendiente') {
          toast.error('Esta orden ya ha sido procesada');
        }
      } else {
        throw new Error('Error al cargar la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo cargar la orden de tratamiento');
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmitSignature = async () => {
    if (!hasSignature) {
      toast.error('Por favor, firme en el área designada antes de continuar');
      return;
    }

    setSigning(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const signatureDataURL = canvas.toDataURL('image/png');

      const url = token 
        ? `/api/treatment-orders/${orderId}/sign?token=${token}`
        : `/api/treatment-orders/${orderId}/sign`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientSignature: signatureDataURL
        }),
      });

      if (response.ok) {
        toast.success('¡Orden firmada exitosamente!');
        setShowSignatureModal(false);
        setTimeout(() => {
          router.push('/portal');
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al firmar la orden');
      }
    } catch (error) {
      console.error('Error signing order:', error);
      toast.error('No se pudo firmar la orden de tratamiento');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando orden de tratamiento...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
            <p className="text-gray-600 mb-4">
              La orden de tratamiento solicitada no existe o ya no está disponible.
            </p>
            <Button onClick={() => router.push('/portal')}>
              Ir al Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order.status !== 'Pendiente') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Orden ya procesada</h2>
            <p className="text-gray-600 mb-4">
              Esta orden de tratamiento ya ha sido {order.status === 'Firmada' ? 'firmada' : 'procesada'}.
            </p>
            <Button onClick={() => router.push('/portal')}>
              Ir al Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header móvil-friendly */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Firma Digital</h1>
                <p className="text-sm text-gray-500">SmileSys</p>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              Pendiente de Firma
            </Badge>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Información básica de la orden */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Orden de Tratamiento #{order.orderNumber}
            </CardTitle>
            <CardDescription>
              Revise los detalles y firme digitalmente para aprobar el tratamiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Paciente:</span>
                <p>{order.patient.firstName} {order.patient.lastName}</p>
              </div>
              <div>
                <span className="font-medium">Médico:</span>
                <p>Dr(a). {order.doctor.firstName} {order.doctor.lastName}</p>
              </div>
              <div>
                <span className="font-medium">Procedimiento:</span>
                <p>{order.procedureType}</p>
              </div>
              <div>
                <span className="font-medium">Costo Total:</span>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(order.totalCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del tratamiento */}
        <Card>
          <CardHeader>
            <CardTitle>Plan de Tratamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">
                {order.treatmentDetails || order.treatmentPlan?.description || 
                 'Plan de tratamiento detallado según presupuesto aprobado.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consentimiento informado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Consentimiento Informado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p>
                <strong>DESCRIPCIÓN DEL TRATAMIENTO:</strong> El tratamiento consiste en {order.procedureType.toLowerCase()} 
                según el plan establecido. El procedimiento se realizará bajo la supervisión del profesional asignado.
              </p>
              
              <p>
                <strong>RIESGOS Y COMPLICACIONES:</strong> Como en cualquier procedimiento médico, existen riesgos potenciales 
                que incluyen pero no se limitan a: dolor, inflamación, infección, reacciones alérgicas, o resultados no esperados. 
                El profesional explicará los riesgos específicos del procedimiento.
              </p>
              
              <p>
                <strong>CUIDADOS POST-TRATAMIENTO:</strong> Se proporcionarán instrucciones específicas para el cuidado 
                post-tratamiento que deben seguirse para asegurar la mejor recuperación posible.
              </p>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium">
                  Al firmar este documento, confirmo que:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>He sido informado sobre el tratamiento, riesgos y alternativas</li>
                  <li>He tenido la oportunidad de hacer preguntas</li>
                  <li>Consiento en proceder con el tratamiento propuesto</li>
                  <li>Entiendo los costos asociados y acepto los términos de pago</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón de firma */}
        <Card>
          <CardContent className="p-6 text-center">
            <Button 
              size="lg" 
              onClick={() => setShowSignatureModal(true)}
              className="w-full md:w-auto"
            >
              <PenTool className="w-5 h-5 mr-2" />
              Firmar Digitalmente
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Toque para abrir el área de firma
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Modal de firma */}
      <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Firma Digital
            </DialogTitle>
            <DialogDescription>
              Firme en el área blanca usando su dedo, stylus o mouse
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="border bg-white rounded cursor-crosshair w-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: 'none' }}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Área de firma - Use su dedo o stylus en dispositivos táctiles
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={clearSignature}
                disabled={!hasSignature}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Firma
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSignatureModal(false)} 
              disabled={signing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitSignature} 
              disabled={!hasSignature || signing}
            >
              {signing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Firmando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Firmar y Aprobar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
