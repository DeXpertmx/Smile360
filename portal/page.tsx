
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PatientPortalPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el paciente está autenticado
    const token = localStorage.getItem('patientToken');
    const patientData = localStorage.getItem('patientData');

    if (!token || !patientData) {
      router.push('/portal/login');
      return;
    }

    try {
      const parsedPatientData = JSON.parse(patientData);
      setPatient(parsedPatientData);
    } catch (error) {
      console.error('Error parsing patient data:', error);
      router.push('/portal/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('patientData');
    toast.success('Sesión cerrada');
    router.push('/portal/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Portal de Pacientes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(patient.firstName, patient.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expediente: {patient.numeroExpediente}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {patient.firstName}!
          </h2>
          <p className="text-gray-600">
            Desde aquí puedes gestionar tu información médica, revisar tus citas y más.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">Mis Citas</CardTitle>
              <CardDescription>
                Ver citas programadas y historial
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">Documentos</CardTitle>
              <CardDescription>
                Recetas, órdenes de tratamiento y más
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">Facturación</CardTitle>
              <CardDescription>
                Estado de pagos y facturas
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Settings className="h-8 w-8 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">Mi Perfil</CardTitle>
              <CardDescription>
                Actualizar información personal
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Patient Information Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Mi Información</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre completo</p>
                    <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">No. Expediente</p>
                    <p className="font-medium">{patient.numeroExpediente}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">
                No hay citas programadas
              </p>
              <Button className="w-full" variant="outline">
                Agendar Cita
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">No hay actividad reciente</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
