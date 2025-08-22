

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  FileText,
  Calendar,
  User,
  Stethoscope,
  Pill,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Printer,
  Smile
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Odontograma } from "@/components/odontograma";
import PeriodontogramEditor from "@/components/periodontogram/PeriodontogramEditor";
import { MedicalDocuments } from "@/components/medical-documents";
import { PrescriptionManager } from "@/components/prescription-manager";
import { LaboratoryManager } from "@/components/laboratory-manager";
import { formatDate, formatDateTime } from "@/lib/date-utils";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
}

interface Treatment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  name: string;
  category: string;
  description: string;
  diagnosis: string;
  procedure: string;
  medications?: string;
  instructions: string;
  cost: number;
  status: string;
  startDate: string;
  completedDate?: string;
  notes?: string;
  patient: Patient;
  doctor: {
    name: string;
    especialidad?: string;
  };
}

interface NewTreatment {
  patientId: string;
  name: string;
  category: string;
  description: string;
  diagnosis: string;
  procedure: string;
  medications?: string;
  instructions: string;
  cost: string;
  status: string;
  startDate: string;
  notes?: string;
}

// Helper function para normalizar el costo
const normalizeCost = (cost: any): number => {
  // Handle null/undefined first
  if (cost === null || cost === undefined) {
    console.warn('Cost is null or undefined, returning 0');
    return 0;
  }
  
  // Handle numbers (including 0)
  if (typeof cost === 'number') {
    if (isNaN(cost)) {
      console.warn('Cost is NaN, returning 0');
      return 0;
    }
    return cost;
  }
  
  // Handle strings
  if (typeof cost === 'string') {
    if (cost.trim() === '') {
      console.warn('Cost is empty string, returning 0');
      return 0;
    }
    const cleaned = cost.toString().replace(/[€$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) {
      console.warn('Failed to parse cost string:', cost, 'returning 0');
      return 0;
    }
    return parsed;
  }
  
  // Handle Prisma Decimal type
  if (typeof cost === 'object' && cost !== null) {
    if ('toNumber' in cost && typeof cost.toNumber === 'function') {
      try {
        const converted = cost.toNumber();
        if (isNaN(converted)) {
          console.warn('Prisma Decimal converted to NaN, returning 0');
          return 0;
        }
        return converted;
      } catch (error) {
        console.error('Error converting Prisma Decimal:', error, 'returning 0');
        return 0;
      }
    }
    
    // Handle other object types that might have a numeric value
    if ('valueOf' in cost && typeof cost.valueOf === 'function') {
      try {
        const value = cost.valueOf();
        if (typeof value === 'number' && !isNaN(value)) {
          return value;
        }
      } catch (error) {
        console.error('Error calling valueOf:', error);
      }
    }
  }
  
  console.warn('Unknown cost type:', typeof cost, cost, 'returning 0');
  return 0;
};

// Helper function para formatear el costo de manera segura
const formatCost = (cost: any): string => {
  try {
    const normalizedCost = normalizeCost(cost);
    
    // Double-check the normalized cost is valid
    if (typeof normalizedCost !== 'number' || isNaN(normalizedCost)) {
      console.error('formatCost: normalizedCost is not a valid number:', normalizedCost);
      return '€0.00';
    }
    
    return `€${normalizedCost.toFixed(2)}`;
  } catch (error) {
    console.error('formatCost: Unexpected error:', error, 'for cost:', cost);
    return '€0.00';
  }
};

export function ExpedientesModule() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [periodontogramData, setPeriodontogramData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Estado para nuevo tratamiento
  const [newTreatment, setNewTreatment] = useState<NewTreatment>({
    patientId: '',
    name: '',
    category: '',
    description: '',
    diagnosis: '',
    procedure: '',
    medications: '',
    instructions: '',
    cost: '',
    status: 'Planificado',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Cargar datos
  useEffect(() => {
    loadTreatments();
    loadPatients();
  }, []);

  // Filtrar tratamientos
  useEffect(() => {
    let filtered = treatments;
    
    if (searchTerm) {
      filtered = filtered.filter(treatment => 
        treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${treatment.patient.firstName} ${treatment.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(treatment => treatment.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(treatment => treatment.category === categoryFilter);
    }
    
    setFilteredTreatments(filtered);
  }, [treatments, searchTerm, statusFilter, categoryFilter]);

  const loadTreatments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/treatments');
      if (response.ok) {
        const data = await response.json();
        setTreatments(data);
      }
    } catch (error) {
      console.error('Error cargando tratamientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        // The API returns { patients: Patient[], total: number }
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      setPatients([]); // Set empty array as fallback
    }
  };

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTreatment,
          cost: parseFloat(newTreatment.cost),
          startDate: new Date(newTreatment.startDate).toISOString()
        }),
      });

      if (response.ok) {
        await loadTreatments();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creando tratamiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewTreatment({
      patientId: '',
      name: '',
      category: '',
      description: '',
      diagnosis: '',
      procedure: '',
      medications: '',
      instructions: '',
      cost: '',
      status: 'Planificado',
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'En Progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Planificado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      case 'Suspendido':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completado':
        return <CheckCircle className="w-4 h-4" />;
      case 'En Progreso':
        return <Clock className="w-4 h-4" />;
      case 'Planificado':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Preventivo':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Restaurativo':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Estético':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Endodoncia':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Periodoncia':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'Cirugía':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Historia Clínica</h1>
          <p className="text-gray-600">Gestiona los expedientes y tratamientos de tus pacientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tratamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Tratamiento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTreatment} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Paciente *</Label>
                  <Select 
                    value={newTreatment.patientId} 
                    onValueChange={(value) => setNewTreatment(prev => ({...prev, patientId: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients && patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} - {patient.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select 
                    value={newTreatment.category} 
                    onValueChange={(value) => setNewTreatment(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preventivo">Preventivo</SelectItem>
                      <SelectItem value="Restaurativo">Restaurativo</SelectItem>
                      <SelectItem value="Estético">Estético</SelectItem>
                      <SelectItem value="Endodoncia">Endodoncia</SelectItem>
                      <SelectItem value="Periodoncia">Periodoncia</SelectItem>
                      <SelectItem value="Cirugía">Cirugía</SelectItem>
                      <SelectItem value="Ortodoncia">Ortodoncia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nombre del Tratamiento *</Label>
                <Input
                  id="name"
                  value={newTreatment.name}
                  onChange={(e) => setNewTreatment(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnóstico *</Label>
                <Textarea
                  id="diagnosis"
                  value={newTreatment.diagnosis}
                  onChange={(e) => setNewTreatment(prev => ({...prev, diagnosis: e.target.value}))}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment(prev => ({...prev, description: e.target.value}))}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="procedure">Procedimiento *</Label>
                <Textarea
                  id="procedure"
                  value={newTreatment.procedure}
                  onChange={(e) => setNewTreatment(prev => ({...prev, procedure: e.target.value}))}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="medications">Medicamentos</Label>
                <Textarea
                  id="medications"
                  value={newTreatment.medications}
                  onChange={(e) => setNewTreatment(prev => ({...prev, medications: e.target.value}))}
                  rows={2}
                  placeholder="Medicamentos recetados, dosis, frecuencia..."
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instrucciones Post-Tratamiento *</Label>
                <Textarea
                  id="instructions"
                  value={newTreatment.instructions}
                  onChange={(e) => setNewTreatment(prev => ({...prev, instructions: e.target.value}))}
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cost">Costo (€) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newTreatment.cost}
                    onChange={(e) => setNewTreatment(prev => ({...prev, cost: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newTreatment.startDate}
                    onChange={(e) => setNewTreatment(prev => ({...prev, startDate: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={newTreatment.status} 
                    onValueChange={(value) => setNewTreatment(prev => ({...prev, status: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planificado">Planificado</SelectItem>
                      <SelectItem value="En Progreso">En Progreso</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Suspendido">Suspendido</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={newTreatment.notes}
                  onChange={(e) => setNewTreatment(prev => ({...prev, notes: e.target.value}))}
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Tratamiento'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por tratamiento, diagnóstico o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Preventivo">Preventivo</SelectItem>
            <SelectItem value="Restaurativo">Restaurativo</SelectItem>
            <SelectItem value="Estético">Estético</SelectItem>
            <SelectItem value="Endodoncia">Endodoncia</SelectItem>
            <SelectItem value="Periodoncia">Periodoncia</SelectItem>
            <SelectItem value="Cirugía">Cirugía</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Planificado">Planificados</SelectItem>
            <SelectItem value="En Progreso">En Progreso</SelectItem>
            <SelectItem value="Completado">Completados</SelectItem>
            <SelectItem value="Suspendido">Suspendidos</SelectItem>
            <SelectItem value="Cancelado">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planificados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.filter(t => t.status === 'Planificado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.filter(t => t.status === 'En Progreso').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.filter(t => t.status === 'Completado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tratamientos</p>
                <p className="text-2xl font-bold text-gray-900">{treatments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de tratamientos */}
      <Card>
        <CardHeader>
          <CardTitle>Expedientes Clínicos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Cargando expedientes...</p>
            </div>
          ) : filteredTreatments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron tratamientos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTreatments.map((treatment) => (
                <div key={treatment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{treatment.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getCategoryColor(treatment.category)}>
                              {treatment.category}
                            </Badge>
                            <Badge className={`${getStatusColor(treatment.status)} flex items-center gap-1`}>
                              {getStatusIcon(treatment.status)}
                              {treatment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCost(treatment.cost)}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(treatment.startDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            {treatment.patient.firstName} {treatment.patient.lastName}
                          </span>
                          <span className="mx-2">•</span>
                          <Stethoscope className="w-4 h-4 mr-1" />
                          <span>{treatment.doctor.name}</span>
                          {treatment.doctor.especialidad && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-gray-500">{treatment.doctor.especialidad}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md mb-2">
                          <div className="flex items-start">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Diagnóstico</p>
                              <p className="text-sm text-blue-700">{treatment.diagnosis}</p>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600">{treatment.description}</p>
                        
                        {treatment.medications && (
                          <div className="mt-2 flex items-start">
                            <Pill className="w-4 h-4 text-orange-500 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Medicamentos:</p>
                              <p className="text-sm text-gray-600">{treatment.medications}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTreatment(treatment);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver detalles del tratamiento */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Expediente Clínico</DialogTitle>
          </DialogHeader>
          {selectedTreatment && (
            <div className="space-y-6">
              {/* Header del tratamiento */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selectedTreatment.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getCategoryColor(selectedTreatment.category)}>
                        {selectedTreatment.category}
                      </Badge>
                      <Badge className={`${getStatusColor(selectedTreatment.status)} flex items-center gap-1`}>
                        {getStatusIcon(selectedTreatment.status)}
                        {selectedTreatment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatCost(selectedTreatment.cost)}</p>
                    <p className="text-sm text-gray-500">
                      Inicio: {formatDate(selectedTreatment.startDate)}
                    </p>
                    {selectedTreatment.completedDate && (
                      <p className="text-sm text-gray-500">
                        Completado: {formatDate(selectedTreatment.completedDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="treatment" className="w-full">
                <TabsList className="grid w-full grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 px-1">
                  <TabsTrigger value="treatment" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <span className="hidden md:block">Tratamiento</span>
                    <span className="md:hidden">Trat.</span>
                  </TabsTrigger>
                  <TabsTrigger value="odontograma" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <Smile className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1 lg:mr-2" />
                    <span className="hidden md:block">Odontograma</span>
                    <span className="md:hidden">Odonto.</span>
                  </TabsTrigger>
                  <TabsTrigger value="periodontograma" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <Stethoscope className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1 lg:mr-2" />
                    <span className="hidden md:block">Periodontograma</span>
                    <span className="md:hidden">Perio.</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <span className="hidden md:block">Documentos</span>
                    <span className="md:hidden">Docs.</span>
                  </TabsTrigger>
                  <TabsTrigger value="prescriptions" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <span className="hidden md:block">Recetas</span>
                    <span className="md:hidden">Rec.</span>
                  </TabsTrigger>
                  <TabsTrigger value="laboratory" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <span className="hidden md:block">Laboratorio</span>
                    <span className="md:hidden">Lab.</span>
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <span className="hidden md:block">Paciente</span>
                    <span className="md:hidden">Pac.</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs md:text-sm lg:text-sm whitespace-nowrap px-1 md:px-2 lg:px-3">
                    <span className="hidden md:block">Historial</span>
                    <span className="md:hidden">Hist.</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="treatment" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Descripción</Label>
                    <p className="mt-1">{selectedTreatment.description}</p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                      <div>
                        <Label className="text-sm font-medium text-red-800">Diagnóstico</Label>
                        <p className="mt-1 text-red-700">{selectedTreatment.diagnosis}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Procedimiento</Label>
                    <p className="mt-1">{selectedTreatment.procedure}</p>
                  </div>
                  
                  {selectedTreatment.medications && (
                    <div className="bg-orange-50 p-4 rounded-md">
                      <div className="flex items-start">
                        <Pill className="w-5 h-5 text-orange-600 mt-0.5 mr-2" />
                        <div>
                          <Label className="text-sm font-medium text-orange-800">Medicamentos</Label>
                          <p className="mt-1 text-orange-700">{selectedTreatment.medications}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <Label className="text-sm font-medium text-blue-800">Instrucciones Post-Tratamiento</Label>
                    <p className="mt-1 text-blue-700">{selectedTreatment.instructions}</p>
                  </div>
                  
                  {selectedTreatment.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Notas Adicionales</Label>
                      <p className="mt-1">{selectedTreatment.notes}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="odontograma" className="space-y-4">
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h4 className="text-lg font-semibold flex items-center">
                        <Smile className="w-5 h-5 mr-2 text-blue-600" />
                        Odontograma - {selectedTreatment.patient.firstName} {selectedTreatment.patient.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Estado dental actual del paciente. Haga clic en las caras de los dientes para registrar tratamientos.
                      </p>
                    </div>
                    <div className="p-6">
                      <Odontograma 
                        pacienteId={selectedTreatment.patientId}
                        readonly={false}
                        onDienteChange={(numero, caras) => {
                          console.log(`Diente ${numero} actualizado:`, caras);
                          // Aquí puedes agregar la lógica para guardar cambios
                        }}
                      />
                    </div>
                    <div className="p-4 border-t bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Última actualización: {formatDate(new Date())}
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="periodontograma" className="space-y-4">
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h4 className="text-lg font-semibold flex items-center">
                        <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                        Periodontograma - {selectedTreatment.patient.firstName} {selectedTreatment.patient.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Evaluación periodontal completa del paciente. Registro de sondaje y estado de tejidos.
                      </p>
                    </div>
                    <div className="p-6">
                      <PeriodontogramEditor
                        periodontogramData={periodontogramData || {
                          id: '',
                          title: `Periodontograma - ${selectedTreatment.patient.firstName} ${selectedTreatment.patient.lastName}`,
                          patientId: selectedTreatment.patientId,
                          doctorId: selectedTreatment.doctorId,
                          examinationDate: new Date().toISOString(),
                          followUpDate: null,
                          date: new Date().toISOString(),
                          riskLevel: 'Bajo',
                          status: 'En_Proceso',
                          notes: '',
                          patient: selectedTreatment.patient,
                          measurements: [],
                          toothStatuses: []
                        }}
                        isEditable={true}
                        onSave={(data: any) => {
                          console.log('Periodontograma guardado:', data);
                          setPeriodontogramData(data);
                          // Aquí puedes agregar la lógica para guardar cambios
                        }}
                      />
                    </div>
                    <div className="p-4 border-t bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Última actualización: {formatDate(new Date())}
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="patient" className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {selectedTreatment.patient.firstName[0]}{selectedTreatment.patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">
                        {selectedTreatment.patient.firstName} {selectedTreatment.patient.lastName}
                      </h4>
                      <p className="text-gray-600">{selectedTreatment.patient.email}</p>
                      <p className="text-gray-600">{selectedTreatment.patient.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</Label>
                      <p>{selectedTreatment.patient.birthDate 
                        ? formatDate(selectedTreatment.patient.birthDate) 
                        : 'No especificada'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Género</Label>
                      <p>{selectedTreatment.patient.gender || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo de Sangre</Label>
                    <p>{selectedTreatment.patient.bloodType || 'No especificado'}</p>
                  </div>
                  
                  {selectedTreatment.patient.allergies && (
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <Label className="text-sm font-medium text-yellow-800">Alergias</Label>
                      <p className="mt-1 text-yellow-700">{selectedTreatment.patient.allergies}</p>
                    </div>
                  )}
                  
                  {selectedTreatment.patient.medicalHistory && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Historial Médico</Label>
                      <p className="mt-1">{selectedTreatment.patient.medicalHistory}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <MedicalDocuments 
                    patientId={selectedTreatment.patientId}
                    patientName={`${selectedTreatment.patient.firstName} ${selectedTreatment.patient.lastName}`}
                  />
                </TabsContent>
                
                <TabsContent value="prescriptions" className="space-y-4">
                  <PrescriptionManager 
                    patientId={selectedTreatment.patientId}
                    patientName={`${selectedTreatment.patient.firstName} ${selectedTreatment.patient.lastName}`}
                    treatmentId={selectedTreatment.id}
                  />
                </TabsContent>
                
                <TabsContent value="laboratory" className="space-y-4">
                  <LaboratoryManager 
                    patientId={selectedTreatment.patientId}
                    patientName={`${selectedTreatment.patient.firstName} ${selectedTreatment.patient.lastName}`}
                    treatmentId={selectedTreatment.id}
                  />
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Historial de tratamientos en desarrollo</p>
                    <p className="text-sm text-gray-400">Esta funcionalidad estará disponible próximamente</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

