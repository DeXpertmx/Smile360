
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, X, CreditCard, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentFormProps {
  financingPlan: any;
  onSave: () => void;
  onCancel: () => void;
}

export function PaymentForm({ financingPlan, onSave, onCancel }: PaymentFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
  }, [financingPlan.id]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/financing-plans/${financingPlan.id}/payments?status=Pendiente`);
      if (response.ok) {
        const data = await response.json();
        // Incluir también los pagos parciales
        const allPayments = await fetch(`/api/financing-plans/${financingPlan.id}/payments`);
        if (allPayments.ok) {
          const allData = await allPayments.json();
          const pendingPayments = allData.filter((p: any) => 
            p.status === 'Pendiente' || (p.status === 'Parcial' && p.remainingAmount > 0)
          );
          setPayments(pendingPayments || []);
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error al cargar los pagos pendientes');
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
    const payment = payments.find((p: any) => p.id === paymentId);
    if (payment) {
      setPaymentData(prev => ({
        ...prev,
        amount: (payment as any).remainingAmount.toString(),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPayment) {
      toast.error('Selecciona un pago para procesar');
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    const selectedPaymentData = payments.find((p: any) => p.id === selectedPayment) as any;
    if (amount > selectedPaymentData.remainingAmount) {
      toast.error('El monto no puede exceder el saldo pendiente');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/financing-plans/${financingPlan.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment,
          amount,
          paymentMethod: paymentData.paymentMethod,
          reference: paymentData.reference,
          notes: paymentData.notes,
        }),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (payment: any) => {
    if (payment.status === 'Parcial') return 'bg-orange-100 text-orange-800';
    if (isBefore(new Date(payment.dueDate), startOfDay(new Date()))) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusText = (payment: any) => {
    if (payment.status === 'Parcial') return 'Parcial';
    if (isBefore(new Date(payment.dueDate), startOfDay(new Date()))) {
      return 'Vencido';
    }
    return 'Pendiente';
  };

  const selectedPaymentData = payments.find((p: any) => p.id === selectedPayment) as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registrar Pago</h2>
          <p className="text-gray-600">Plan: {financingPlan.title}</p>
          <p className="text-sm text-gray-500">
            Paciente: {financingPlan.patient.firstName} {financingPlan.patient.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Seleccionar Cuota a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seleccionar</TableHead>
                    <TableHead>Cuota</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow 
                      key={payment.id} 
                      className={selectedPayment === payment.id ? "bg-blue-50" : ""}
                    >
                      <TableCell>
                        <input
                          type="radio"
                          name="payment"
                          value={payment.id}
                          checked={selectedPayment === payment.id}
                          onChange={(e) => handlePaymentSelect(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                      </TableCell>
                      <TableCell className="font-medium">#{payment.paymentNumber}</TableCell>
                      <TableCell>
                        {format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        ${payment.scheduledAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-green-600">
                        ${payment.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-medium text-orange-600">
                        ${payment.remainingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(payment)}>
                          {getPaymentStatusText(payment)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {payments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay pagos pendientes
                </h3>
                <p className="text-gray-600">
                  Todos los pagos de este plan han sido completados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Información del Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedPaymentData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Cuota #{selectedPaymentData.paymentNumber} seleccionada
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>Fecha de vencimiento: {format(new Date(selectedPaymentData.dueDate), "dd/MM/yyyy", { locale: es })}</p>
                    <p>Monto programado: ${selectedPaymentData.scheduledAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <p>Monto pagado: ${selectedPaymentData.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <p className="font-medium">Saldo pendiente: ${selectedPaymentData.remainingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="amount">Monto a Pagar *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  disabled={!selectedPayment}
                />
                {selectedPaymentData && parseFloat(paymentData.amount) > selectedPaymentData.remainingAmount && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    El monto excede el saldo pendiente
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="paymentMethod">Método de Pago *</Label>
                <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                    <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Depósito">Depósito Bancario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reference">Referencia/Comprobante</Label>
                <Input
                  id="reference"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Número de referencia, autorización, etc."
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observaciones adicionales sobre el pago..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !selectedPayment || !paymentData.amount || !paymentData.paymentMethod}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Registrando...' : 'Registrar Pago'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
