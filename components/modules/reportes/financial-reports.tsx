

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
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
  Cell
} from 'recharts';

interface FinancialReportsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function FinancialReports({ dateRange }: FinancialReportsProps) {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a API real
      // const response = await fetch(`/api/reportes/financial?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      
      // Datos de ejemplo mientras se implementa la API
      const mockData = {
        revenue: {
          total: 125000,
          growth: 12.5,
          monthly: [
            { mes: 'Ene', total: 18000, tratamientos: 15000, productos: 3000 },
            { mes: 'Feb', total: 22000, tratamientos: 18000, productos: 4000 },
            { mes: 'Mar', total: 19000, tratamientos: 16000, productos: 3000 },
            { mes: 'Abr', total: 25000, tratamientos: 21000, productos: 4000 },
            { mes: 'May', total: 21000, tratamientos: 18000, productos: 3000 },
            { mes: 'Jun', total: 20000, tratamientos: 17000, productos: 3000 }
          ]
        },
        expenses: {
          total: 78000,
          categories: [
            { categoria: 'Sueldos', monto: 35000, color: '#3B82F6' },
            { categoria: 'Materiales', monto: 15000, color: '#10B981' },
            { categoria: 'Alquiler', monto: 12000, color: '#F59E0B' },
            { categoria: 'Servicios', monto: 8000, color: '#8B5CF6' },
            { categoria: 'Equipos', monto: 5000, color: '#EF4444' },
            { categoria: 'Otros', monto: 3000, color: '#6B7280' }
          ]
        },
        payments: {
          pending: 45000,
          overdue: 12000,
          collected: 98000,
          recent: [
            { id: '1', patient: 'María González', amount: 2500, date: '2024-08-10', status: 'Pagado' },
            { id: '2', patient: 'Carlos Ruiz', amount: 1800, date: '2024-08-09', status: 'Pendiente' },
            { id: '3', patient: 'Ana Martínez', amount: 3200, date: '2024-08-08', status: 'Vencido' },
            { id: '4', patient: 'Luis Torres', amount: 1200, date: '2024-08-07', status: 'Pagado' },
            { id: '5', patient: 'Carmen Silva', amount: 2800, date: '2024-08-06', status: 'Pendiente' }
          ]
        }
      };
      
      setFinancialData(mockData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Pagado':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'Pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'Vencido':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
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
      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                +{financialData?.revenue?.growth}%
              </Badge>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">${financialData?.revenue?.total.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">${financialData?.expenses?.total.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Gastos Totales</p>
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
              <p className="text-2xl font-bold">${financialData?.payments?.pending.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pagos Pendientes</p>
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
              <p className="text-2xl font-bold">${financialData?.payments?.overdue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pagos Vencidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos Mensuales */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 dental-text-primary" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData?.revenue?.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="tratamientos" fill="#3B82F6" name="Tratamientos" />
                <Bar dataKey="productos" fill="#10B981" name="Productos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Gastos */}
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 dental-text-primary" />
              Distribución de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialData?.expenses?.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="monto"
                  label={({ categoria, percent }) => `${categoria} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {financialData?.expenses?.categories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Pagos Recientes */}
      <Card className="dental-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 dental-text-primary" />
            Pagos Recientes
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
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialData?.payments?.recent?.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.patient}</TableCell>
                  <TableCell>${payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

