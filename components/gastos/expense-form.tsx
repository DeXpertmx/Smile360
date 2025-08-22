
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
  onSuccess: () => void;
  expense?: any;
}

export function ExpenseForm({ onSuccess, expense }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    fecha: expense?.expenseDate ? new Date(expense.expenseDate) : new Date(),
    monto: expense?.amount || '',
    categoriaId: expense?.categoryId || '',
    descripcion: expense?.description || '',
    metodoPago: expense?.paymentMethod || '',
    clinica: expense?.clinic || 'Clínica Principal',
    proveedor: expense?.vendor || '',
    numeroFactura: expense?.invoiceNumber || '',
    observaciones: expense?.notes || ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState<File[]>([]);
  const { toast } = useToast();

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
    { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'cheque', label: 'Cheque' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/expenses/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar los datos del formulario
      const expenseData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'fecha' && value instanceof Date) {
          expenseData.append(key, value.toISOString());
        } else {
          expenseData.append(key, value.toString());
        }
      });

      // Agregar archivos de comprobantes
      receipts.forEach((file, index) => {
        expenseData.append(`receipt_${index}`, file);
      });

      const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses';
      const method = expense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: expenseData
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: expense ? 'Gasto actualizado correctamente' : 'Gasto registrado correctamente'
        });
        onSuccess();
      } else {
        throw new Error('Error al guardar el gasto');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el gasto. Intente nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReceipts(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setReceipts(receipts.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense ? 'Editar Gasto' : 'Nuevo Gasto'}</CardTitle>
        <CardDescription>
          {expense ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto de la clínica'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha del Gasto</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.fecha && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.fecha ? (
                      format(formData.fecha, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.fecha}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, fecha: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.monto}
                onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                required
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select 
                value={formData.categoriaId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoriaId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select 
                value={formData.metodoPago} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, metodoPago: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Proveedor */}
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                placeholder="Nombre del proveedor"
                value={formData.proveedor}
                onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
              />
            </div>

            {/* Número de Factura */}
            <div className="space-y-2">
              <Label htmlFor="numeroFactura">Número de Factura</Label>
              <Input
                id="numeroFactura"
                placeholder="Número de factura"
                value={formData.numeroFactura}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroFactura: e.target.value }))}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción del gasto"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              required
              rows={3}
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Observaciones adicionales (opcional)"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Comprobantes */}
          <div className="space-y-2">
            <Label htmlFor="receipts">Comprobantes</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="receipts" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Subir comprobantes
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PDF, PNG, JPG hasta 10MB
                    </span>
                  </label>
                  <input
                    id="receipts"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
            
            {receipts.length > 0 && (
              <div className="space-y-2">
                {receipts.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (expense ? 'Actualizar' : 'Guardar')} Gasto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
