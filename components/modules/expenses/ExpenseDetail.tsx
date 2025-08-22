
'use client';

import React from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  Download, 
  Calendar, 
  DollarSign, 
  User, 
  FileText,
  CreditCard,
  Tag,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Expense } from './ExpensesModule';

interface ExpenseDetailProps {
  expense: Expense;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseDetail({ expense, onClose, onEdit, onDelete }: ExpenseDetailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'cheque': 'Cheque',
      'tarjeta_credito': 'Tarjeta de Crédito',
      'tarjeta_debito': 'Tarjeta de Débito'
    };
    return methods[method] || method;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle del Gasto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with amount and status */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formatCurrency(expense.amount)}
              </h2>
              <p className="text-gray-600">{expense.description}</p>
            </div>
            {getStatusBadge(expense.status)}
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {new Date(expense.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Categoría</p>
                  <p className="font-medium">{expense.category}</p>
                  {expense.subcategory && (
                    <p className="text-sm text-gray-500">{expense.subcategory}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Método de Pago</p>
                  <p className="font-medium">{getPaymentMethodLabel(expense.paymentMethod)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {expense.vendor && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Proveedor</p>
                    <p className="font-medium">{expense.vendor}</p>
                  </div>
                </div>
              )}

              {expense.invoiceNumber && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Número de Factura</p>
                    <p className="font-medium">{expense.invoiceNumber}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Creado</p>
                  <p className="font-medium">
                    {new Date(expense.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {expense.tags && expense.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">Etiquetas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expense.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {expense.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Notas</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{expense.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Receipt */}
          {expense.receiptUrl && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Comprobante</h3>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">Comprobante de pago</p>
                      <p className="text-sm text-gray-500">Archivo adjunto</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" onClick={() => {}}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
            <Button 
              variant="destructive" 
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
