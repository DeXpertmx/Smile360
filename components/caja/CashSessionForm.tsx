
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CashRegister {
  id: string;
  name: string;
  currentBalance: number;
  isActive: boolean;
}

interface CashSessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  cashRegisterId?: string;
}

export function CashSessionForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  cashRegisterId 
}: CashSessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  
  const [formData, setFormData] = useState({
    cashRegisterId: cashRegisterId || '',
    openingBalance: '',
    notes: '',
    workingDate: new Date().toISOString().split('T')[0]
  });

  const fetchCashRegisters = async () => {
    try {
      const response = await fetch('/api/cash-registers');
      if (response.ok) {
        const data = await response.json();
        setCashRegisters(data.filter((cr: CashRegister) => cr.isActive));
      }
    } catch (error) {
      console.error('Error fetching cash registers:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCashRegisters();
      if (cashRegisterId) {
        setFormData(prev => ({ ...prev, cashRegisterId }));
      }
    }
  }, [open, cashRegisterId]);

  const selectedCashRegister = cashRegisters.find(cr => cr.id === formData.cashRegisterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cashRegisterId || !formData.openingBalance) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const openingBalance = parseFloat(formData.openingBalance);
    if (isNaN(openingBalance) || openingBalance < 0) {
      toast.error('El balance inicial debe ser un número válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/cash-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          openingBalance
        }),
      });

      if (response.ok) {
        toast.success('Sesión de caja abierta exitosamente');
        onSuccess();
        onOpenChange(false);
        setFormData({
          cashRegisterId: '',
          openingBalance: '',
          notes: '',
          workingDate: new Date().toISOString().split('T')[0]
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al abrir la sesión');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Error al abrir la sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Abrir Sesión de Caja</DialogTitle>
        </DialogHeader>

        {selectedCashRegister && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Caja Seleccionada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedCashRegister.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Balance actual: {formatCurrency(selectedCashRegister.currentBalance)}
                  </p>
                </div>
                <Badge variant="default">Activa</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cashRegisterId">Caja *</Label>
            <Select
              value={formData.cashRegisterId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, cashRegisterId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar caja" />
              </SelectTrigger>
              <SelectContent>
                {cashRegisters.map(register => (
                  <SelectItem key={register.id} value={register.id}>
                    {register.name} ({formatCurrency(register.currentBalance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Balance Inicial *</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.openingBalance}
                onChange={(e) => setFormData(prev => ({ ...prev, openingBalance: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingDate">Fecha de Trabajo</Label>
              <Input
                id="workingDate"
                type="date"
                value={formData.workingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, workingDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones sobre la apertura de la sesión..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Abrir Sesión
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
