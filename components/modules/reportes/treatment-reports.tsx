

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  FileText,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
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

interface TreatmentReportsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function TreatmentReports({ dateRange }: TreatmentReportsProps) {
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState<any>(null);

  useEffect(() => {
    fetchTreatmentData();
  }, [dateRange]);

  const fetchTreatmentData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a API real
      
      // Datos de ejemplo mientras se implementa la API
      const mockData = {
        summary: {
          totalTreatments: 850,
          completed: 720,
          inProgress: 95,
          planned: 35,
          totalRevenue: 425000,
          avgCost: 500
        },
        byCategory: [
          { categoria: 'Preventivo', cantidad: 285, ingresos: 85500, color: '#10B981' },
          { categoria: 'Restaurativo', cantidad: 195, ingresos: 117000, color: '#3B82F6' },
          { categoria: 'Endodoncia', cantidad: 125, ingresos: 87500, color: '#8B5CF6' },
          { categoria: 'Ortodoncia', cantidad: 85, ingresos: 68000, color: '#F59E0B' },
          { categoria: 'Cirugía', cantidad: 75, ingresos: 52500, color: '#EF4444' },
          { categoria: 'Periodontal', cantidad: 85, ingresos: 14500, color: '#6B7280' }
        ],
        byStatus: [
          { status: 'Completado', cantidad: 720, color: '#10B981' },
          { status: 'En Progreso', cantidad: 95, color: '#F59E0B' },
          { status: 'Planificado', cantidad: 35, color: '#3B82F6' }
        ],
        monthlyTrends: [
          { mes: 'Ene', completados: 112, ingresos: 67200 },
          { mes: 'Feb', completados: 125, ingresos: 75000 },
          { mes: 'Mar', completados: 118, ingresos: 70800 },
          { mes: 'Abr', completados: 135, ingresos: 81000 },
          { mes: 'May', completados: 128, ingresos: 76800 },
          { mes: 'Jun', completados: 102, ingresos: 61200 }
        ],
        successRateByCategory: [
          { categoria: 'Preventivo', total: 285, exitosos: 280, tasa: 98.2 },
          { categoria: 'Restaurativo', total: 195, exitosos: 186, tasa: 95.4 },
          { categoria: 'Endodoncia', total: 125, exitosos: 118, tasa: 94.4 },
          { categoria: 'Ortodoncia', total: 85, exitosos: 82, tasa: 96.5 },
          { categoria: 'Cirugía', total: 75, exitosos: 69, tasa: 92.0 },
          { categoria: 'Periodontal', total: 85, exitosos: 80, tasa: 94.1 }
        ],
        costAnalysis: [
          { tratamiento: 'Implante Dental', promedio: 2500, cantidad: 25, total: 62500 },
          { tratamiento: 'Corona Porcelana', promedio: 800, cantidad: 45, total: 36000 },
          { tratamiento: 'Endodoncia', promedio: 700, cantidad: 65, total: 45500 },
          { tratamiento: 'Ortodoncia', promedio: 3200, cantidad: 15, total: 48000 },
          { tratamiento: 'Limpieza Profunda', promedio: 150, cantidad: 125, total: 18750 }
        ],
        recentTreatments: [
          { id: '1', patient: 'María González', treatment: 'Limpieza Dental', doctor: 'Dr. García', cost: 150, date: '2024-08-10', status: 'Completado' },
          { id: '2', patient: 'Carlos Ruiz', treatment: 'Empaste', doctor: 'Dra. Martínez', cost: 250, date: '2024-08-09', status: 'Completado' },
          { id: '3', patient: 'Ana Martínez', treatment: 'Endodoncia', doctor: 'Dr. Rodríguez', cost: 700, date: '2024-08-08', status: 'En Progreso' },
          { id: '4', patient: 'Luis Torres', treatment: 'Corona', doctor: 'Dra. López', cost: 800, date: '2024-08-07', status: 'Planificado' },
          { id: '5', patient: 'Carmen Silva', treatment: 'Implante', doctor: 'Dr. García', cost: 2500, date: '2024-08-06', status: 'En Progreso' }
        ]
      };
      
      setTreatmentData(mockData);
    } catch (error) {
      console.error('Error fetching treatment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completado':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'En Progreso':
        return <Badge className="bg-yellow-100 text-yellow-800">En Progreso</Badge>;
      case 'Planificado':
        return <Badge className="bg-blue-100 text-blue-800">Planificado</Badge>;
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
      {/* Resumen de Tratamientos */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{treatmentData?.summary?.totalTreatments}</p>
              <p className="text-sm text-gray-600">Total Tratamientos</p>
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
              <p className="text-2xl font-bold">{treatmentData?.summary?.completed}</p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{treatmentData?.summary?.inProgress}</p>
              <p className="text-sm text-gray-600">En Progreso</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-50">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{treatmentData?.summary?.planned}</p>
              <p className="text-sm text-gray-600">Planificados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">${treatmentData?.summary?.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-teal-50">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">${treatmentData?.summary?.avgCost}</p>
              <p className="text-sm text-gray-600">Costo Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tratamientos por Categoría */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 dental-text-primary" />
              Tratamientos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={treatmentData?.byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="cantidad"
                  label={({ categoria, percent }) => `${categoria} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {treatmentData?.byCategory?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, 'Cantidad']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estado de Tratamientos */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 dental-text-primary" />
              Estado de Tratamientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={treatmentData?.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3B82F6" />
              </BarChart>
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
              <LineChart data={treatmentData?.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completados"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Tratamientos Completados"
                />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Ingresos ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ingresos por Categoría */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 dental-text-primary" />
              Ingresos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={treatmentData?.byCategory} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="categoria" type="category" />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                <Bar dataKey="ingresos" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tasa de Éxito por Categoría */}
      <Card className="dental-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 dental-text-primary" />
            Tasa de Éxito por Categoría
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
                <TableHead>Categoría</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Exitosos</TableHead>
                <TableHead>Tasa de Éxito</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatmentData?.successRateByCategory?.map((category: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.categoria}</TableCell>
                  <TableCell>{category.total}</TableCell>
                  <TableCell>{category.exitosos}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        category.tasa >= 95 
                          ? "bg-green-100 text-green-800" 
                          : category.tasa >= 90 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {category.tasa}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análisis de Costos */}
      <Card className="dental-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 dental-text-primary" />
            Análisis de Costos por Tratamiento
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
                <TableHead>Tratamiento</TableHead>
                <TableHead>Costo Promedio</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Total Generado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatmentData?.costAnalysis?.map((treatment: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{treatment.tratamiento}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ${treatment.promedio.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{treatment.cantidad}</Badge>
                  </TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ${treatment.total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tratamientos Recientes */}
      <Card className="dental-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 dental-text-primary" />
            Tratamientos Recientes
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
                <TableHead>Tratamiento</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatmentData?.recentTreatments?.map((treatment: any) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">{treatment.patient}</TableCell>
                  <TableCell>{treatment.treatment}</TableCell>
                  <TableCell>{treatment.doctor}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ${treatment.cost.toLocaleString()}
                  </TableCell>
                  <TableCell>{new Date(treatment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(treatment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

