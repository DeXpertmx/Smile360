
'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Download,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Eye,
  Edit2,
  Trash2,
  BarChart3,
  PieChart,
  Receipt,
  Tag,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Subcomponentes
import { ExpenseForm } from './expense-form';
import { ExpenseList } from './expense-list';
import { ExpenseReports } from './expense-reports';
import { CategoriesManager } from './categories-manager';
import { ExpenseFilters } from './expense-filters';

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

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  monthlyBudget?: number;
  yearlyBudget?: number;
}

interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  status?: string;
  paymentMethod?: string;
  search?: string;
}

export function GastosModule() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('lista');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    monthlyExpenses: 0,
    pendingExpenses: 0
  });

  // Verificar permisos
  const canManageExpenses = session?.user?.role === 'ADMIN' || 
                           session?.user?.role === 'DOCTOR';
                           // @ts-ignore - permisos property might not exist in type
                           // || session?.user?.permisos?.includes('GASTOS_ADMINISTRAR');
  
  const canViewReports = session?.user?.role === 'ADMIN' || 
                        session?.user?.role === 'DOCTOR';
                        // @ts-ignore - permisos property might not exist in type
                        // || session?.user?.permisos?.includes('REPORTES_VER');

  useEffect(() => {
    if (canManageExpenses) {
      fetchExpenses();
      fetchCategories();
      fetchStats();
    }
  }, [filters, canManageExpenses]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/expenses?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setExpenses(data.expenses);
      } else {
        toast.error(data.error || 'Error al cargar gastos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expenses/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      } else {
        toast.error(data.error || 'Error al cargar categorías');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/expenses/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExpenseCreated = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    setShowExpenseForm(false);
    toast.success('Gasto registrado exitosamente');
    fetchStats();
  };

  const handleExpenseUpdated = (expense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    setEditingExpense(null);
    toast.success('Gasto actualizado exitosamente');
    fetchStats();
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este gasto?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        toast.success('Gasto eliminado exitosamente');
        fetchStats();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar gasto');
    }
  };

  const handleFilterChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
  };

  if (!canManageExpenses) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No tiene permisos para acceder al módulo de gastos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Gastos</h1>
          <p className="text-muted-foreground">
            Administre los gastos de la clínica de manera eficiente
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowExpenseForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">Gastos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Suma de todos los gastos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Gastos del mes actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingExpenses}</div>
            <p className="text-xs text-muted-foreground">Gastos por aprobar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="lista" className="text-xs sm:text-sm">
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Lista</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="categorias" className="text-xs sm:text-sm">
            <Tag className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Categorías</span>
            <span className="sm:hidden">Cat.</span>
          </TabsTrigger>
          <TabsTrigger value="reportes" className="text-xs sm:text-sm" disabled={!canViewReports}>
            <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Reportes</span>
            <span className="sm:hidden">Rep.</span>
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="text-xs sm:text-sm">
            <Building className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Config</span>
            <span className="sm:hidden">Conf.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <ExpenseFilters
            filters={filters}
            categories={categories}
            onFilterChange={handleFilterChange}
          />
          <ExpenseList
            expenses={expenses}
            loading={loading}
            onEdit={setEditingExpense}
            onDelete={handleDeleteExpense}
            onRefresh={fetchExpenses}
          />
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <CategoriesManager
            categories={categories}
            onCategoriesChange={fetchCategories}
          />
        </TabsContent>

        {canViewReports && (
          <TabsContent value="reportes" className="space-y-4">
            <ExpenseReports
              expenses={expenses}
              categories={categories}
            />
          </TabsContent>
        )}

        <TabsContent value="configuracion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Próximamente: Configuraciones avanzadas del módulo de gastos
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formulario de Gasto */}
      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            categories={categories}
            onSubmit={handleExpenseCreated}
            onCancel={() => setShowExpenseForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Formulario de Edición */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              expense={editingExpense}
              categories={categories}
              onSubmit={handleExpenseUpdated}
              onCancel={() => setEditingExpense(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
