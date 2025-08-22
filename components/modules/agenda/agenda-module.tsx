
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AgendaCalendar } from "@/components/agenda/AgendaCalendar";
import { AppointmentForm } from "@/components/agenda/AppointmentForm";
import { AppointmentDetail } from "@/components/agenda/AppointmentDetail";
import { AgendaStats } from "@/components/agenda/AgendaStats";
import { GoogleCalendarIntegration } from "@/components/agenda/GoogleCalendarIntegration";
import { formatDate, formatTime } from "@/lib/date-utils";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason?: string;
  notes?: string;
  duration: number;
  patient: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  doctor: {
    name: string;
    especialidad?: string;
  };
}

export function AgendaModule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isGoogleCalendarDialogOpen, setIsGoogleCalendarDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  // Cargar citas
  useEffect(() => {
    loadAppointments();
  }, []);

  // Filtrar citas - Mejorado para manejar datos asíncronos
  useEffect(() => {
    // Verificar que appointments sea un array válido
    if (!Array.isArray(appointments)) {
      console.warn('Appointments is not an array:', typeof appointments, appointments);
      setFilteredAppointments([]);
      return;
    }

    let filtered = [...appointments]; // Crear una copia para evitar mutaciones
    
    if (searchTerm) {
      filtered = filtered.filter(appointment => {
        try {
          const patientName = `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.toLowerCase();
          const type = (appointment.type || '').toLowerCase();
          const doctorName = (appointment.doctor?.name || '').toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          return patientName.includes(searchLower) ||
                 type.includes(searchLower) ||
                 doctorName.includes(searchLower);
        } catch (error) {
          console.error('Error filtering appointment:', error, appointment);
          return false;
        }
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment?.status === statusFilter);
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('Loading appointments...');
      
      const response = await fetch('/api/appointments');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Appointments data:', data);
        console.log('Data type:', typeof data, 'Is Array:', Array.isArray(data));
        
        // Asegurar que siempre sea un array válido
        const appointmentsArray = Array.isArray(data) ? data : [];
        setAppointments(appointmentsArray);
        console.log('Appointments set:', appointmentsArray.length, 'items');
      } else {
        console.error('API Error:', response.status, await response.text());
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        await loadAppointments();
        setIsFormDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadAppointments();
        setIsDetailDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAppointments();
        setIsDetailDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailDialogOpen(true);
  };

  const getAppointmentsForDate = (date: Date) => {
    try {
      if (!Array.isArray(filteredAppointments)) {
        console.warn('filteredAppointments is not an array in getAppointmentsForDate');
        return [];
      }
      
      const dateString = date.toISOString().split('T')[0];
      return filteredAppointments.filter(appointment => {
        try {
          const appointmentDate = appointment?.date?.split('T')[0];
          return appointmentDate === dateString;
        } catch (error) {
          console.error('Error filtering appointment by date:', error, appointment);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in getAppointmentsForDate:', error);
      return [];
    }
  };

  const getTodayAppointments = () => {
    try {
      if (!Array.isArray(filteredAppointments)) {
        console.warn('filteredAppointments is not an array in getTodayAppointments');
        return [];
      }
      
      const today = new Date().toISOString().split('T')[0];
      return filteredAppointments.filter(appointment => {
        try {
          const appointmentDate = appointment?.date?.split('T')[0];
          return appointmentDate === today;
        } catch (error) {
          console.error('Error filtering appointment by today:', error, appointment);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in getTodayAppointments:', error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Agenda</h1>
          <p className="text-gray-600">Gestiona las citas y horarios de la clínica</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="rounded-md"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendario
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="rounded-md"
            >
              <Clock className="w-4 h-4 mr-1" />
              Lista
            </Button>
          </div>
          
          {/* Botón de configuración de Google Calendar */}
          <Dialog open={isGoogleCalendarDialogOpen} onOpenChange={setIsGoogleCalendarDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Google Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Configuración de Google Calendar</DialogTitle>
              </DialogHeader>
              <GoogleCalendarIntegration
                onIntegrationUpdate={(enabled) => {
                  console.log('Google Calendar integration updated:', enabled);
                  // Aquí puedes agregar lógica adicional si es necesario
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button className="dental-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva Cita</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                onSuccess={() => {
                  loadAppointments();
                  setIsFormDialogOpen(false);
                }}
                onCancel={() => setIsFormDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <AgendaStats appointments={Array.isArray(appointments) ? appointments : []} />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar citas por paciente, tipo o doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="Confirmada">Confirmadas</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Completada">Completadas</option>
                <option value="Cancelada">Canceladas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <AgendaCalendar
                  appointments={Array.isArray(filteredAppointments) ? filteredAppointments : []}
                  viewMode="month"
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onAppointmentUpdate={() => {
                    loadAppointments();
                  }}
                  onAppointmentDelete={() => {
                    loadAppointments();
                  }}
                  onAppointmentCreate={(date) => {
                    setSelectedDate(date);
                    setIsFormDialogOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral - Citas del día */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {formatDate(selectedDate)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getAppointmentsForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No hay citas programadas
                    </p>
                  ) : (
                    getAppointmentsForDate(selectedDate).map((appointment) => (
                      <div
                        key={appointment.id}
                        onClick={() => handleAppointmentClick(appointment)}
                        className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-blue-900">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            appointment.status === 'Confirmada' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'Completada' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{appointment.type}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Vista de Lista */
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando citas...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
                  <p className="text-gray-500">No se encontraron citas con los filtros aplicados</p>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => handleAppointmentClick(appointment)}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded ${
                            appointment.status === 'Confirmada' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'Completada' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(new Date(appointment.date))}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {appointment.doctor.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{appointment.type}</p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 mt-2">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para detalles de cita */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentDetail
              appointment={selectedAppointment}
              isOpen={isDetailDialogOpen}
              onClose={() => setIsDetailDialogOpen(false)}
              onUpdate={() => {
                loadAppointments();
                setIsDetailDialogOpen(false);
              }}
              onDelete={() => {
                loadAppointments();
                setIsDetailDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
