
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExpenseFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  categories: any[];
}

export function ExpenseFilters({ filters, onFiltersChange, categories }: ExpenseFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      fechaInicio: '',
      fechaFin: '',
      categoria: '',
      clinica: '',
      busqueda: ''
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="busqueda">Búsqueda</Label>
            <Input
              id="busqueda"
              placeholder="Buscar por descripción o proveedor"
              value={filters.busqueda}
              onChange={(e) => handleFilterChange('busqueda', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={filters.fechaFin}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={filters.categoria} onValueChange={(value) => handleFilterChange('categoria', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Clínica</Label>
            <Select value={filters.clinica} onValueChange={(value) => handleFilterChange('clinica', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las clínicas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las clínicas</SelectItem>
                <SelectItem value="Clínica Principal">Clínica Principal</SelectItem>
                <SelectItem value="Clínica Sucursal">Clínica Sucursal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
