
'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const expenseSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  expenseDate: z.date(),
  vendor: z.string().optional(),
  paymentMethod: z.string().min(1, 'El método de pago es requerido'),
  invoiceNumber: z.string().optional(),
  receiptNumber: z.string().optional(),
  taxAmount: z.number().min(0).default(0),
  taxDeductible: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringType: z.string().optional(),
  status: z.string().default('Pendiente'),
  notes: z.string().optional(),
  tags: z.string().optional(),
  requiresApproval: z.boolean().default(false)
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: any;
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onSubmit: (expense: any) => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, categories, onSubmit, onCancel }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(expense?.receiptUrl || null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      description: expense.description,
      amount: parseFloat(expense.amount),
      categoryId: expense.categoryId,
      expenseDate: new Date(expense.expenseDate),
      vendor: expense.vendor || '',
      paymentMethod: expense.paymentMethod,
      invoiceNumber: expense.invoiceNumber || '',
      receiptNumber: expense.receiptNumber || '',
      taxAmount: parseFloat(expense.taxAmount || 0),
      taxDeductible: expense.taxDeductible || false,
      isRecurring: expense.isRecurring || false,
      recurringType: expense.recurringType || '',
      status: expense.status || 'Pendiente',
      notes: expense.notes || '',
      tags: expense.tags || '',
      requiresApproval: expense.requiresApproval || false
    } : {
      description: '',
      amount: 0,
      categoryId: '',
      expenseDate: new Date(),
      vendor: '',
      paymentMethod: 'Efectivo',
      invoiceNumber: '',
      receiptNumber: '',
      taxAmount: 0,
      taxDeductible: false,
      isRecurring: false,
      recurringType: '',
      status: 'Pendiente',
      notes: '',
      tags: '',
      requiresApproval: false
    }
  });

  const watchAmount = watch('amount');
  const watchTaxAmount = watch('taxAmount');
  const watchIsRecurring = watch('isRecurring');
  const watchRequiresApproval = watch('requiresApproval');

  const paymentMethods = [
    'Efectivo',
    'Tarjeta de Débito',
    'Tarjeta de Crédito',
    'Transferencia Bancaria',
    'Cheque',
    'PayPal',
    'Otro'
  ];

  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Pagado', label: 'Pagado' },
    { value: 'Vencido', label: 'Vencido' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  const recurringOptions = [
    'Semanal',
    'Mensual',
    'Trimestral',
    'Semestral',
    'Anual'
  ];

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'expense-receipt');

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        throw new Error('Error al subir archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir el comprobante');
      return null;
    }
  };

  const onSubmitForm = async (data: ExpenseFormData) => {
    setLoading(true);
    
    try {
      let uploadedReceiptUrl = receiptUrl;

      // Subir archivo si hay uno nuevo
      if (receiptFile) {
        uploadedReceiptUrl = await handleFileUpload(receiptFile);
      }

      const totalAmount = data.amount + (data.taxAmount || 0);

      const expenseData = {
        ...data,
        totalAmount,
        receiptUrl: uploadedReceiptUrl,
        expenseDate: data.expenseDate.toISOString()
      };

      const endpoint = expense ? `/api/expenses/${expense.id}` : '/api/expenses';
      const method = expense ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      const result = await response.json();

      if (response.ok) {
        onSubmit(result.expense);
        reset();
      } else {
        toast.error(result.error || 'Error al guardar gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('El archivo no puede superar los 5MB');
        return;
      }
      setReceiptFile(file);
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    setReceiptUrl(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada del gasto..."
                className="mt-1"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="taxAmount">Impuestos</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  step="0.01"
                  {...register('taxAmount', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
            </div>

            {(watchAmount > 0 || watchTaxAmount > 0) && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">
                  <div>Subtotal: ${watchAmount?.toFixed(2) || '0.00'}</div>
                  <div>Impuestos: ${watchTaxAmount?.toFixed(2) || '0.00'}</div>
                  <Separator className="my-2" />
                  <div className="font-semibold">
                    Total: ${((watchAmount || 0) + (watchTaxAmount || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="categoryId">Categoría *</Label>
              <Select onValueChange={(value) => setValue('categoryId', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expenseDate">Fecha del Gasto *</Label>
              <DatePicker
                selected={watch('expenseDate')}
                onChange={(date) => setValue('expenseDate', date || new Date())}
                className="mt-1 w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información del Proveedor y Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proveedor y Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vendor">Proveedor/Vendedor</Label>
              <Input
                id="vendor"
                {...register('vendor')}
                placeholder="Nombre del proveedor"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Método de Pago *</Label>
              <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">N° Factura</Label>
                <Input
                  id="invoiceNumber"
                  {...register('invoiceNumber')}
                  placeholder="Número de factura"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="receiptNumber">N° Recibo</Label>
                <Input
                  id="receiptNumber"
                  {...register('receiptNumber')}
                  placeholder="Número de recibo"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comprobante */}
            <div>
              <Label>Comprobante</Label>
              <div className="mt-2 space-y-2">
                {!receiptFile && !receiptUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">
                        Subir comprobante
                      </span>
                      <input
                        id="receipt-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-1">
                      PNG, JPG, PDF hasta 5MB
                    </p>
                  </div>
                )}

                {(receiptFile || receiptUrl) && (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm">
                        {receiptFile ? receiptFile.name : 'Comprobante existente'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opciones Adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opciones Adicionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxDeductible">Deducible de impuestos</Label>
                <Switch
                  id="taxDeductible"
                  checked={watch('taxDeductible')}
                  onCheckedChange={(checked) => setValue('taxDeductible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isRecurring">Gasto recurrente</Label>
                <Switch
                  id="isRecurring"
                  checked={watch('isRecurring')}
                  onCheckedChange={(checked) => setValue('isRecurring', checked)}
                />
              </div>

              {watchIsRecurring && (
                <div>
                  <Label htmlFor="recurringType">Frecuencia</Label>
                  <Select onValueChange={(value) => setValue('recurringType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurringOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="requiresApproval">Requiere aprobación</Label>
                <Switch
                  id="requiresApproval"
                  checked={watch('requiresApproval')}
                  onCheckedChange={(checked) => setValue('requiresApproval', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="tags">Etiquetas</Label>
                <Input
                  id="tags"
                  {...register('tags')}
                  placeholder="etiqueta1, etiqueta2, etiqueta3"
                  className="mt-1"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Separar con comas
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Notas adicionales..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : expense ? 'Actualizar' : 'Crear'} Gasto
        </Button>
      </div>
    </form>
  );
}
