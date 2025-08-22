
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Download,
  Edit,
  Trash2,
  Eye,
  Receipt,
  CreditCard,
  Building,
  Fuel,
  Lightbulb,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseDetail } from './ExpenseDetail';
import { ExpensesStats } from './ExpensesStats';

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
  paymentMethod: string;
  vendor?: string;
  invoiceNumber?: string;
  status: 'paid' | 'pending' | 'overdue';
  notes?: string;
  receiptUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExpensesModuleProps {
  className?: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'equipos', label: 'Equipos Médicos', icon: Stethoscope },
  { value: 'suministros', label: 'Suministros', icon: Receipt },
  { value: 'servicios', label: 'Servicios Públicos', icon: Lightbulb },
  { value: 'alquiler', label: 'Alquiler/Local', icon: Building },
  { value: 'transporte', label: 'Transporte', icon: Fuel },
  { value: 'marketing', label: 'Marketing', icon: TrendingUp },
  { value: 'personal', label: 'Personal', icon: DollarSign },
  { value: 'otros', label: 'Otros', icon: FileText }
];

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
  { value: 'tarjeta_debito', label: 'Tarjeta de Débito' }
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    description: 'Compra de materiales dentales',
    amount: 15000,
    category: 'suministros',
    subcategory: 'materiales_dentales',
    date: '2024-08-10',
    paymentMethod: 'transferencia',
    vendor: 'Dental Supply Co.',
    invoiceNumber: 'DSC-2024-001',
    status: 'paid',
    notes: 'Compra mensual de materiales básicos',
    tags: ['mensual', 'urgente'],
    createdAt: '2024-08-10T10:00:00Z',
    updatedAt: '2024-08-10T10:00:00Z'
  },
  {
    id: 2,
    description: 'Mantenimiento equipo de rayos X',
    amount: 8500,
    category: 'equipos',
    date: '2024-08-08',
    paymentMethod: 'cheque',
    vendor: 'TechMed Services',
    invoiceNumber: 'TMS-2024-045',
    status: 'paid',
    notes: 'Mantenimiento preventivo anual',
    createdAt: '2024-08-08T14:30:00Z',
    updatedAt: '2024-08-08T14:30:00Z'
  },
  {
    id: 3,
    description: 'Factura de electricidad',
    amount: 3200,
    category: 'servicios',
    subcategory: 'electricidad',
    date: '2024-08-05',
    paymentMethod: 'tarjeta_debito',
    vendor: 'Empresa Eléctrica',
    status: 'pending',
    createdAt: '2024-08-05T09:15:00Z',
    updatedAt: '2024-08-05T09:15:00Z'
  }
];

export function ExpensesModule({ className }: ExpensesModuleProps) {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(mockExpenses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    let filtered = [...expenses];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(expense => expense.status === filterStatus);
    }

    // Filter by period
    if (filterPeriod !== 'all') {
      const now = new Date();
      const expenseDate = new Date();
      
      switch (filterPeriod) {
        case 'today':
          expenseDate.setDate(now.getDate());
          break;
        case 'week':
          expenseDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          expenseDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          expenseDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter(expense => 
        new Date(expense.date) >= expenseDate
      );
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, filterCategory, filterStatus, filterPeriod]);

  const handleCreateExpense = (expenseData: any) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Math.max(...expenses.map(e => e.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setExpenses(prev => [newExpense, ...prev]);
    setIsFormOpen(false);
  };

  const handleEditExpense = (expenseData: any) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === selectedExpense?.id 
        ? { ...expense, ...expenseData, updatedAt: new Date().toISOString() }
        : expense
    ));
    setSelectedExpense(null);
    setIsFormOpen(false);
  };

  const handleDeleteExpense = (expenseId: number) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    setSelectedExpense(null);
    setIsDetailOpen(false);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailOpen(true);
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
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

  const getCategoryIcon = (category: string) => {
    const categoryConfig = EXPENSE_CATEGORIES.find(cat => cat.value === category);
    if (categoryConfig) {
      const IconComponent = categoryConfig.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getCategoryLabel = (category: string) => {
    const categoryConfig = EXPENSE_CATEGORIES.find(cat => cat.value === category);
    return categoryConfig?.label || category;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Section */}
      <ExpensesStats expenses={expenses} />

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {EXPENSE_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No se encontraron gastos con los filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        {expense.invoiceNumber && (
                          <div className="text-sm text-gray-500">
                            Factura: {expense.invoiceNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(expense.category)}
                        <span className="text-sm">
                          {getCategoryLabel(expense.category)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(expense.status)}
                    </TableCell>
                    <TableCell>
                      {expense.vendor || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewExpense(expense)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(expense)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expense Form Modal */}
      {isFormOpen && (
        <ExpenseForm
          expense={selectedExpense}
          onSave={selectedExpense ? handleEditExpense : handleCreateExpense}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedExpense(null);
          }}
          categories={EXPENSE_CATEGORIES}
          paymentMethods={PAYMENT_METHODS}
        />
      )}

      {/* Expense Detail Modal */}
      {isDetailOpen && selectedExpense && (
        <ExpenseDetail
          expense={selectedExpense}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedExpense(null);
          }}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsFormOpen(true);
          }}
          onDelete={() => handleDeleteExpense(selectedExpense.id)}
        />
      )}
    </div>
  );
}
