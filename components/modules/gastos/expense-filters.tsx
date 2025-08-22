
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';

interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
}

interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  status?: string;
  paymentMethod?: string;
  search?: string;
}

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  categories: ExpenseCategory[];
  onFilterChange: (filters: ExpenseFilters) => void;
}

export function ExpenseFilters({ filters, categories, onFilterChange }: ExpenseFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Pagado', label: 'Pagado' },
    { value: 'Vencido', label: 'Vencido' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'Todos los métodos' },
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
    { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
    { value: 'Transferencia Bancaria', label: 'Transferencia Bancaria' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'PayPal', label: 'PayPal' },
    { value: 'Otro', label: 'Otro' }
  ];

  const updateFilter = (key: keyof ExpenseFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === null || value === undefined || value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros de Búsqueda
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Búsqueda de texto */}
          <div className="col-span-full md:col-span-2">
            <Label htmlFor="search">Búsqueda</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Buscar por descripción, proveedor o factura..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Fecha de inicio */}
          <div>
            <Label>Fecha desde</Label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => updateFilter('startDate', date)}
              placeholderText="Seleccionar fecha"
              className="mt-1 w-full"
            />
          </div>

          {/* Fecha de fin */}
          <div>
            <Label>Fecha hasta</Label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => updateFilter('endDate', date)}
              placeholderText="Seleccionar fecha"
              className="mt-1 w-full"
            />
          </div>

          {/* Categoría */}
          <div>
            <Label>Categoría</Label>
            <Select 
              value={filters.categoryId || 'all'} 
              onValueChange={(value) => updateFilter('categoryId', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
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
          </div>

          {/* Estado */}
          <div>
            <Label>Estado</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Método de Pago */}
          <div>
            <Label>Método de Pago</Label>
            <Select 
              value={filters.paymentMethod || 'all'} 
              onValueChange={(value) => updateFilter('paymentMethod', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todos los métodos" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Filtros activos:</span>
              
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: "{filters.search}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('search', undefined)}
                  />
                </Badge>
              )}

              {filters.startDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Desde: {filters.startDate.toLocaleDateString()}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('startDate', undefined)}
                  />
                </Badge>
              )}

              {filters.endDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Hasta: {filters.endDate.toLocaleDateString()}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('endDate', undefined)}
                  />
                </Badge>
              )}

              {filters.categoryId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.id === filters.categoryId)?.name || 'Categoría'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('categoryId', undefined)}
                  />
                </Badge>
              )}

              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Estado: {filters.status}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('status', undefined)}
                  />
                </Badge>
              )}

              {filters.paymentMethod && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Método: {filters.paymentMethod}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('paymentMethod', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
