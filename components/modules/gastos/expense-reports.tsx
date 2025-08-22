
'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface Expense {
  id: string;
  description: string;
  amount: number;
  totalAmount: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  expenseDate: string;
  paymentMethod: string;
  status: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
}

interface ExpenseReportsProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
}

interface ReportData {
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  categorySummary: Array<{
    category: string;
    color: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  paymentMethodSummary: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  statusSummary: Array<{
    status: string;
    amount: number;
    count: number;
  }>;
}

export function ExpenseReports({ expenses, categories }: ExpenseReportsProps) {
  const [reportData, setReportData] = useState<ReportData>({
    totalExpenses: 0,
    totalAmount: 0,
    averageExpense: 0,
    categorySummary: [],
    monthlyTrends: [],
    paymentMethodSummary: [],
    statusSummary: []
  });
  
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: startOfMonth(subMonths(new Date(), 11)),
    endDate: endOfMonth(new Date())
  });

  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    generateReportData();
  }, [expenses, dateRange]);

  const generateReportData = () => {
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
    });

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
    const totalExpenses = filteredExpenses.length;
    const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Resumen por categoría
    const categoryMap = new Map<string, { amount: number; count: number; color: string; name: string }>();
    
    filteredExpenses.forEach(expense => {
      const categoryId = expense.categoryId;
      const category = expense.category;
      
      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.amount += expense.totalAmount;
        existing.count += 1;
      } else {
        categoryMap.set(categoryId, {
          amount: expense.totalAmount,
          count: 1,
          color: category.color,
          name: category.name
        });
      }
    });

    const categorySummary = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      category: data.name,
      color: data.color,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    // Tendencias mensuales (últimos 12 meses)
    const monthlyMap = new Map<string, { amount: number; count: number }>();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM yyyy', { locale: es });
      monthlyMap.set(monthKey, { amount: 0, count: 0 });
    }

    filteredExpenses.forEach(expense => {
      const monthKey = format(new Date(expense.expenseDate), 'yyyy-MM');
      if (monthlyMap.has(monthKey)) {
        const existing = monthlyMap.get(monthKey)!;
        existing.amount += expense.totalAmount;
        existing.count += 1;
      }
    });

    const monthlyTrends = Array.from(monthlyMap.entries()).map(([monthKey, data]) => ({
      month: format(new Date(monthKey + '-01'), 'MMM yyyy', { locale: es }),
      amount: data.amount,
      count: data.count
    }));

    // Resumen por método de pago
    const paymentMethodMap = new Map<string, { amount: number; count: number }>();
    
    filteredExpenses.forEach(expense => {
      const method = expense.paymentMethod;
      if (paymentMethodMap.has(method)) {
        const existing = paymentMethodMap.get(method)!;
        existing.amount += expense.totalAmount;
        existing.count += 1;
      } else {
        paymentMethodMap.set(method, {
          amount: expense.totalAmount,
          count: 1
        });
      }
    });

    const paymentMethodSummary = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    // Resumen por estado
    const statusMap = new Map<string, { amount: number; count: number }>();
    
    filteredExpenses.forEach(expense => {
      const status = expense.status;
      if (statusMap.has(status)) {
        const existing = statusMap.get(status)!;
        existing.amount += expense.totalAmount;
        existing.count += 1;
      } else {
        statusMap.set(status, {
          amount: expense.totalAmount,
          count: 1
        });
      }
    });

    const statusSummary = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      amount: data.amount,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    setReportData({
      totalExpenses,
      totalAmount,
      averageExpense,
      categorySummary,
      monthlyTrends,
      paymentMethodSummary,
      statusSummary
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/expenses/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          reportData
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `reporte-gastos-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Reporte exportado exitosamente');
      } else {
        toast.error('Error al generar reporte PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar reporte');
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch('/api/expenses/reports/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          expenses: expenses.filter(expense => {
            const expenseDate = new Date(expense.expenseDate);
            return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
          })
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `gastos-detalle-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Datos exportados exitosamente');
      } else {
        toast.error('Error al generar archivo Excel');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar datos');
    }
  };

  // Configuración de gráficos
  const categoryChartData = {
    labels: reportData.categorySummary.map(item => item.category),
    datasets: [{
      data: reportData.categorySummary.map(item => item.amount),
      backgroundColor: reportData.categorySummary.map(item => item.color),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const monthlyTrendsChartData = {
    labels: reportData.monthlyTrends.map(item => item.month),
    datasets: [{
      label: 'Gastos Mensuales',
      data: reportData.monthlyTrends.map(item => item.amount),
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      tension: 0.1
    }]
  };

  const paymentMethodChartData = {
    labels: reportData.paymentMethodSummary.map(item => item.method),
    datasets: [{
      label: 'Monto por Método',
      data: reportData.paymentMethodSummary.map(item => item.amount),
      backgroundColor: [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6'
      ]
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y || context.parsed;
            return `${context.label}: ${formatCurrency(value)}`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Reportes de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, startDate: date }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, endDate: date }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">registros en el período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">suma de todos los gastos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.averageExpense)}
            </div>
            <p className="text-xs text-muted-foreground">gasto promedio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.categorySummary.length}</div>
            <p className="text-xs text-muted-foreground">categorías utilizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Análisis */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="methods">Métodos de Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.categorySummary.length > 0 ? (
                  <Pie data={categoryChartData} options={chartOptions} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay datos para mostrar
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.statusSummary.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          {item.status}
                        </Badge>
                        <span className="text-sm">({item.count} gastos)</span>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.categorySummary.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold">{item.category}</span>
                      </div>
                      <Badge>{item.percentage.toFixed(1)}%</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Monto:</span>
                        <span className="font-semibold ml-2">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Gastos:</span>
                        <span className="font-semibold ml-2">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.monthlyTrends.length > 0 ? (
                <Line data={monthlyTrendsChartData} options={chartOptions} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos suficientes para mostrar tendencias
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Método de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.paymentMethodSummary.length > 0 ? (
                  <Bar data={paymentMethodChartData} options={chartOptions} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay datos para mostrar
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalle por Método</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.paymentMethodSummary.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{item.method}</div>
                        <div className="text-sm text-gray-600">
                          {item.count} transacciones
                        </div>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
