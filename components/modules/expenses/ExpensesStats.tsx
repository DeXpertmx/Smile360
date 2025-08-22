
'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense } from './ExpensesModule';

interface ExpensesStatsProps {
  expenses: Expense[];
}

export function ExpensesStats({ expenses }: ExpensesStatsProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Calculate current month expenses
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear;
  });

  // Calculate last month expenses
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === lastMonth && 
           expenseDate.getFullYear() === lastMonthYear;
  });

  // Calculate totals
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate percentage change
  const percentageChange = lastMonthTotal === 0 
    ? 100 
    : ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

  // Total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Pending payments
  const pendingExpenses = expenses.filter(expense => expense.status === 'pending');
  const pendingTotal = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Overdue payments
  const overdueExpenses = expenses.filter(expense => expense.status === 'overdue');
  const overdueTotal = overdueExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Gastos Este Mes
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentMonthTotal)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {percentageChange >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
            )}
            <span className={percentageChange >= 0 ? "text-red-500" : "text-green-500"}>
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
            <span className="ml-1">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      {/* Total All Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total General
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            {expenses.length} gastos registrados
          </p>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pagos Pendientes
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pendingTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {pendingExpenses.length} facturas pendientes
          </p>
        </CardContent>
      </Card>

      {/* Overdue Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pagos Vencidos
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueTotal)}</div>
          <p className="text-xs text-red-600">
            {overdueExpenses.length} facturas vencidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
