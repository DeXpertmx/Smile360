
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  Calculator,
  DollarSign,
  FileText,
  Users,
  Calendar,
  Download,
  PrinterIcon,
  Clock,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { formatDate } from "@/lib/date-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import toast from 'react-hot-toast';

interface Budget {
  id: string;
  title: string;
  description?: string;
  patientId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    numeroExpediente: string;
    email?: string;
    phone?: string;
  };
  doctorId: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    especialidad?: string;
  };
  validUntil?: string;
  notes?: string;
  termsConditions?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Borrador' | 'Enviado' | 'Aprobado' | 'Rechazado' | 'Vencido';
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

interface BudgetItem {
  id: string;
  type: 'Tratamiento' | 'Producto' | 'Servicio';
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  priority: 'Alta' | 'Normal' | 'Baja';
  estimated: boolean;
  notes?: string;
  productId?: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  numeroExpediente: string;
  email?: string;
  phone?: string;
}

export function BudgetsModule() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    patientId: '',
    validUntil: '',
    notes: '',
    termsConditions: '',
  });
  
  const [items, setItems] = useState<Omit<BudgetItem, 'id'>[]>([
    {
      type: 'Tratamiento',
      name: '',
      description: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
      priority: 'Normal',
      estimated: false,
      notes: '',
    }
  ]);

  useEffect(() => {
    fetchBudgets();
    fetchPatients();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const calculateItemTotal = (quantity: number, unitPrice: number, discount: number) => {
    return (quantity * unitPrice) - discount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
    const tax = subtotal * 0.16; // 16% IVA por defecto
    const total = subtotal + tax;
    return { subtotal, discount: totalDiscount, tax, total };
  };

  const addItem = () => {
    setItems([...items, {
      type: 'Tratamiento',
      name: '',
      description: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
      priority: 'Normal',
      estimated: false,
      notes: '',
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof Omit<BudgetItem, 'id'>, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalcular total del item si cambia cantidad, precio o descuento
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const { quantity, unitPrice, discount } = newItems[index];
      newItems[index].total = calculateItemTotal(quantity, unitPrice, discount);
    }
    
    setItems(newItems);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      patientId: '',
      validUntil: '',
      notes: '',
      termsConditions: '',
    });
    setItems([{
      type: 'Tratamiento',
      name: '',
      description: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
      priority: 'Normal',
      estimated: false,
      notes: '',
    }]);
  };

  const validateBudgetData = () => {
    const errors: string[] = [];

    // Validar campos básicos obligatorios
    if (!formData.title?.trim()) {
      errors.push('Título del presupuesto es requerido');
    }

    if (!formData.patientId) {
      errors.push('Debe seleccionar un paciente');
    }

    // Validar items
    if (items.length === 0) {
      errors.push('Debe agregar al menos un elemento al presupuesto');
    } else {
      items.forEach((item, index) => {
        const itemNumber = index + 1;
        
        if (!item.name?.trim()) {
          errors.push(`Elemento ${itemNumber}: Nombre es requerido`);
        }
        
        if (item.quantity <= 0) {
          errors.push(`Elemento ${itemNumber}: Cantidad debe ser mayor a 0`);
        }
        
        if (item.unitPrice <= 0) {
          errors.push(`Elemento ${itemNumber}: Precio unitario debe ser mayor a 0`);
        }
      });
    }

    return errors;
  };

  const handleSaveBudget = async (status: Budget['status'] = 'Borrador') => {
    const validationErrors = validateBudgetData();
    
    if (validationErrors.length > 0) {
      // Mostrar el primer error más específico
      toast.error(validationErrors[0]);
      
      // Si hay múltiples errores, mostrar un resumen
      if (validationErrors.length > 1) {
        setTimeout(() => {
          toast.error(`Se encontraron ${validationErrors.length} errores. Revise todos los campos requeridos.`);
        }, 1500);
      }
      
      // Log todos los errores para debugging
      console.log('Errores de validación:', validationErrors);
      return;
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      
      const budgetData = {
        ...formData,
        status,
        items,
        ...totals
      };

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (response.ok) {
        toast.success(`Presupuesto ${status === 'Borrador' ? 'guardado como borrador' : 'guardado y enviado'} exitosamente`);
        await fetchBudgets();
        setIsNewBudgetOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        
        // Manejar errores específicos de la API
        if (response.status === 400) {
          toast.error(error.error || 'Datos inválidos. Verifique los campos requeridos.');
        } else if (response.status === 401) {
          toast.error('No tiene autorización para realizar esta acción');
        } else if (response.status === 500) {
          toast.error('Error interno del servidor. Intente nuevamente.');
        } else {
          toast.error(error.error || 'Error al guardar el presupuesto');
        }
        
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: Budget['status']) => {
    const statusConfig = {
      'Borrador': { variant: 'secondary', label: 'Borrador' },
      'Enviado': { variant: 'default', label: 'Enviado' },
      'Aprobado': { variant: 'success', label: 'Aprobado' },
      'Rechazado': { variant: 'destructive', label: 'Rechazado' },
      'Vencido': { variant: 'warning', label: 'Vencido' }
    };
    
    const config = statusConfig[status] || statusConfig['Borrador'];
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = 
      budget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${budget.patient.firstName} ${budget.patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.patient.numeroExpediente.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleBudgetClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDetailOpen(true);
  };

  const handleNewBudget = () => {
    setSelectedBudget(null);
    setIsNewBudgetOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Presupuestos</h1>
          <p className="text-gray-600">Gestión de presupuestos y cotizaciones</p>
        </div>
        <Button onClick={handleNewBudget} className="dental-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Presupuestos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-gray-500">Presupuestos activos</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${budgets.reduce((sum, b) => sum + b.total, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">En presupuestos activos</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(b => b.status === 'Aprobado').length}
            </div>
            <p className="text-xs text-gray-500">Presupuestos aprobados</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(b => b.status === 'Enviado').length}
            </div>
            <p className="text-xs text-gray-500">Esperando respuesta</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por título, paciente o número..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Borrador">Borrador</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Aprobado">Aprobado</SelectItem>
                  <SelectItem value="Rechazado">Rechazado</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Presupuestos</CardTitle>
          <p className="text-sm text-gray-600">
            Se encontraron {filteredBudgets.length} presupuestos
          </p>
        </CardHeader>
        <CardContent>
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron presupuestos</p>
              <Button onClick={handleNewBudget} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer presupuesto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleBudgetClick(budget)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg dental-text-primary">
                        {budget.title}
                      </h3>
                      <p className="text-gray-600">
                        Paciente: {budget.patient.firstName} {budget.patient.lastName}
                        <span className="text-gray-400 ml-2">
                          ({budget.patient.numeroExpediente})
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(budget.status)}
                      <div className="mt-2">
                        <span className="text-2xl font-bold dental-text-primary">
                          ${budget.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Dr. {budget.doctor.firstName} {budget.doctor.lastName}
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {budget.items.length} elementos
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(budget.createdAt)}
                    </div>
                  </div>

                  {budget.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {budget.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalle del Presupuesto: {selectedBudget?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Información del Paciente</h3>
                  <p><strong>Nombre:</strong> {selectedBudget.patient.firstName} {selectedBudget.patient.lastName}</p>
                  <p><strong>Expediente:</strong> {selectedBudget.patient.numeroExpediente}</p>
                  {selectedBudget.patient.email && (
                    <p><strong>Email:</strong> {selectedBudget.patient.email}</p>
                  )}
                  {selectedBudget.patient.phone && (
                    <p><strong>Teléfono:</strong> {selectedBudget.patient.phone}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Información del Presupuesto</h3>
                  <p><strong>Estado:</strong> {getStatusBadge(selectedBudget.status)}</p>
                  <p><strong>Doctor:</strong> Dr. {selectedBudget.doctor.firstName} {selectedBudget.doctor.lastName}</p>
                  <p><strong>Fecha:</strong> {formatDate(selectedBudget.createdAt)}</p>
                  {selectedBudget.validUntil && (
                    <p><strong>Válido hasta:</strong> {formatDate(selectedBudget.validUntil)}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-4">Elementos del Presupuesto</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Elemento</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Cant.</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Precio Unit.</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Descuento</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBudget.items.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-200 px-4 py-2">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-gray-600">{item.description}</div>
                              )}
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                                {item.priority !== 'Normal' && (
                                  <Badge 
                                    variant={item.priority === 'Alta' ? 'destructive' : 'secondary'} 
                                    className="text-xs"
                                  >
                                    {item.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-200 px-4 py-2 text-right">
                            ${item.unitPrice.toLocaleString()}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-right">
                            {item.discount > 0 ? `$${item.discount.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-right font-semibold">
                            ${item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedBudget.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedBudget.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Descuento:</span>
                        <span>-${selectedBudget.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedBudget.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Impuestos:</span>
                        <span>${selectedBudget.tax.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${selectedBudget.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(selectedBudget.notes || selectedBudget.termsConditions) && (
                <div className="space-y-4">
                  {selectedBudget.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notas</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedBudget.notes}</p>
                    </div>
                  )}
                  {selectedBudget.termsConditions && (
                    <div>
                      <h3 className="font-semibold mb-2">Términos y Condiciones</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedBudget.termsConditions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button variant="outline">
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Budget Dialog */}
      <Dialog open={isNewBudgetOpen} onOpenChange={setIsNewBudgetOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Presupuesto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Título del Presupuesto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ej: Tratamiento de ortodoncia..."
                      className={!formData.title?.trim() ? "border-red-200 focus:border-red-500" : ""}
                    />
                    {!formData.title?.trim() && (
                      <p className="text-xs text-red-500">Este campo es requerido</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient" className="text-sm font-medium">
                      Paciente <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.patientId}
                      onValueChange={(value) => setFormData({...formData, patientId: value})}
                    >
                      <SelectTrigger className={!formData.patientId ? "border-red-200 focus:border-red-500" : ""}>
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
                    {!formData.patientId && (
                      <p className="text-xs text-red-500">Debe seleccionar un paciente</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del presupuesto..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido Hasta</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Budget Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Elementos del Presupuesto</CardTitle>
                  <Button onClick={addItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Elemento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Elemento {index + 1}</h4>
                        {items.length > 1 && (
                          <Button
                            onClick={() => removeItem(index)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Tipo <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={item.type}
                            onValueChange={(value) => updateItem(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                              <SelectItem value="Producto">Producto</SelectItem>
                              <SelectItem value="Servicio">Servicio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Nombre <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            placeholder="Nombre del elemento..."
                            className={!item.name?.trim() ? "border-red-200 focus:border-red-500" : ""}
                          />
                          {!item.name?.trim() && (
                            <p className="text-xs text-red-500">Nombre es requerido</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Categoría</Label>
                          <Input
                            value={item.category}
                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                            placeholder="Categoría..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Descripción del elemento..."
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Cantidad <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className={item.quantity <= 0 ? "border-red-200 focus:border-red-500" : ""}
                          />
                          {item.quantity <= 0 && (
                            <p className="text-xs text-red-500">Cantidad debe ser mayor a 0</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Precio Unitario <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={item.unitPrice <= 0 ? "border-red-200 focus:border-red-500" : ""}
                          />
                          {item.unitPrice <= 0 && (
                            <p className="text-xs text-red-500">Precio debe ser mayor a 0</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Descuento</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Prioridad</Label>
                          <Select
                            value={item.priority}
                            onValueChange={(value) => updateItem(index, 'priority', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="Baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Total</Label>
                          <div className="p-2 bg-gray-100 rounded border text-center font-semibold">
                            ${item.total.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Notas</Label>
                        <Input
                          value={item.notes}
                          onChange={(e) => updateItem(index, 'notes', e.target.value)}
                          placeholder="Notas adicionales..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      {(() => {
                        const totals = calculateTotals();
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>${totals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Descuentos:</span>
                              <span>-${totals.discount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>IVA (16%):</span>
                              <span>${totals.tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold border-t pt-2">
                              <span>Total:</span>
                              <span>${totals.total.toLocaleString()}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Notas del presupuesto..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Términos y Condiciones</Label>
                  <Textarea
                    id="terms"
                    value={formData.termsConditions}
                    onChange={(e) => setFormData({...formData, termsConditions: e.target.value})}
                    placeholder="Términos y condiciones del presupuesto..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                onClick={() => setIsNewBudgetOpen(false)}
                variant="outline"
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={() => handleSaveBudget('Borrador')}
                variant="outline"
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>
              <Button
                onClick={() => handleSaveBudget('Enviado')}
                disabled={saving}
                className="dental-gradient"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar y Enviar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
