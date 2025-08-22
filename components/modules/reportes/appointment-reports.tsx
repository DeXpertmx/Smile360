

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AppointmentReportsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function AppointmentReports({ dateRange }: AppointmentReportsProps) {
  const [loading, setLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState<any>(null);

  useEffect(() => {
    fetchAppointmentData();
  }, [dateRange]);

  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a API real
      
      // Datos de ejemplo mientras se implementa la API
      const mockData = {
        summary: {
          totalAppointments: 1250,
          completed: 1050,
          cancelled: 125,
          noShow: 75,
          occupancyRate: 84,
          avgDuration: 45
        },
        byStatus: [
          { status: 'Completadas', cantidad: 1050, color: '#10B981' },
          { status: 'Canceladas', cantidad: 125, color: '#F59E0B' },
          { status: 'No Se Presentaron', cantidad: 75, color: '#EF4444' }
        ],
        dailyTrends: [
          { dia: 'Lun', programadas: 45, completadas: 38, canceladas: 4, noShow: 3 },
          { dia: 'Mar', programadas: 48, completadas: 42, canceladas: 3, noShow: 3 },
          { dia: 'Mié', programadas: 52, completadas: 47, canceladas: 3, noShow: 2 },
          { dia: 'Jue', programadas: 46, completadas: 40, canceladas: 4, noShow: 2 },
          { dia: 'Vie', programadas: 50, completadas: 44, canceladas: 4, noShow: 2 },
          { dia: 'Sáb', programadas: 25, completadas: 22, canceladas: 2, noShow: 1 }
        ],
        hourlyDistribution: [
          { hora: '08:00', citas: 8 },
          { hora: '09:00', citas: 12 },
          { hora: '10:00', citas: 15 },
          { hora: '11:00', citas: 18 },
          { hora: '12:00', citas: 10 },
          { hora: '13:00', citas: 5 },
          { hora: '14:00', citas: 12 },
          { hora: '15:00', citas: 16 },
          { hora: '16:00', citas: 14 },
          { hora: '17:00', citas: 12 },
          { hora: '18:00', citas: 8 }
        ],
        monthlyTrends: [
          { mes: 'Ene', total: 195, completadas: 168, tasa: 86.2 },
          { mes: 'Feb', total: 210, completadas: 182, tasa: 86.7 },
          { mes: 'Mar', total: 205, completadas: 175, tasa: 85.4 },
          { mes: 'Abr', total: 225, completadas: 195, tasa: 86.7 },
          { mes: 'May', total: 215, completadas: 185, tasa: 86.0 },
          { mes: 'Jun', total: 200, completadas: 165, tasa: 82.5 }
        ],
        byDoctor: [
          { doctor: 'Dr. García', total: 285, completadas: 258, tasa: 90.5 },
          { doctor: 'Dra. Martínez', total: 245, completadas: 210, tasa: 85.7 },
          { doctor: 'Dr. Rodríguez', total: 220, completadas: 195, tasa: 88.6 },
          { doctor: 'Dra. López', total: 180, completadas: 152, tasa: 84.4 }
        ],
        recentAppointments: [
          { id: '1', patient: 'María González', doctor: 'Dr. García', date: '2024-08-10', time: '10:00', type: 'Consulta', status: 'Completada' },
          { id: '2', patient: 'Carlos Ruiz', doctor: 'Dra. Martínez', date: '2024-08-10', time: '11:30', type: 'Limpieza', status: 'Completada' },
          { id: '3', patient: 'Ana Martínez', doctor: 'Dr. Rodríguez', date: '2024-08-10', time: '14:00', type: 'Tratamiento', status: 'Cancelada' },
          { id: '4', patient: 'Luis Torres', doctor: 'Dra. López', date: '2024-08-11', time: '09:00', type: 'Consulta', status: 'Programada' },
          { id: '5', patient: 'Carmen Silva', doctor: 'Dr. García', date: '2024-08-11', time: '15:30', type: 'Control', status: 'Programada' }
        ]
      };
      
      setAppointmentData(mockData);
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completada':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      case 'Programada':
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>;
      case 'Cancelada':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'No Se Presentó':
        return <Badge className="bg-orange-100 text-orange-800">No Se Presentó</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-64 bg-gray-100 rounded"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Citas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{appointmentData?.summary?.totalAppointments}</p>
              <p className="text-sm text-gray-600">Total Citas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{appointmentData?.summary?.completed}</p>
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-yellow-50">
                <XCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{appointmentData?.summary?.cancelled}</p>
              <p className="text-sm text-gray-600">Canceladas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{appointmentData?.summary?.noShow}</p>
              <p className="text-sm text-gray-600">No Se Presentaron</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-50">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{appointmentData?.summary?.occupancyRate}%</p>
              <p className="text-sm text-gray-600">Ocupación</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-teal-50">
                <Clock className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{appointmentData?.summary?.avgDuration}min</p>
              <p className="text-sm text-gray-600">Duración Prom.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de las Citas */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 dental-text-primary" />
              Estado de las Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentData?.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="cantidad"
                  label={({ status, percent }) => `${status} ${((percent || 0) * 100).toFixed(1)}%`}
                >
                  {appointmentData?.byStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución Diaria */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 dental-text-primary" />
              Citas por Día de la Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData?.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completadas" fill="#10B981" name="Completadas" />
                <Bar dataKey="canceladas" fill="#F59E0B" name="Canceladas" />
                <Bar dataKey="noShow" fill="#EF4444" name="No Se Presentaron" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Hora */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 dental-text-primary" />
              Distribución por Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={appointmentData?.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="citas"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Citas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendencias Mensuales */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 dental-text-primary" />
              Tendencias Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={appointmentData?.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Total Citas"
                />
                <Line
                  type="monotone"
                  dataKey="completadas"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Completadas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento por Doctor */}
      <Card className="dental-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 dental-text-primary" />
            Rendimiento por Doctor
          </CardTitle>
          <Button variant="outline" size="sm" className="dental-border dental-hover">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Total Citas</TableHead>
                <TableHead>Completadas</TableHead>
                <TableHead>Tasa de Éxito</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentData?.byDoctor?.map((doctor: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{doctor.doctor}</TableCell>
                  <TableCell>{doctor.total}</TableCell>
                  <TableCell>{doctor.completadas}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        doctor.tasa >= 88 
                          ? "bg-green-100 text-green-800" 
                          : doctor.tasa >= 85 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {doctor.tasa}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Citas Recientes */}
      <Card className="dental-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 dental-text-primary" />
            Citas Recientes
          </CardTitle>
          <Button variant="outline" size="sm" className="dental-border dental-hover">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentData?.recentAppointments?.map((appointment: any) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.patient}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

