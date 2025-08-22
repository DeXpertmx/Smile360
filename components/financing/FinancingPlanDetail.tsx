
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Edit, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface FinancingPlanDetailProps {
  plan: any;
  onEdit: () => void;
  onClose: () => void;
  onPayment: () => void;
  onRefresh: () => void;
}

export function FinancingPlanDetail({ plan, onEdit, onClose, onPayment, onRefresh }: FinancingPlanDetailProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (plan) {
      fetchPayments();
    }
  }, [plan]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/financing-plans/${plan.id}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financing-plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalStatus: 'Aprobado'
        }),
      });

      if (response.ok) {
        toast.success('Plan aprobado exitosamente');
        onRefresh();
      } else {
        throw new Error('Error al aprobar el plan');
      }
    } catch (error) {
      toast.error('Error al aprobar el plan');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financing-plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalStatus: 'Rechazado'
        }),
      });

      if (response.ok) {
        toast.success('Plan rechazado');
        onRefresh();
      } else {
        throw new Error('Error al rechazar el plan');
      }
    } catch (error) {
      toast.error('Error al rechazar el plan');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'Pagado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Vencido':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Parcial':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPaymentStatusColor = (payment: any) => {
    if (payment.status === 'Pagado') return 'bg-green-100 text-green-800';
    if (payment.status === 'Parcial') return 'bg-orange-100 text-orange-800';
    if (payment.status === 'Pendiente' && isBefore(new Date(payment.dueDate), startOfDay(new Date()))) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusText = (payment: any) => {
    if (payment.status === 'Pagado') return 'Pagado';
    if (payment.status === 'Parcial') return 'Parcial';
    if (payment.status === 'Pendiente' && isBefore(new Date(payment.dueDate), startOfDay(new Date()))) {
      return 'Vencido';
    }
    return 'Pendiente';
  };

  const statusColors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Activo': 'bg-blue-100 text-blue-800',
    'Completado': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800',
    'Vencido': 'bg-red-100 text-red-800',
  };

  const approvalStatusColors = {
    'Por_Aprobar': 'bg-orange-100 text-orange-800',
    'Aprobado': 'bg-green-100 text-green-800',
    'Rechazado': 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la Lista
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            <p className="text-gray-600">Plan #{plan.planNumber}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {plan.approvalStatus === 'Por_Aprobar' && session?.user?.role === 'ADMIN' && (
            <>
              <Button variant="outline" onClick={handleReject} disabled={loading}>
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
              <Button onClick={handleApprove} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar
              </Button>
            </>
          )}
          
          {plan.status === 'Activo' && (
            <Button onClick={onPayment}>
              <CreditCard className="w-4 h-4 mr-2" />
              Registrar Pago
            </Button>
          )}
          
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Estado y Progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColors[plan.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                {plan.status}
              </Badge>
              <Badge variant="outline" className={approvalStatusColors[plan.approvalStatus as keyof typeof approvalStatusColors] || 'bg-gray-100 text-gray-800'}>
                {plan.approvalStatus.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Estado del Plan</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                ${plan.stats.totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Pagado</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">
                ${plan.stats.remainingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm text-gray-600">Por Cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progreso</span>
                <span>{plan.stats.progress}%</span>
              </div>
              <Progress value={plan.stats.progress} className="h-2" />
            </div>
            <p className="text-sm text-gray-600">
              {plan.stats.paidPayments}/{plan.stats.paidPayments + plan.stats.pendingPayments} cuotas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles del Plan</TabsTrigger>
          <TabsTrigger value="payments">Cronograma de Pagos</TabsTrigger>
          {plan.guarantorName && <TabsTrigger value="guarantor">Información del Aval</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{plan.patient.firstName} {plan.patient.lastName}</p>
                  <p className="text-sm text-gray-600">Expediente: {plan.patient.numeroExpediente}</p>
                </div>
                
                {plan.patient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{plan.patient.phone}</span>
                  </div>
                )}
                
                {plan.patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{plan.patient.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información Financiera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Información Financiera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Monto Total:</span>
                  <span className="text-sm font-bold">
                    ${plan.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Enganche:</span>
                  <span className="text-sm">
                    ${plan.downPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Monto Financiado:</span>
                  <span className="text-sm font-bold text-blue-600">
                    ${plan.financedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cuota {plan.paymentFrequency}:</span>
                  <span className="text-sm font-bold text-green-600">
                    ${plan.paymentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Tasa de Interés:</span>
                  <span className="text-sm">{plan.interestRate}% anual</span>
                </div>
              </CardContent>
            </Card>

            {/* Fechas Importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Fechas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fecha de Creación:</span>
                  <span className="text-sm">
                    {format(new Date(plan.createdAt), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Primer Pago:</span>
                  <span className="text-sm">
                    {format(new Date(plan.firstPaymentDate), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Último Pago:</span>
                  <span className="text-sm">
                    {format(new Date(plan.finalPaymentDate), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                
                {plan.signatureDate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fecha de Firma:</span>
                    <span className="text-sm">
                      {format(new Date(plan.signatureDate), "dd/MM/yyyy", { locale: es })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Descripción:</p>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                )}
                
                {plan.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notas:</p>
                    <p className="text-sm text-gray-600">{plan.notes}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium mb-1">Doctor Responsable:</p>
                  <p className="text-sm text-gray-600">
                    {plan.doctor.firstName} {plan.doctor.lastName}
                  </p>
                </div>
                
                {plan.budget && (
                  <div>
                    <p className="text-sm font-medium mb-1">Presupuesto Asociado:</p>
                    <p className="text-sm text-gray-600">{plan.budget.title}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Términos y Condiciones */}
          {plan.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Términos y Condiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.terms}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead>Monto Programado</TableHead>
                      <TableHead>Monto Pagado</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de Pago</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getPaymentStatusIcon(getPaymentStatusText(payment))}
                            #{payment.paymentNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          ${payment.scheduledAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          ${payment.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-orange-600">
                          ${payment.remainingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(payment)}>
                            {getPaymentStatusText(payment)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.paymentDate 
                            ? format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {payment.paymentMethod || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {plan.guarantorName && (
          <TabsContent value="guarantor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Aval
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Nombre Completo:</p>
                    <p className="text-sm text-gray-600">{plan.guarantorName}</p>
                  </div>
                  
                  {plan.guarantorPhone && (
                    <div>
                      <p className="text-sm font-medium mb-1">Teléfono:</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {plan.guarantorPhone}
                      </p>
                    </div>
                  )}
                  
                  {plan.guarantorEmail && (
                    <div>
                      <p className="text-sm font-medium mb-1">Email:</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {plan.guarantorEmail}
                      </p>
                    </div>
                  )}
                  
                  {plan.guarantorAddress && (
                    <div>
                      <p className="text-sm font-medium mb-1">Dirección:</p>
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        {plan.guarantorAddress}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
