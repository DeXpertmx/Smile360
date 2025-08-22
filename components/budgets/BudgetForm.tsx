

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Save, X, PrinterIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useConfiguration } from "@/hooks/useConfiguration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Odontograma } from "@/components/odontograma";
import PeriodontogramEditor from "@/components/periodontogram/PeriodontogramEditor";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  numeroExpediente: string;
}

interface BudgetItem {
  id?: string;
  type: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  priority: string;
  estimated: boolean;
  notes?: string;
}

interface BudgetFormProps {
  budget?: any;
  onSave: () => void;
  onCancel: () => void;
}

export function BudgetForm({ budget, onSave, onCancel }: BudgetFormProps) {
  const { data: session } = useSession();
  const { formatCurrency } = useConfiguration();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    treatment: "",
    patientId: "",
    validUntil: null as Date | null,
    notes: "",
    termsConditions: "",
    tax: 0,
  });

  const [items, setItems] = useState<BudgetItem[]>([]);
  const [odontogramaData, setOdontogramaData] = useState<any[]>([]);
  const [includeOdontogram, setIncludeOdontogram] = useState(false);
  const [periodontogramData, setPeriodontogramData] = useState<any>(null);
  const [includePeriodontogram, setIncludePeriodontogram] = useState(false);
  
  // Estados para financiamiento
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<string>('');
  const [customPayments, setCustomPayments] = useState<any[]>([]);

  useEffect(() => {
    fetchPatients();
    
    if (budget) {
      // Cargar datos del presupuesto existente
      setFormData({
        title: budget.title || "",
        description: budget.description || "",
        treatment: budget.treatment || "",
        patientId: budget.patientId || "",
        validUntil: budget.validUntil ? new Date(budget.validUntil) : null,
        notes: budget.notes || "",
        termsConditions: budget.termsConditions || "",
        tax: budget.tax || 0,
      });
      
      if (budget.items) {
        // Ensure all items have valid category values (no empty strings)
        const cleanedItems = budget.items.map((item: any) => ({
          ...item,
          category: item.category || "general"
        }));
        setItems(cleanedItems);
      }

      // Cargar datos del odontograma si existen
      if (budget.odontogramaData) {
        setOdontogramaData(budget.odontogramaData);
        setIncludeOdontogram(true);
      }

      // Cargar datos del periodontograma si existen
      if (budget.periodontogramData) {
        setPeriodontogramData(budget.periodontogramData);
        setIncludePeriodontogram(true);
      }

      // Cargar datos de financiamiento si existen
      if (budget.paymentPlan) {
        setSelectedPaymentPlan(budget.paymentPlan);
      }
      if (budget.customPayments) {
        setCustomPayments(budget.customPayments);
      }
    }
  }, [budget]);

  // Detectar cambios no guardados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Marcar como cambios no guardados cuando se modifica algo
  useEffect(() => {
    if (formData.title || formData.description || formData.treatment || formData.patientId || items.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [formData, items]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm(
        '¿Estás seguro de que quieres salir?\n\nTienes cambios no guardados que se perderán si continúas.'
      );
      if (shouldLeave) {
        setHasUnsavedChanges(false);
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const response = await fetch('/api/patients?limit=100');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const addItem = () => {
    const newItem: BudgetItem = {
      type: "tratamiento",
      name: "",
      description: "",
      category: "general",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
      priority: "Normal",
      estimated: false,
      notes: "",
    };
    setItems([...items, newItem]);
    setHasUnsavedChanges(true);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setHasUnsavedChanges(true);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalcular total del item
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const item = newItems[index];
      const quantity = parseFloat(item.quantity.toString()) || 0;
      const unitPrice = parseFloat(item.unitPrice.toString()) || 0;
      const discount = parseFloat(item.discount.toString()) || 0;
      
      const subtotal = quantity * unitPrice;
      const discountAmount = (subtotal * discount) / 100;
      newItems[index].total = subtotal - discountAmount;
    }
    
    setItems(newItems);
    setHasUnsavedChanges(true);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const total = parseFloat(item.total?.toString()) || 0;
      return sum + total;
    }, 0);
  };

  const calculateDiscount = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity?.toString()) || 0;
      const unitPrice = parseFloat(item.unitPrice?.toString()) || 0;
      const discount = parseFloat(item.discount?.toString()) || 0;
      const subtotal = quantity * unitPrice;
      return sum + ((subtotal * discount) / 100);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = parseFloat(formData.tax?.toString()) || 0;
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax;
  };

  // Función para imprimir el odontograma
  const printOdontogram = () => {
    if (!includeOdontogram || !formData.patientId) {
      toast.error('Debe incluir un odontograma para imprimir');
      return;
    }

    const patient = patients.find(p => p.id === formData.patientId);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Odontograma - ${patient?.firstName} ${patient?.lastName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .patient-info {
            margin-bottom: 30px;
          }
          .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 30px;
            justify-content: center;
          }
          .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .legend-color {
            width: 20px;
            height: 20px;
            border: 2px solid #000;
          }
          .maxilar {
            margin-bottom: 40px;
          }
          .maxilar h3 {
            text-align: center;
            margin-bottom: 20px;
          }
          .teeth-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 10px;
            max-width: 800px;
            margin: 0 auto;
          }
          .tooth {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            border: 2px solid #000;
            background: white;
          }
          .tooth-number {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 12px;
          }
          .tooth-diagram {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .cara-vestibular, .cara-lingual {
            width: 30px;
            height: 15px;
            border: 1px solid #000;
          }
          .cara-vestibular { border-radius: 8px 8px 0 0; }
          .cara-lingual { border-radius: 0 0 8px 8px; }
          .cara-row {
            display: flex;
            align-items: center;
          }
          .cara-mesial, .cara-distal {
            width: 10px;
            height: 30px;
            border: 1px solid #000;
          }
          .cara-mesial { border-radius: 4px 0 0 4px; }
          .cara-distal { border-radius: 0 4px 4px 0; }
          .cara-oclusal {
            width: 20px;
            height: 20px;
            border: 1px solid #000;
            border-radius: 2px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ODONTOGRAMA</h1>
          <h2>Sistema Smile 360</h2>
        </div>
        
        <div class="patient-info">
          <p><strong>Paciente:</strong> ${patient?.firstName} ${patient?.lastName}</p>
          <p><strong>Expediente:</strong> ${patient?.numeroExpediente}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          <p><strong>Presupuesto:</strong> ${formData.title}</p>
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #ffffff;"></div>
            <span>Sano</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #8B0000;"></div>
            <span>Caries</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #708090;"></div>
            <span>Amalgama</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #F5F5DC;"></div>
            <span>Resina</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #FFD700;"></div>
            <span>Corona</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #FF69B4;"></div>
            <span>Endodoncia</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #FF0000;"></div>
            <span>Extracción</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #4169E1;"></div>
            <span>Implante</span>
          </div>
        </div>

        <div class="maxilar">
          <h3>MAXILAR SUPERIOR</h3>
          <div class="teeth-grid">
            ${generateTeethHTML('superior')}
          </div>
        </div>

        <div class="maxilar">
          <h3>MAXILAR INFERIOR</h3>
          <div class="teeth-grid">
            ${generateTeethHTML('inferior')}
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    
    // Esperar a que se cargue el contenido y luego imprimir
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Función auxiliar para generar HTML de los dientes
  const generateTeethHTML = (maxilar: 'superior' | 'inferior') => {
    const coloresEstados: Record<string, string> = {
      sano: '#ffffff',
      caries: '#8B0000',
      amalgama: '#708090',
      resina: '#F5F5DC',
      corona: '#FFD700',
      endodoncia: '#FF69B4',
      extraccion: '#FF0000',
      implante: '#4169E1'
    };

    const dientesRange = maxilar === 'superior' ? [1, 16] : [17, 32];
    const dientes = [];
    
    for (let i = dientesRange[0]; i <= dientesRange[1]; i++) {
      const dienteData = odontogramaData.find(d => d.numero === i);
      const caras = dienteData?.caras || {
        vestibular: 'sano',
        lingual: 'sano',
        mesial: 'sano',
        distal: 'sano',
        oclusal: 'sano'
      };

      // Para el maxilar inferior, invertir el orden de los dientes
      const numeroMostrar = maxilar === 'inferior' ? (33 - i) : i;
      
      dientes.push(`
        <div class="tooth">
          <div class="tooth-number">${numeroMostrar}</div>
          <div class="tooth-diagram">
            <div class="cara-vestibular" style="background-color: ${coloresEstados[caras.vestibular]}"></div>
            <div class="cara-row">
              <div class="cara-mesial" style="background-color: ${coloresEstados[caras.mesial]}"></div>
              <div class="cara-oclusal" style="background-color: ${coloresEstados[caras.oclusal]}"></div>
              <div class="cara-distal" style="background-color: ${coloresEstados[caras.distal]}"></div>
            </div>
            <div class="cara-lingual" style="background-color: ${coloresEstados[caras.lingual]}"></div>
          </div>
        </div>
      `);
    }
    
    return maxilar === 'inferior' ? dientes.reverse().join('') : dientes.join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Iniciando guardado de presupuesto...');
    console.log('📋 Datos del formulario:', formData);
    console.log('📦 Elementos:', items);
    console.log('👤 Sesión:', session?.user);
    
    if (!formData.patientId) {
      toast.error('Selecciona un paciente');
      console.log('❌ Error: No hay paciente seleccionado');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Ingresa un título para el presupuesto');
      console.log('❌ Error: No hay título');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Agrega al menos un elemento al presupuesto');
      console.log('❌ Error: No hay elementos');
      return;
    }

    if (!session?.user?.id) {
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
      console.log('❌ Error: No hay sesión activa');
      return;
    }

    setLoading(true);
    
    try {
      const budgetData = {
        ...formData,
        doctorId: session.user.id,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        total: calculateTotal(),
        items,
        status: budget?.status || 'Borrador',
        odontogramaData: includeOdontogram ? odontogramaData : null,
        includeOdontogram,
        periodontogramData: includePeriodontogram ? periodontogramData : null,
        includePeriodontogram,
        paymentPlan: selectedPaymentPlan || null,
        customPayments: selectedPaymentPlan === 'custom' ? customPayments : null,
      };

      console.log('📤 Enviando datos al servidor:', budgetData);

      const url = budget ? `/api/budgets/${budget.id}` : '/api/budgets';
      const method = budget ? 'PUT' : 'POST';
      
      console.log(`🌐 Haciendo ${method} a ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(budgetData),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Presupuesto guardado exitosamente:', result);
        toast.success('Presupuesto guardado exitosamente');
        setHasUnsavedChanges(false); // Marcar como guardado
        onSave();
      } else {
        const error = await response.json();
        console.log('❌ Error del servidor:', error);
        toast.error(error.message || 'Error al guardar el presupuesto');
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      toast.error('Error de conexión. Verifica tu internet e intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info">Información General</TabsTrigger>
          <TabsTrigger value="items">Elementos</TabsTrigger>
          <TabsTrigger value="odontogram">Odontograma</TabsTrigger>
          <TabsTrigger value="periodontogram">Periodontograma</TabsTrigger>
          <TabsTrigger value="financing">Financiamiento</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Información del Presupuesto
                {hasUnsavedChanges && (
                  <Badge variant="destructive" className="text-xs">
                    Cambios sin guardar
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="Ej: Plan de tratamiento ortodóncico"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => updateFormData({ patientId: value })}
                    disabled={loadingPatients}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} ({patient.numeroExpediente})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="treatment">Tratamiento Principal</Label>
                <Input
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Ej: Ortodoncia, Implante dental, Blanqueamiento"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción general del presupuesto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Válido hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.validUntil ? (
                          format(formData.validUntil, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.validUntil || undefined}
                        onSelect={(date) => setFormData({ ...formData, validUntil: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="tax">IVA (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Elementos del Presupuesto</CardTitle>
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar elemento
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Elemento {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) => updateItem(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tratamiento">Tratamiento</SelectItem>
                          <SelectItem value="material">Material</SelectItem>
                          <SelectItem value="servicio">Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Nombre *</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Nombre del elemento"
                        required
                      />
                    </div>

                    <div>
                      <Label>Categoría</Label>
                      <Select
                        value={item.category || "general"}
                        onValueChange={(value) => updateItem(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="endodoncia">Endodoncia</SelectItem>
                          <SelectItem value="preventivo">Preventivo</SelectItem>
                          <SelectItem value="cirugia">Cirugía</SelectItem>
                          <SelectItem value="ortodoncia">Ortodoncia</SelectItem>
                          <SelectItem value="periodoncia">Periodoncia</SelectItem>
                          <SelectItem value="protesis">Prótesis</SelectItem>
                          <SelectItem value="implantologia">Implantología</SelectItem>
                          <SelectItem value="estetica">Estética</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label>Precio unitario</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Descuento (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Total</Label>
                      <Input
                        value={formatCurrency(item.total)}
                        readOnly
                        className="font-medium bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Descripción</Label>
                    <Textarea
                      value={item.description || ""}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Descripción detallada del elemento"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay elementos en el presupuesto. Haz clic en "Agregar elemento" para comenzar.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odontogram" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Odontograma del Paciente
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-odontogram"
                      checked={includeOdontogram}
                      onCheckedChange={setIncludeOdontogram}
                    />
                    <Label htmlFor="include-odontogram">Incluir en presupuesto</Label>
                  </div>
                  {includeOdontogram && formData.patientId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={printOdontogram}
                      className="flex items-center gap-2"
                    >
                      <PrinterIcon className="h-4 w-4" />
                      Imprimir Odontograma
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {includeOdontogram && formData.patientId ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    El odontograma del paciente se incluirá en el presupuesto (requerido por aseguradoras).
                  </p>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <Odontograma
                      pacienteId={formData.patientId}
                      datos={odontogramaData}
                      onDienteChange={(numero, caras) => {
                        setOdontogramaData(prev => {
                          const updated = [...prev];
                          const index = updated.findIndex(d => d.numero === numero);
                          if (index >= 0) {
                            updated[index] = { numero, caras };
                          } else {
                            updated.push({ numero, caras });
                          }
                          return updated;
                        });
                      }}
                      onCrearTratamiento={(tratamiento) => {
                        // Agregar tratamiento sugerido como elemento del presupuesto
                        const newItem: BudgetItem = {
                          type: "tratamiento",
                          name: `Tratamiento diente ${tratamiento.numero}`,
                          description: `${tratamiento.tratamientoSugerido} en cara ${tratamiento.cara}`,
                          category: "Odontología",
                          quantity: 1,
                          unitPrice: 0,
                          discount: 0,
                          total: 0,
                          priority: "Normal",
                          estimated: true,
                          notes: `Basado en diagnóstico del odontograma - Estado actual: ${tratamiento.estadoActual}`,
                        };
                        setItems(prev => [...prev, newItem]);
                        toast.success('Tratamiento agregado al presupuesto');
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {!formData.patientId 
                    ? "Selecciona un paciente para ver su odontograma"
                    : "Activa 'Incluir en presupuesto' para mostrar el odontograma"
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periodontogram" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Periodontograma del Paciente
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-periodontogram"
                      checked={includePeriodontogram}
                      onCheckedChange={setIncludePeriodontogram}
                    />
                    <Label htmlFor="include-periodontogram">Incluir en presupuesto</Label>
                  </div>
                  {includePeriodontogram && formData.patientId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="flex items-center gap-2"
                    >
                      <PrinterIcon className="h-4 w-4" />
                      Imprimir Periodontograma
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {includePeriodontogram && formData.patientId ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    El periodontograma del paciente se incluirá en el presupuesto para evaluación periodontal.
                  </p>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <PeriodontogramEditor
                      periodontogramData={periodontogramData}
                      isEditable={true}
                      onSave={(data) => {
                        setPeriodontogramData(data);
                        toast.success('Periodontograma actualizado');
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {!formData.patientId 
                    ? "Selecciona un paciente para ver su periodontograma"
                    : "Activa 'Incluir en presupuesto' para mostrar el periodontograma"
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Financiamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Planes predefinidos */}
              <div>
                <Label htmlFor="payment-plan">Plan de Pagos</Label>
                <Select 
                  value={selectedPaymentPlan} 
                  onValueChange={setSelectedPaymentPlan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan de pagos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Pago de contado</SelectItem>
                    <SelectItem value="3_meses">3 cuotas sin interés</SelectItem>
                    <SelectItem value="6_meses">6 cuotas con 5% interés</SelectItem>
                    <SelectItem value="12_meses">12 cuotas con 10% interés</SelectItem>
                    <SelectItem value="custom">Plan personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plan personalizado */}
              {selectedPaymentPlan === 'custom' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Cuotas Personalizadas</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPayment = {
                          id: Date.now(),
                          amount: Math.round(calculateTotal() / (customPayments.length + 1)),
                          dueDate: new Date(),
                          description: `Cuota ${customPayments.length + 1}`
                        };
                        setCustomPayments([...customPayments, newPayment]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar cuota
                    </Button>
                  </div>
                  
                  {customPayments.map((payment, index) => (
                    <div key={payment.id} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Descripción</Label>
                          <Input
                            value={payment.description}
                            onChange={(e) => {
                              const updated = [...customPayments];
                              updated[index].description = e.target.value;
                              setCustomPayments(updated);
                            }}
                            placeholder="Ej: Pago inicial, Primera cuota"
                          />
                        </div>
                        <div>
                          <Label>Monto</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={payment.amount}
                            onChange={(e) => {
                              const updated = [...customPayments];
                              updated[index].amount = parseFloat(e.target.value) || 0;
                              setCustomPayments(updated);
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCustomPayments(customPayments.filter((_, i) => i !== index));
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {customPayments.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No hay cuotas definidas. Haz clic en "Agregar cuota" para comenzar.
                    </div>
                  )}
                </div>
              )}

              {/* Resumen del plan */}
              {selectedPaymentPlan && selectedPaymentPlan !== '' && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Resumen del Financiamiento</h4>
                  {selectedPaymentPlan === 'contado' && (
                    <div>
                      <p>Pago de contado: {formatCurrency(calculateTotal())}</p>
                      <p className="text-sm text-gray-600">Sin intereses</p>
                    </div>
                  )}
                  {selectedPaymentPlan === '3_meses' && (
                    <div>
                      <p>3 cuotas de: {formatCurrency(calculateTotal() / 3)}</p>
                      <p className="text-sm text-gray-600">Total con intereses: {formatCurrency(calculateTotal())}</p>
                    </div>
                  )}
                  {selectedPaymentPlan === '6_meses' && (
                    <div>
                      <p>6 cuotas de: {formatCurrency((calculateTotal() * 1.05) / 6)}</p>
                      <p className="text-sm text-gray-600">Total con intereses: {formatCurrency(calculateTotal() * 1.05)}</p>
                    </div>
                  )}
                  {selectedPaymentPlan === '12_meses' && (
                    <div>
                      <p>12 cuotas de: {formatCurrency((calculateTotal() * 1.10) / 12)}</p>
                      <p className="text-sm text-gray-600">Total con intereses: {formatCurrency(calculateTotal() * 1.10)}</p>
                    </div>
                  )}
                  {selectedPaymentPlan === 'custom' && customPayments.length > 0 && (
                    <div>
                      <p>Total cuotas: {formatCurrency(customPayments.reduce((sum, p) => sum + p.amount, 0))}</p>
                      <p className="text-sm text-gray-600">{customPayments.length} pagos programados</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(calculateDiscount())}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({formData.tax}%):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas internas del presupuesto"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="terms">Términos y condiciones</Label>
                <Textarea
                  id="terms"
                  value={formData.termsConditions}
                  onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                  placeholder="Términos y condiciones del presupuesto"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        
        <Button
          type="submit"
          disabled={loading}
          className={`${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : 'bg-teal-600 hover:bg-teal-700'}`}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : hasUnsavedChanges ? 'Guardar cambios *' : 'Guardar presupuesto'}
        </Button>
      </div>
    </form>
  );
}

