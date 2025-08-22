
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X, Calculator, User, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  numeroExpediente: string;
}

interface Budget {
  id: string;
  title: string;
  total: number;
}

interface FinancingTemplate {
  id: string;
  name: string;
  defaultInterestRate: number;
  defaultNumberOfPayments: number;
  defaultPaymentFrequency: string;
  defaultDownPaymentPercent: number;
  terms: string;
  requiresGuarantor: boolean;
}

interface FinancingPlanFormProps {
  plan?: any;
  onSave: () => void;
  onCancel: () => void;
}

export function FinancingPlanForm({ plan, onSave, onCancel }: FinancingPlanFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [templates, setTemplates] = useState<FinancingTemplate[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: plan?.patientId || "",
    budgetId: plan?.budgetId || "",
    title: plan?.title || "",
    description: plan?.description || "",
    totalAmount: plan?.totalAmount || "",
    downPayment: plan?.downPayment || "0",
    numberOfPayments: plan?.numberOfPayments || "12",
    paymentFrequency: plan?.paymentFrequency || "Mensual",
    interestRate: plan?.interestRate || "0",
    firstPaymentDate: plan?.firstPaymentDate ? new Date(plan.firstPaymentDate) : new Date(),
    notes: plan?.notes || "",
    terms: plan?.terms || "",
    requiresGuarantor: false,
    guarantorName: plan?.guarantorName || "",
    guarantorPhone: plan?.guarantorPhone || "",
    guarantorEmail: plan?.guarantorEmail || "",
    guarantorAddress: plan?.guarantorAddress || "",
  });

  // Calculations state
  const [calculations, setCalculations] = useState({
    financedAmount: 0,
    paymentAmount: 0,
    totalInterest: 0,
    finalDate: new Date(),
  });

  useEffect(() => {
    fetchPatients();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      fetchPatientBudgets(formData.patientId);
    }
  }, [formData.patientId]);

  useEffect(() => {
    calculateFinancing();
  }, [
    formData.totalAmount,
    formData.downPayment,
    formData.numberOfPayments,
    formData.interestRate,
    formData.paymentFrequency,
    formData.firstPaymentDate,
  ]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPatientBudgets = async (patientId: string) => {
    try {
      const response = await fetch(`/api/budgets?patientId=${patientId}&status=Aprobado`);
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets || []);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/financing-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const calculateFinancing = () => {
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const numberOfPayments = parseInt(formData.numberOfPayments) || 1;
    const interestRate = parseFloat(formData.interestRate) || 0;

    if (totalAmount <= 0 || numberOfPayments <= 0) return;

    const financedAmount = totalAmount - downPayment;
    let paymentAmount = financedAmount / numberOfPayments;
    let totalInterest = 0;

    // Calculate with interest if applicable
    if (interestRate > 0 && financedAmount > 0) {
      const monthlyRate = interestRate / 100 / 12;
      const periods = numberOfPayments;
      paymentAmount = (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, periods)) / 
                     (Math.pow(1 + monthlyRate, periods) - 1);
      totalInterest = (paymentAmount * numberOfPayments) - financedAmount;
    }

    // Calculate final date
    const finalDate = new Date(formData.firstPaymentDate);
    if (formData.paymentFrequency === 'Mensual') {
      finalDate.setMonth(finalDate.getMonth() + numberOfPayments - 1);
    } else if (formData.paymentFrequency === 'Quincenal') {
      finalDate.setDate(finalDate.getDate() + (numberOfPayments - 1) * 15);
    } else if (formData.paymentFrequency === 'Semanal') {
      finalDate.setDate(finalDate.getDate() + (numberOfPayments - 1) * 7);
    }

    setCalculations({
      financedAmount,
      paymentAmount,
      totalInterest,
      finalDate,
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const downPaymentAmount = (parseFloat(formData.totalAmount) || 0) * (template.defaultDownPaymentPercent / 100);

    setFormData(prev => ({
      ...prev,
      numberOfPayments: template.defaultNumberOfPayments.toString(),
      paymentFrequency: template.defaultPaymentFrequency,
      interestRate: template.defaultInterestRate.toString(),
      downPayment: downPaymentAmount.toString(),
      terms: template.terms || "",
      requiresGuarantor: template.requiresGuarantor,
    }));
  };

  const handleBudgetSelect = (budgetId: string) => {
    if (budgetId === "none") {
      setFormData(prev => ({
        ...prev,
        budgetId: "",
      }));
      return;
    }

    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    setFormData(prev => ({
      ...prev,
      budgetId,
      totalAmount: budget.total.toString(),
      title: `Plan de Financiamiento - ${budget.title}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.title || !formData.totalAmount || !formData.numberOfPayments) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    const downPayment = parseFloat(formData.downPayment) || 0;

    if (totalAmount <= 0) {
      toast.error('El monto total debe ser mayor a cero');
      return;
    }

    if (downPayment >= totalAmount) {
      toast.error('El enganche no puede ser mayor o igual al monto total');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        totalAmount,
        downPayment,
        numberOfPayments: parseInt(formData.numberOfPayments),
        interestRate: parseFloat(formData.interestRate) || 0,
        guarantorInfo: formData.requiresGuarantor ? {
          name: formData.guarantorName,
          phone: formData.guarantorPhone,
          email: formData.guarantorEmail,
          address: formData.guarantorAddress,
        } : null,
      };

      const url = plan ? `/api/financing-plans/${plan.id}` : '/api/financing-plans';
      const method = plan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar el plan de financiamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el plan de financiamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {plan ? 'Editar' : 'Nuevo'} Plan de Financiamiento
          </h2>
          <p className="text-gray-600">
            {plan ? 'Modifica los datos del plan de financiamiento' : 'Crea un nuevo plan de financiamiento para el paciente'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Plan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Paciente *</Label>
                  <Select value={formData.patientId} onValueChange={(value) => handleChange('patientId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} - {patient.numeroExpediente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budgetId">Presupuesto Asociado (Opcional)</Label>
                  <Select value={formData.budgetId} onValueChange={handleBudgetSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar presupuesto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin presupuesto asociado</SelectItem>
                      {budgets.map((budget) => (
                        <SelectItem key={budget.id} value={budget.id}>
                          {budget.title} - ${budget.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título del Plan *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ej: Plan de Financiamiento - Ortodoncia"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descripción detallada del plan de financiamiento..."
                  rows={3}
                />
              </div>

              {/* Plantilla */}
              <div>
                <Label>Aplicar Plantilla (Opcional)</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Configuración Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Monto Total *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => handleChange('totalAmount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="downPayment">Enganche/Pago Inicial</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    step="0.01"
                    value={formData.downPayment}
                    onChange={(e) => handleChange('downPayment', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="numberOfPayments">Número de Cuotas *</Label>
                  <Input
                    id="numberOfPayments"
                    type="number"
                    min="1"
                    value={formData.numberOfPayments}
                    onChange={(e) => handleChange('numberOfPayments', e.target.value)}
                    placeholder="12"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentFrequency">Frecuencia de Pago *</Label>
                  <Select value={formData.paymentFrequency} onValueChange={(value) => handleChange('paymentFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Quincenal">Quincenal</SelectItem>
                      <SelectItem value="Mensual">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="interestRate">Tasa de Interés Anual (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.interestRate}
                    onChange={(e) => handleChange('interestRate', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Fecha del Primer Pago *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.firstPaymentDate ? format(formData.firstPaymentDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.firstPaymentDate}
                        onSelect={(date) => handleChange('firstPaymentDate', date || new Date())}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aval/Garantía */}
          <Card>
            <CardHeader>
              <CardTitle>Aval/Garantía</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresGuarantor"
                  checked={formData.requiresGuarantor}
                  onCheckedChange={(checked) => handleChange('requiresGuarantor', checked)}
                />
                <Label htmlFor="requiresGuarantor">Requiere aval/garantía</Label>
              </div>

              {formData.requiresGuarantor && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="guarantorName">Nombre del Aval</Label>
                    <Input
                      id="guarantorName"
                      value={formData.guarantorName}
                      onChange={(e) => handleChange('guarantorName', e.target.value)}
                      placeholder="Nombre completo del aval"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guarantorPhone">Teléfono del Aval</Label>
                    <Input
                      id="guarantorPhone"
                      value={formData.guarantorPhone}
                      onChange={(e) => handleChange('guarantorPhone', e.target.value)}
                      placeholder="Teléfono de contacto"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guarantorEmail">Email del Aval</Label>
                    <Input
                      id="guarantorEmail"
                      type="email"
                      value={formData.guarantorEmail}
                      onChange={(e) => handleChange('guarantorEmail', e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guarantorAddress">Dirección del Aval</Label>
                    <Textarea
                      id="guarantorAddress"
                      value={formData.guarantorAddress}
                      onChange={(e) => handleChange('guarantorAddress', e.target.value)}
                      placeholder="Dirección completa del aval"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Términos y Condiciones */}
          <Card>
            <CardHeader>
              <CardTitle>Términos y Condiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms">Términos y Condiciones</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleChange('terms', e.target.value)}
                  placeholder="Términos y condiciones del plan de financiamiento..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Cálculos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Resumen del Financiamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Monto Total:</span>
                  <span className="text-sm font-bold">
                    ${(parseFloat(formData.totalAmount) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Enganche:</span>
                  <span className="text-sm">
                    ${(parseFloat(formData.downPayment) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Monto Financiado:</span>
                  <span className="text-sm font-bold text-blue-600">
                    ${calculations.financedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cuota {formData.paymentFrequency}:</span>
                  <span className="text-sm font-bold text-green-600">
                    ${calculations.paymentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total de Intereses:</span>
                  <span className="text-sm">
                    ${calculations.totalInterest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fecha Inicio:</span>
                  <span className="text-sm">
                    {format(formData.firstPaymentDate, "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fecha Final:</span>
                  <span className="text-sm">
                    {format(calculations.finalDate, "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {calculations.totalInterest > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de Intereses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Tasa Anual:</strong> {formData.interestRate}%
                  </p>
                  <p>
                    <strong>Tasa Mensual:</strong> {((parseFloat(formData.interestRate) || 0) / 12).toFixed(4)}%
                  </p>
                  <p className="text-orange-600">
                    <strong>Total a Pagar:</strong> ${(calculations.financedAmount + calculations.totalInterest).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}
