

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface OverviewDashboardProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function OverviewDashboard({ dateRange }: OverviewDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reportes/dashboard?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Datos de ejemplo mientras se implementa la API
  const monthlyRevenue = [
    { mes: 'Ene', ingresos: 45000, gastos: 32000, pacientes: 120 },
    { mes: 'Feb', ingresos: 52000, gastos: 35000, pacientes: 135 },
    { mes: 'Mar', ingresos: 48000, gastos: 33000, pacientes: 128 },
    { mes: 'Abr', ingresos: 61000, gastos: 38000, pacientes: 152 },
    { mes: 'May', ingresos: 55000, gastos: 36000, pacientes: 145 },
    { mes: 'Jun', ingresos: 67000, gastos: 42000, pacientes: 168 }
  ];

  const treatmentTypes = [
    { name: 'Limpieza', value: 35, color: '#8B5CF6' },
    { name: 'Empastes', value: 28, color: '#3B82F6' },
    { name: 'Endodoncia', value: 15, color: '#10B981' },
    { name: 'Ortodoncia', value: 12, color: '#F59E0B' },
    { name: 'Cirugía', value: 10, color: '#EF4444' }
  ];

  const weeklyAppointments = [
    { dia: 'Lun', citas: 25, completadas: 23, canceladas: 2 },
    { dia: 'Mar', citas: 28, completadas: 26, canceladas: 2 },
    { dia: 'Mié', citas: 32, completadas: 30, canceladas: 2 },
    { dia: 'Jue', citas: 29, completadas: 27, canceladas: 2 },
    { dia: 'Vie', citas: 35, completadas: 33, canceladas: 2 },
    { dia: 'Sáb', citas: 20, completadas: 18, canceladas: 2 }
  ];

  const patientGrowth = [
    { mes: 'Ene', nuevos: 25, total: 450 },
    { mes: 'Feb', nuevos: 32, total: 482 },
    { mes: 'Mar', nuevos: 28, total: 510 },
    { mes: 'Abr', nuevos: 35, total: 545 },
    { mes: 'May', nuevos: 30, total: 575 },
    { mes: 'Jun', nuevos: 38, total: 613 }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-80 bg-gray-100 rounded"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ingresos y Gastos Mensuales */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 dental-text-primary" />
            Ingresos vs Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingresos"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribución de Tratamientos */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 dental-text-primary" />
            Tratamientos por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={treatmentTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {treatmentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, 'Porcentaje']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Citas Semanales */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 dental-text-primary" />
            Citas por Día de la Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAppointments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completadas" fill="#10B981" name="Completadas" />
              <Bar dataKey="canceladas" fill="#EF4444" name="Canceladas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Crecimiento de Pacientes */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 dental-text-primary" />
            Crecimiento de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="nuevos"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Nuevos Pacientes"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Total Pacientes"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

