
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Calculator,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
    activeCashRegisters: number;
    openSessions: number;
    todayMovements: number;
  };
  cashRegisters: Array<{
    id: string;
    name: string;
    currentBalance: number;
    _count: { sessions: number };
  }>;
  todaySessions: Array<{
    id: string;
    sessionNumber: string;
    status: string;
    openingBalance: number;
    totalIncome: number;
    totalExpense: number;
    cashRegister: { id: string; name: string };
    user: { id: string; name: string };
    openedAt: string;
  }>;
  recentMovements: Array<{
    id: string;
    type: string;
    category: string;
    amount: number;
    description: string;
    movementDate: string;
    cashRegister: { id: string; name: string };
    user: { id: string; name: string };
    patient?: { id: string; firstName: string; lastName: string };
  }>;
  analytics: {
    movementsByCategory: Array<{
      category: string;
      type: string;
      amount: number;
      count: number;
    }>;
    movementsByPaymentMethod: Array<{
      paymentMethod: string;
      amount: number;
      count: number;
    }>;
  };
}

interface CashDashboardProps {
  onOpenSession: (cashRegisterId: string) => void;
  onViewSession: (sessionId: string) => void;
  onNewMovement: (cashRegisterId?: string) => void;
  onViewCashRegister: (cashRegisterId: string) => void;
}

export function CashDashboard({
  onOpenSession,
  onViewSession,
  onNewMovement,
  onViewCashRegister
}: CashDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('today');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cash/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Error al cargar los datos del dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen Principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Día</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos del Día</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.summary.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.summary.netFlow)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.todayMovements}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.openSessions} sesión(es) abiertas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="registers">Cajas</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones Hoy</TabsTrigger>
          <TabsTrigger value="movements">Movimientos Recientes</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="registers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Estado de las Cajas</h3>
            <Button onClick={() => onNewMovement()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.cashRegisters.map((register) => (
              <Card key={register.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-base">{register.name}</span>
                    <Badge variant={register._count.sessions > 0 ? "default" : "secondary"}>
                      {register._count.sessions > 0 ? 'Abierta' : 'Cerrada'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Balance Actual</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(register.currentBalance)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewCashRegister(register.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      
                      {register._count.sessions === 0 && (
                        <Button
                          size="sm"
                          onClick={() => onOpenSession(register.id)}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Abrir Sesión
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNewMovement(register.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Movimiento
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <h3 className="text-lg font-medium">Sesiones de Hoy</h3>
          
          {data.todaySessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No hay sesiones abiertas hoy</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {data.todaySessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {session.cashRegister.name} - Sesión {session.sessionNumber}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Usuario: {session.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Apertura: {new Date(session.openedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <Badge variant={session.status === 'ABIERTA' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                        <div className="text-sm">
                          <p>Inicio: {formatCurrency(session.openingBalance)}</p>
                          <p className="text-green-600">+{formatCurrency(session.totalIncome)}</p>
                          <p className="text-red-600">-{formatCurrency(session.totalExpense)}</p>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewSession(session.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <h3 className="text-lg font-medium">Movimientos Recientes</h3>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {data.recentMovements.map((movement) => (
                  <div key={movement.id} className="p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={movement.type === 'INGRESO' ? 'default' : 'destructive'}>
                            {movement.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {movement.category}
                          </span>
                        </div>
                        <p className="font-medium">{movement.description}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>{movement.cashRegister.name} • {movement.user.name}</p>
                          {movement.patient && (
                            <p>Paciente: {movement.patient.firstName} {movement.patient.lastName}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold ${
                          movement.type === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'INGRESO' ? '+' : '-'}{formatCurrency(movement.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.movementDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-medium">Análisis del Día</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.analytics.movementsByCategory.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.type === 'INGRESO' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {item.type}
                        </Badge>
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          item.type === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.count} mov.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Método de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.analytics.movementsByPaymentMethod.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.paymentMethod}</span>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.count} mov.
                        </p>
                      </div>
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
