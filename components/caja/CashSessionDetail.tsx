
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { 
  Loader2, 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  User,
  Eye
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Movement {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  movementDate: string;
  user: { id: string; name: string };
  patient?: { id: string; firstName: string; lastName: string };
  invoice?: { id: string; invoiceNumber: string };
  expense?: { id: string; expenseNumber: string; description: string };
}

interface SessionSummary {
  totalIncome: number;
  totalExpense: number;
  movementsByCategory: Record<string, { type: string; category: string; count: number; amount: number }>;
  movementsByPaymentMethod: Record<string, { count: number; amount: number }>;
}

interface CashSession {
  id: string;
  sessionNumber: string;
  status: string;
  openingBalance: number;
  expectedClosing: number;
  actualClosing?: number;
  difference?: number;
  totalIncome: number;
  totalExpense: number;
  openedAt: string;
  closedAt?: string;
  workingDate: string;
  notes?: string;
  discrepancyNotes?: string;
  cashRegister: { id: string; name: string };
  user: { id: string; name: string };
  movements: Movement[];
  summary: SessionSummary;
}

interface CashSessionDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onSuccess: () => void;
}

export function CashSessionDetail({ 
  open, 
  onOpenChange, 
  sessionId,
  onSuccess 
}: CashSessionDetailProps) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<CashSession | null>(null);
  const [closingForm, setClosingForm] = useState({
    actualClosing: '',
    notes: '',
    discrepancyNotes: '',
    denominations: {
      bills_1000: '',
      bills_500: '',
      bills_200: '',
      bills_100: '',
      bills_50: '',
      bills_20: '',
      coins_20: '',
      coins_10: '',
      coins_5: '',
      coins_2: '',
      coins_1: '',
      coins_050: '',
    }
  });

  const fetchSession = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/cash-sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        
        if (data.status === 'CERRADA' && data.actualClosing) {
          setClosingForm(prev => ({
            ...prev,
            actualClosing: data.actualClosing.toString(),
            notes: data.notes || '',
            discrepancyNotes: data.discrepancyNotes || ''
          }));
        }
      } else {
        toast.error('Error al cargar la sesión');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Error al cargar la sesión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && sessionId) {
      fetchSession();
    }
  }, [open, sessionId]);

  const calculateTotal = () => {
    const denominations = [
      { key: 'bills_1000', value: 1000 },
      { key: 'bills_500', value: 500 },
      { key: 'bills_200', value: 200 },
      { key: 'bills_100', value: 100 },
      { key: 'bills_50', value: 50 },
      { key: 'bills_20', value: 20 },
      { key: 'coins_20', value: 20 },
      { key: 'coins_10', value: 10 },
      { key: 'coins_5', value: 5 },
      { key: 'coins_2', value: 2 },
      { key: 'coins_1', value: 1 },
      { key: 'coins_050', value: 0.5 }
    ];

    let total = 0;
    denominations.forEach(({ key, value }) => {
      const quantity = parseInt(closingForm.denominations[key as keyof typeof closingForm.denominations]) || 0;
      total += quantity * value;
    });

    return total;
  };

  const handleCloseSession = async () => {
    if (!session) return;
    
    const actualClosing = parseFloat(closingForm.actualClosing);
    if (isNaN(actualClosing) || actualClosing < 0) {
      toast.error('El balance final debe ser un número válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/cash-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actualClosing,
          notes: closingForm.notes,
          discrepancyNotes: closingForm.discrepancyNotes,
          denominations: closingForm.denominations
        }),
      });

      if (response.ok) {
        toast.success('Sesión cerrada exitosamente');
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al cerrar la sesión');
      }
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Error al cerrar la sesión');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!session) {
    return null;
  }

  const calculatedTotal = calculateTotal();
  const difference = session.expectedClosing ? calculatedTotal - session.expectedClosing : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Sesión {session.sessionNumber} - {session.cashRegister.name}
            <Badge variant={session.status === 'ABIERTA' ? 'default' : 'secondary'}>
              {session.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Balance Inicial</span>
                </div>
                <p className="text-lg font-semibold">{formatCurrency(session.openingBalance)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Ingresos</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(session.totalIncome)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">Egresos</span>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(session.totalExpense)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Esperado</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(session.expectedClosing || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="movements" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="movements">Movimientos</TabsTrigger>
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="count" disabled={session.status === 'CERRADA'}>
                Arqueo
              </TabsTrigger>
              <TabsTrigger value="info">Información</TabsTrigger>
            </TabsList>

            <TabsContent value="movements" className="space-y-4">
              <div className="rounded-md border">
                <div className="divide-y">
                  {session.movements.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No hay movimientos registrados en esta sesión
                    </div>
                  ) : (
                    session.movements.map((movement) => (
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
                              <span className="text-sm text-muted-foreground">
                                {movement.paymentMethod}
                              </span>
                            </div>
                            <p className="font-medium">{movement.description}</p>
                            <div className="text-sm text-muted-foreground">
                              <p>{movement.user.name}</p>
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
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.values(session.summary.movementsByCategory).map((item, index) => (
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
                      {Object.entries(session.summary.movementsByPaymentMethod).map(([method, data], index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{method}</span>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(data.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {data.count} mov.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="count" className="space-y-4">
              {session.status === 'ABIERTA' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conteo de Efectivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Billetes</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { key: 'bills_1000', label: '$1,000', value: 1000 },
                            { key: 'bills_500', label: '$500', value: 500 },
                            { key: 'bills_200', label: '$200', value: 200 },
                            { key: 'bills_100', label: '$100', value: 100 },
                            { key: 'bills_50', label: '$50', value: 50 },
                            { key: 'bills_20', label: '$20', value: 20 }
                          ].map(({ key, label, value }) => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs">{label}</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={closingForm.denominations[key as keyof typeof closingForm.denominations]}
                                onChange={(e) => setClosingForm(prev => ({
                                  ...prev,
                                  denominations: {
                                    ...prev.denominations,
                                    [key]: e.target.value
                                  }
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Monedas</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { key: 'coins_20', label: '$20', value: 20 },
                            { key: 'coins_10', label: '$10', value: 10 },
                            { key: 'coins_5', label: '$5', value: 5 },
                            { key: 'coins_2', label: '$2', value: 2 },
                            { key: 'coins_1', label: '$1', value: 1 },
                            { key: 'coins_050', label: '$0.50', value: 0.5 }
                          ].map(({ key, label, value }) => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs">{label}</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={closingForm.denominations[key as keyof typeof closingForm.denominations]}
                                onChange={(e) => setClosingForm(prev => ({
                                  ...prev,
                                  denominations: {
                                    ...prev.denominations,
                                    [key]: e.target.value
                                  }
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Contado</p>
                          <p className="font-semibold">{formatCurrency(calculatedTotal)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Esperado</p>
                          <p className="font-semibold">{formatCurrency(session.expectedClosing || 0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Diferencia</p>
                          <p className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(difference)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Balance Final Contado</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={closingForm.actualClosing}
                          onChange={(e) => setClosingForm(prev => ({ ...prev, actualClosing: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setClosingForm(prev => ({ ...prev, actualClosing: calculatedTotal.toString() }))}
                        >
                          Usar Total Contado
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Observaciones sobre el Cierre</Label>
                        <Textarea
                          placeholder="Observaciones generales..."
                          value={closingForm.notes}
                          onChange={(e) => setClosingForm(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>

                      {Math.abs(difference) > 0.01 && (
                        <div className="space-y-2">
                          <Label>Explicación de Diferencias</Label>
                          <Textarea
                            placeholder="Explica las diferencias encontradas..."
                            value={closingForm.discrepancyNotes}
                            onChange={(e) => setClosingForm(prev => ({ ...prev, discrepancyNotes: e.target.value }))}
                          />
                        </div>
                      )}

                      <Button 
                        onClick={handleCloseSession}
                        disabled={loading || !closingForm.actualClosing}
                        className="w-full"
                      >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Cerrar Sesión
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {session.status === 'CERRADA' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumen del Arqueo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Balance Final</p>
                        <p className="text-xl font-bold">{formatCurrency(session.actualClosing || 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Esperado</p>
                        <p className="text-xl font-bold">{formatCurrency(session.expectedClosing || 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Diferencia</p>
                        <p className={`text-xl font-bold ${
                          (session.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(session.difference || 0)}
                        </p>
                      </div>
                    </div>
                    
                    {session.discrepancyNotes && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h5 className="font-medium text-yellow-800 mb-1">Explicación de Diferencias</h5>
                        <p className="text-sm text-yellow-700">{session.discrepancyNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Información de la Sesión</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Sesión: {session.sessionNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Usuario: {session.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Abierta: {new Date(session.openedAt).toLocaleString()}
                      </span>
                    </div>
                    {session.closedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Cerrada: {new Date(session.closedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {session.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{session.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
