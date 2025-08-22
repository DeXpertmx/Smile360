

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Eye,
  PieChart,
  Activity,
  Calendar as CalendarIcon,
  UserCheck,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FinancialReports } from './financial-reports';
import { PatientReports } from './patient-reports';
import { AppointmentReports } from './appointment-reports';
import { TreatmentReports } from './treatment-reports';
import { OverviewDashboard } from './overview-dashboard';

interface ReportsData {
  overview: {
    totalPatients: number;
    totalRevenue: number;
    appointmentsThisMonth: number;
    completedTreatments: number;
    pendingPayments: number;
    newPatientsThisMonth: number;
  };
  monthlyGrowth: {
    patients: number;
    revenue: number;
    appointments: number;
  };
}

export function ReportesModule() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [reportData, setReportData] = useState<ReportsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reportes/overview?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportsData();
    setRefreshing(false);
  };

  const exportReport = (type: string) => {
    // TODO: Implementar exportación de reportes
    console.log(`Exportando reporte: ${type}`);
  };

  const quickStats = reportData?.overview ? [
    {
      title: 'Total Pacientes',
      value: reportData.overview.totalPatients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      growth: reportData.monthlyGrowth?.patients || 0
    },
    {
      title: 'Ingresos del Mes',
      value: `$${reportData.overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      growth: reportData.monthlyGrowth?.revenue || 0
    },
    {
      title: 'Citas Este Mes',
      value: reportData.overview.appointmentsThisMonth,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      growth: reportData.monthlyGrowth?.appointments || 0
    },
    {
      title: 'Tratamientos Completados',
      value: reportData.overview.completedTreatments,
      icon: UserCheck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      growth: 0
    },
    {
      title: 'Pagos Pendientes',
      value: `$${reportData.overview.pendingPayments.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      growth: 0
    },
    {
      title: 'Nuevos Pacientes',
      value: reportData.overview.newPatientsThisMonth,
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      growth: 0
    }
  ] : [];

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Reportes y Análisis</h1>
          <p className="text-gray-600">Análisis detallado del rendimiento de la clínica</p>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Reportes y Análisis</h1>
          <p className="text-gray-600">Análisis detallado del rendimiento de la clínica</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="dental-border dental-hover"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Select defaultValue="pdf">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Exportar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf" onClick={() => exportReport('pdf')}>
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </div>
              </SelectItem>
              <SelectItem value="excel" onClick={() => exportReport('excel')}>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Excel
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros de fecha */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Período:</label>
              <DatePicker
                selected={dateRange.from}
                onChange={(date: Date | undefined) => date && setDateRange(prev => ({ ...prev, from: date }))}
                placeholderText="Fecha inicio"
              />
              <span className="text-gray-500">-</span>
              <DatePicker
                selected={dateRange.to}
                onChange={(date: Date | undefined) => date && setDateRange(prev => ({ ...prev, to: date }))}
                placeholderText="Fecha fin"
              />
            </div>
            
            <Select defaultValue="monthly">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período predefinido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today" onClick={() => setDateRange({ from: new Date(), to: new Date() })}>
                  Hoy
                </SelectItem>
                <SelectItem value="week" onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  setDateRange({ from: weekAgo, to: today });
                }}>
                  Última semana
                </SelectItem>
                <SelectItem value="monthly" onClick={() => {
                  const today = new Date();
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                  setDateRange({ from: monthStart, to: today });
                }}>
                  Este mes
                </SelectItem>
                <SelectItem value="quarter" onClick={() => {
                  const today = new Date();
                  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                  setDateRange({ from: quarterStart, to: today });
                }}>
                  Este trimestre
                </SelectItem>
                <SelectItem value="year" onClick={() => {
                  const today = new Date();
                  const yearStart = new Date(today.getFullYear(), 0, 1);
                  setDateRange({ from: yearStart, to: today });
                }}>
                  Este año
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="dental-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {stat.growth !== 0 && (
                    <Badge variant={stat.growth > 0 ? 'default' : 'destructive'} className="text-xs">
                      {stat.growth > 0 ? '+' : ''}{stat.growth}%
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs de reportes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financiero
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Citas
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tratamientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewDashboard dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialReports dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <PatientReports dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <AppointmentReports dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="treatments" className="space-y-6">
          <TreatmentReports dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

