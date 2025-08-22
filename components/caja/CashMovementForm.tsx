
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

interface CashRegister {
  id: string;
  name: string;
  currentBalance: number;
  isActive: boolean;
}

interface CashCategory {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  numeroExpediente: string;
}

interface CashMovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultCashRegisterId?: string;
}

export function CashMovementForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  defaultCashRegisterId 
}: CashMovementFormProps) {
  const [loading, setLoading] = useState(false);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [categories, setCategories] = useState<CashCategory[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  
  const [formData, setFormData] = useState({
    cashRegisterId: defaultCashRegisterId || '',
    type: '',
    category: '',
    amount: '',
    paymentMethod: 'EFECTIVO',
    description: '',
    reference: '',
    patientId: '',
    documentType: '',
    documentNumber: ''
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

  const fetchCategories = async (type: string) => {
    try {
      const response = await fetch(`/api/cash-categories?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPatients = async (search: string) => {
    if (search.length < 2) {
      setPatients([]);
      return;
    }

    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(search)}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCashRegisters();
      setFormData(prev => ({
        ...prev,
        cashRegisterId: defaultCashRegisterId || prev.cashRegisterId
      }));
    }
  }, [open, defaultCashRegisterId]);

  useEffect(() => {
    if (formData.type) {
      fetchCategories(formData.type);
    }
  }, [formData.type]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients(searchPatient);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cashRegisterId || !formData.type || !formData.category || 
        !formData.amount || !formData.description) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser un número válido mayor a 0');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/cash-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount
        }),
      });

      if (response.ok) {
        toast.success('Movimiento registrado exitosamente');
        onSuccess();
        onOpenChange(false);
        setFormData({
          cashRegisterId: defaultCashRegisterId || '',
          type: '',
          category: '',
          amount: '',
          paymentMethod: 'EFECTIVO',
          description: '',
          reference: '',
          patientId: '',
          documentType: '',
          documentNumber: ''
        });
        setSearchPatient('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al registrar el movimiento');
      }
    } catch (error) {
      console.error('Error creating movement:', error);
      toast.error('Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const selectedCashRegister = cashRegisters.find(cr => cr.id === formData.cashRegisterId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
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
                    Balance actual: ${selectedCashRegister.currentBalance.toFixed(2)}
                  </p>
                </div>
                <Badge variant="default">Activa</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {register.name} (${register.currentBalance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Movimiento *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, category: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INGRESO">Ingreso</SelectItem>
                  <SelectItem value="EGRESO">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                      {category.description && (
                        <span className="text-muted-foreground"> - {category.description}</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe el motivo del movimiento..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                placeholder="Número de referencia, folio, etc."
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FACTURA">Factura</SelectItem>
                  <SelectItem value="RECIBO">Recibo</SelectItem>
                  <SelectItem value="COMPROBANTE">Comprobante</SelectItem>
                  <SelectItem value="TICKET">Ticket</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.documentType && (
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de Documento</Label>
              <Input
                id="documentNumber"
                placeholder="Número del documento"
                value={formData.documentNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="patient">Paciente (Opcional)</Label>
            <Input
              id="patient"
              placeholder="Buscar paciente por nombre o expediente..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
            />
            
            {patients.length > 0 && searchPatient.length >= 2 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {patients.map(patient => (
                  <button
                    key={patient.id}
                    type="button"
                    className="w-full text-left p-2 hover:bg-muted border-b last:border-b-0"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, patientId: patient.id }));
                      setSearchPatient(`${patient.firstName} ${patient.lastName} (${patient.numeroExpediente})`);
                      setPatients([]);
                    }}
                  >
                    <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                    <p className="text-sm text-muted-foreground">Expediente: {patient.numeroExpediente}</p>
                  </button>
                ))}
              </div>
            )}
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
              Registrar Movimiento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
