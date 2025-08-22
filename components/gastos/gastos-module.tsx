
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseList } from './expense-list';
import { ExpenseForm } from './expense-form';
import { ExpenseReports } from './expense-reports';
import { CategoriesManager } from './categories-manager';
import { Plus, List, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GastosModule() {
  const [activeTab, setActiveTab] = useState('lista');
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Gestión de Gastos
          </CardTitle>
          <CardDescription>
            Administra y controla todos los gastos de la clínica dental
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="lista" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Lista</span>
                </TabsTrigger>
                <TabsTrigger value="nuevo" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo</span>
                </TabsTrigger>
                <TabsTrigger value="reportes" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Reportes</span>
                </TabsTrigger>
                <TabsTrigger value="categorias" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Categorías</span>
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'lista' && (
                <Button onClick={() => setActiveTab('nuevo')} className="ml-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              )}
            </div>

            <TabsContent value="lista" className="space-y-6">
              <ExpenseList />
            </TabsContent>

            <TabsContent value="nuevo" className="space-y-6">
              <ExpenseForm
                onSuccess={() => {
                  setActiveTab('lista');
                }}
              />
            </TabsContent>

            <TabsContent value="reportes" className="space-y-6">
              <ExpenseReports />
            </TabsContent>

            <TabsContent value="categorias" className="space-y-6">
              <CategoriesManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
