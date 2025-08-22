
'use client';

import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Building,
  MoreHorizontal,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Expense {
  id: string;
  expenseNumber: string;
  description: string;
  amount: number;
  totalAmount: number;
  taxAmount: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  expenseDate: string;
  vendor?: string;
  paymentMethod: string;
  status: string;
  receiptUrl?: string;
  invoiceNumber?: string;
  notes?: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function ExpenseList({ expenses, loading, onEdit, onDelete, onRefresh }: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Pagado': 'bg-green-100 text-green-800',
      'Vencido': 'bg-red-100 text-red-800',
      'Cancelado': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetails(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando gastos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay gastos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience registrando un nuevo gasto
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Gastos ({expenses.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Gasto</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.expenseNumber}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {expense.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: expense.category.color }}
                        />
                        <span className="text-sm">{expense.category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(expense.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {formatDate(expense.expenseDate)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(expense.status)}
                    </TableCell>
                    <TableCell>
                      {expense.vendor || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {expense.receiptUrl && (
                            <DropdownMenuItem asChild>
                              <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Ver comprobante
                              </a>
                            </DropdownMenuItem>
                          )}
                          <Separator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(expense.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Gasto</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Número de Gasto</h4>
                  <p className="mt-1">{selectedExpense.expenseNumber}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Estado</h4>
                  <div className="mt-1">
                    {getStatusBadge(selectedExpense.status)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600">Descripción</h4>
                <p className="mt-1">{selectedExpense.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Categoría</h4>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: selectedExpense.category.color }}
                    />
                    <span>{selectedExpense.category.name}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Fecha</h4>
                  <p className="mt-1">{formatDate(selectedExpense.expenseDate)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">Información Financiera</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <p className="font-semibold">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Impuestos:</span>
                    <p className="font-semibold">{formatCurrency(selectedExpense.taxAmount)}</p>
                  </div>
                  <div className="col-span-2">
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold">Total:</span>
                      <span className="font-bold text-lg">{formatCurrency(selectedExpense.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Proveedor</h4>
                  <p className="mt-1">{selectedExpense.vendor || 'No especificado'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Método de Pago</h4>
                  <p className="mt-1">{selectedExpense.paymentMethod}</p>
                </div>
              </div>

              {selectedExpense.invoiceNumber && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Número de Factura</h4>
                  <p className="mt-1">{selectedExpense.invoiceNumber}</p>
                </div>
              )}

              {selectedExpense.notes && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Notas</h4>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                    {selectedExpense.notes}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm text-gray-600">Registrado por</h4>
                <p className="mt-1">
                  {selectedExpense.user.firstName} {selectedExpense.user.lastName}
                </p>
              </div>

              {selectedExpense.receiptUrl && (
                <div>
                  <Button asChild className="w-full">
                    <a 
                      href={selectedExpense.receiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Ver Comprobante
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
