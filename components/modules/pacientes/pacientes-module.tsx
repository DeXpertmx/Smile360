

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  Phone,
  Mail,
  Calendar,
  MapPin,
  UserCheck,
  UserX,
  Download,
  FileText,
  KeyRound,
  RefreshCw
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
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numeroExpediente?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceInfo?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface NewPatient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceInfo?: string;
  status: string;
}

export function PacientesModule() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para editar paciente
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  
  // Estado para recuperación de contraseña
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const { toast } = useToast();

  // Estado para nuevo paciente
  const [newPatient, setNewPatient] = useState<NewPatient>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    birthDate: '',
    gender: '',
    occupation: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    insuranceInfo: '',
    status: 'Activo'
  });

  // Cargar pacientes
  useEffect(() => {
    loadPatients();
  }, []);

  // Filtrar pacientes
  useEffect(() => {
    // Asegurar que patients sea un array antes de filtrar
    const patientsArray = Array.isArray(patients) ? patients : [];
    let filtered = patientsArray;
    
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }
    
    setFilteredPatients(filtered);
  }, [patients, searchTerm, statusFilter]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        // Asegurar que patients sea un array
        const patients = Array.isArray(data.patients) ? data.patients : [];
        setPatients(patients);
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      setPatients([]); // Asegurar que patients sea un array en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPatient,
          birthDate: newPatient.birthDate ? new Date(newPatient.birthDate).toISOString() : null
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        await loadPatients();
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Paciente creado",
          description: `${newPatient.firstName} ${newPatient.lastName} ha sido registrado exitosamente${responseData.invitationSent ? ' y se ha enviado la invitación al portal' : ''}`,
        });
      } else {
        throw new Error(responseData.error || 'Error al crear el paciente');
      }
    } catch (error) {
      console.error('Error creando paciente:', error);
      toast({
        title: "Error al crear paciente",
        description: error instanceof Error ? error.message : "No se pudo registrar el paciente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewPatient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      birthDate: '',
      gender: '',
      occupation: '',
      emergencyContact: '',
      emergencyPhone: '',
      bloodType: '',
      allergies: '',
      medicalHistory: '',
      insuranceInfo: '',
      status: 'Activo'
    });
  };

  // Función para abrir el modal de edición
  const handleEditPatient = (patient: Patient) => {
    setEditPatient({...patient});
    setIsEditDialogOpen(true);
  };

  // Función para actualizar paciente
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatient) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/patients/${editPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editPatient,
          birthDate: editPatient.birthDate ? new Date(editPatient.birthDate).toISOString() : null
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        await loadPatients();
        setIsEditDialogOpen(false);
        setEditPatient(null);
        toast({
          title: "Paciente actualizado",
          description: `Los datos de ${editPatient.firstName} ${editPatient.lastName} han sido actualizados exitosamente`,
        });
      } else {
        throw new Error(responseData.error || 'Error al actualizar el paciente');
      }
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      toast({
        title: "Error al actualizar",
        description: error instanceof Error ? error.message : "No se pudo actualizar la información del paciente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar email de recuperación de contraseña
  const sendPasswordReset = async (patientId: string, email: string) => {
    setSendingPasswordReset(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/send-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email enviado",
          description: "Se ha enviado el email de recuperación de contraseña al paciente"
        });
      } else {
        throw new Error(data.error || 'Error al enviar email');
      }
    } catch (error) {
      console.error('Error enviando email de recuperación:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el email de recuperación",
        variant: "destructive"
      });
    } finally {
      setSendingPasswordReset(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'Suspendido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Catálogo de Pacientes</h1>
          <p className="text-gray-600">Administra la información completa de tus pacientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePatient} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                  <TabsTrigger value="contact">Contacto</TabsTrigger>
                  <TabsTrigger value="medical">Información Médica</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient(prev => ({...prev, firstName: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient(prev => ({...prev, lastName: e.target.value}))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={newPatient.birthDate}
                        onChange={(e) => setNewPatient(prev => ({...prev, birthDate: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Género</Label>
                      <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({...prev, gender: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Femenino">Femenino</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="occupation">Ocupación</Label>
                    <Input
                      id="occupation"
                      value={newPatient.occupation}
                      onChange={(e) => setNewPatient(prev => ({...prev, occupation: e.target.value}))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient(prev => ({...prev, email: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient(prev => ({...prev, phone: e.target.value}))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient(prev => ({...prev, address: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={newPatient.city}
                      onChange={(e) => setNewPatient(prev => ({...prev, city: e.target.value}))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                      <Input
                        id="emergencyContact"
                        value={newPatient.emergencyContact}
                        onChange={(e) => setNewPatient(prev => ({...prev, emergencyContact: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                      <Input
                        id="emergencyPhone"
                        value={newPatient.emergencyPhone}
                        onChange={(e) => setNewPatient(prev => ({...prev, emergencyPhone: e.target.value}))}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bloodType">Tipo de Sangre</Label>
                      <Select value={newPatient.bloodType} onValueChange={(value) => setNewPatient(prev => ({...prev, bloodType: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select value={newPatient.status} onValueChange={(value) => setNewPatient(prev => ({...prev, status: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="allergies">Alergias</Label>
                    <Textarea
                      id="allergies"
                      value={newPatient.allergies}
                      onChange={(e) => setNewPatient(prev => ({...prev, allergies: e.target.value}))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medicalHistory">Historial Médico</Label>
                    <Textarea
                      id="medicalHistory"
                      value={newPatient.medicalHistory}
                      onChange={(e) => setNewPatient(prev => ({...prev, medicalHistory: e.target.value}))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="insuranceInfo">Información del Seguro</Label>
                    <Input
                      id="insuranceInfo"
                      value={newPatient.insuranceInfo}
                      onChange={(e) => setNewPatient(prev => ({...prev, insuranceInfo: e.target.value}))}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Paciente'}
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
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Activo">Activos</SelectItem>
            <SelectItem value="Inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(patients) ? patients.filter(p => p.status === 'Activo').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pacientes Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(patients) ? patients.filter(p => p.status === 'Inactivo').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nuevos este mes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(patients) ? patients.filter(p => {
                    const createdDate = new Date(p.createdAt);
                    const currentDate = new Date();
                    return createdDate.getMonth() === currentDate.getMonth() && 
                           createdDate.getFullYear() === currentDate.getFullYear();
                  }).length : 0}
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
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(patients) ? patients.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Cargando pacientes...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron pacientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Paciente</th>
                    <th className="text-left py-2">Contacto</th>
                    <th className="text-left py-2">Edad</th>
                    <th className="text-left py-2">Estado</th>
                    <th className="text-left py-2">Registro</th>
                    <th className="text-center py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-gray-500">{patient.occupation}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-2 text-gray-400" />
                            {patient.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {patient.phone}
                          </div>
                          {patient.city && (
                            <div className="flex items-center text-sm">
                              <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                              {patient.city}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm">{calculateAge(patient.birthDate || '')}</span>
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-500">
                          {formatDate(patient.createdAt)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver detalles del paciente */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                  <p className="text-gray-600">{selectedPatient.occupation}</p>
                  <Badge className={getStatusColor(selectedPatient.status)}>
                    {selectedPatient.status}
                  </Badge>
                </div>
              </div>
              
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Información Personal</TabsTrigger>
                  <TabsTrigger value="contact">Contacto</TabsTrigger>
                  <TabsTrigger value="medical">Información Médica</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</Label>
                      <p>{selectedPatient.birthDate ? formatDate(selectedPatient.birthDate) : 'No especificada'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Edad</Label>
                      <p>{calculateAge(selectedPatient.birthDate || '')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Género</Label>
                      <p>{selectedPatient.gender || 'No especificado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Ocupación</Label>
                      <p>{selectedPatient.occupation || 'No especificada'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p>{selectedPatient.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                      <p>{selectedPatient.phone}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Dirección</Label>
                    <p>{selectedPatient.address || 'No especificada'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ciudad</Label>
                    <p>{selectedPatient.city || 'No especificada'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Contacto de Emergencia</Label>
                      <p>{selectedPatient.emergencyContact || 'No especificado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Teléfono de Emergencia</Label>
                      <p>{selectedPatient.emergencyPhone || 'No especificado'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tipo de Sangre</Label>
                      <p>{selectedPatient.bloodType || 'No especificado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Seguro Médico</Label>
                      <p>{selectedPatient.insuranceInfo || 'No especificado'}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Alergias</Label>
                    <p>{selectedPatient.allergies || 'Ninguna conocida'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Historial Médico</Label>
                    <p>{selectedPatient.medicalHistory || 'Sin antecedentes relevantes'}</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Cerrar
                </Button>
                {selectedPatient?.email && (
                  <Button
                    variant="outline"
                    onClick={() => sendPasswordReset(selectedPatient.id, selectedPatient.email)}
                    disabled={sendingPasswordReset}
                  >
                    {sendingPasswordReset ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Recuperar Contraseña
                      </>
                    )}
                  </Button>
                )}
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar paciente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          {editPatient && (
            <form onSubmit={handleUpdatePatient} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                  <TabsTrigger value="contact">Contacto</TabsTrigger>
                  <TabsTrigger value="medical">Información Médica</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editFirstName">Nombre *</Label>
                      <Input
                        id="editFirstName"
                        value={editPatient.firstName}
                        onChange={(e) => setEditPatient(prev => prev ? {...prev, firstName: e.target.value} : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="editLastName">Apellido *</Label>
                      <Input
                        id="editLastName"
                        value={editPatient.lastName}
                        onChange={(e) => setEditPatient(prev => prev ? {...prev, lastName: e.target.value} : null)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editBirthDate">Fecha de Nacimiento</Label>
                      <Input
                        id="editBirthDate"
                        type="date"
                        value={editPatient.birthDate ? new Date(editPatient.birthDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditPatient(prev => prev ? {...prev, birthDate: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editGender">Género</Label>
                      <Select 
                        value={editPatient.gender || ''} 
                        onValueChange={(value) => setEditPatient(prev => prev ? {...prev, gender: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Femenino">Femenino</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editOccupation">Ocupación</Label>
                    <Input
                      id="editOccupation"
                      value={editPatient.occupation || ''}
                      onChange={(e) => setEditPatient(prev => prev ? {...prev, occupation: e.target.value} : null)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editEmail">Email *</Label>
                      <Input
                        id="editEmail"
                        type="email"
                        value={editPatient.email}
                        onChange={(e) => setEditPatient(prev => prev ? {...prev, email: e.target.value} : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="editPhone">Teléfono *</Label>
                      <Input
                        id="editPhone"
                        value={editPatient.phone}
                        onChange={(e) => setEditPatient(prev => prev ? {...prev, phone: e.target.value} : null)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="editAddress">Dirección</Label>
                    <Input
                      id="editAddress"
                      value={editPatient.address || ''}
                      onChange={(e) => setEditPatient(prev => prev ? {...prev, address: e.target.value} : null)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editCity">Ciudad</Label>
                    <Input
                      id="editCity"
                      value={editPatient.city || ''}
                      onChange={(e) => setEditPatient(prev => prev ? {...prev, city: e.target.value} : null)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editEmergencyContact">Contacto de Emergencia</Label>
                      <Input
                        id="editEmergencyContact"
                        value={editPatient.emergencyContact || ''}
                        onChange={(e) => setEditPatient(prev => prev ? {...prev, emergencyContact: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEmergencyPhone">Teléfono de Emergencia</Label>
                      <Input
                        id="editEmergencyPhone"
                        value={editPatient.emergencyPhone || ''}
                        onChange={(e) => setEditPatient(prev => prev ? {...prev, emergencyPhone: e.target.value} : null)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editBloodType">Tipo de Sangre</Label>
                      <Select 
                        value={editPatient.bloodType || ''} 
                        onValueChange={(value) => setEditPatient(prev => prev ? {...prev, bloodType: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editStatus">Estado</Label>
                      <Select 
                        value={editPatient.status} 
                        onValueChange={(value) => setEditPatient(prev => prev ? {...prev, status: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="editAllergies">Alergias</Label>
                    <Textarea
                      id="editAllergies"
                      value={editPatient.allergies || ''}
                      onChange={(e) => setEditPatient(prev => prev ? {...prev, allergies: e.target.value} : null)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editMedicalHistory">Historial Médico</Label>
                    <Textarea
                      id="editMedicalHistory"
                      value={editPatient.medicalHistory || ''}
                      onChange={(e) => setEditPatient(prev => prev ? {...prev, medicalHistory: e.target.value} : null)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editInsuranceInfo">Información del Seguro</Label>
                    <Input
                      id="editInsuranceInfo"
                      value={editPatient.insuranceInfo || ''}
                      onChange={(e) => setEditPatient(prev => prev ? {...prev, insuranceInfo: e.target.value} : null)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditPatient(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Actualizar Paciente'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

