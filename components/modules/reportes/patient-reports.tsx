

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
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

interface PatientReportsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function PatientReports({ dateRange }: PatientReportsProps) {
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    fetchPatientData();
  }, [dateRange]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a API real
      
      // Datos de ejemplo mientras se implementa la API
      const mockData = {
        summary: {
          totalPatients: 845,
          newPatients: 38,
          activePatients: 721,
          inactivePatients: 124,
          avgAge: 35
        },
        demographics: {
          byAge: [
            { rango: '0-18', pacientes: 125, porcentaje: 14.8 },
            { rango: '19-35', pacientes: 285, porcentaje: 33.7 },
            { rango: '36-50', pacientes: 235, porcentaje: 27.8 },
            { rango: '51-65', pacientes: 145, porcentaje: 17.2 },
            { rango: '65+', pacientes: 55, porcentaje: 6.5 }
          ],
          byGender: [
            { genero: 'Femenino', cantidad: 478, color: '#EC4899' },
            { genero: 'Masculino', cantidad: 367, color: '#3B82F6' }
          ],
          byLocation: [
            { ciudad: 'Centro', pacientes: 285 },
            { ciudad: 'Norte', pacientes: 195 },
            { ciudad: 'Sur', pacientes: 165 },
            { ciudad: 'Este', pacientes: 125 },
            { ciudad: 'Oeste', pacientes: 75 }
          ]
        },
        growth: [
          { mes: 'Ene', nuevos: 28, total: 720 },
          { mes: 'Feb', nuevos: 35, total: 755 },
          { mes: 'Mar', nuevos: 32, total: 787 },
          { mes: 'Abr', nuevos: 29, total: 816 },
          { mes: 'May', nuevos: 31, total: 847 },
          { mes: 'Jun', nuevos: 38, total: 885 }
        ],
        topPatients: [
          { id: '1', name: 'María González', treatments: 12, spent: 15500, lastVisit: '2024-08-05' },
          { id: '2', name: 'Carlos Ruiz', treatments: 8, spent: 12300, lastVisit: '2024-08-03' },
          { id: '3', name: 'Ana Martínez', treatments: 10, spent: 11800, lastVisit: '2024-08-07' },
          { id: '4', name: 'Luis Torres', treatments: 6, spent: 9500, lastVisit: '2024-08-02' },
          { id: '5', name: 'Carmen Silva', treatments: 9, spent: 8900, lastVisit: '2024-08-06' }
        ]
      };
      
      setPatientData(mockData);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
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
      {/* Resumen de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{patientData?.summary?.totalPatients}</p>
              <p className="text-sm text-gray-600">Total Pacientes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-50">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">Nuevos</Badge>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{patientData?.summary?.newPatients}</p>
              <p className="text-sm text-gray-600">Este Mes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-teal-50">
                <UserCheck className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{patientData?.summary?.activePatients}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gray-50">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{patientData?.summary?.inactivePatients}</p>
              <p className="text-sm text-gray-600">Inactivos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-50">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{patientData?.summary?.avgAge}</p>
              <p className="text-sm text-gray-600">Edad Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Edad */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 dental-text-primary" />
              Distribución por Edad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientData?.demographics?.byAge}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rango" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pacientes" fill="#3B82F6" name="Pacientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Género */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 dental-text-primary" />
              Distribución por Género
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={patientData?.demographics?.byGender}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="cantidad"
                  label={({ genero, percent }) => `${genero} ${((percent || 0) * 100).toFixed(1)}%`}
                >
                  {patientData?.demographics?.byGender?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crecimiento de Pacientes */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 dental-text-primary" />
              Crecimiento de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={patientData?.growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Total Pacientes"
                />
                <Area
                  type="monotone"
                  dataKey="nuevos"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Nuevos Pacientes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pacientes por Ubicación */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 dental-text-primary" />
              Pacientes por Zona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientData?.demographics?.byLocation} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="ciudad" type="category" />
                <Tooltip />
                <Bar dataKey="pacientes" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Pacientes */}
      <Card className="dental-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 dental-text-primary" />
            Pacientes Más Activos
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
                <TableHead>Tratamientos</TableHead>
                <TableHead>Gasto Total</TableHead>
                <TableHead>Última Visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientData?.topPatients?.map((patient: any) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{patient.treatments}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${patient.spent.toLocaleString()}
                  </TableCell>
                  <TableCell>{new Date(patient.lastVisit).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

