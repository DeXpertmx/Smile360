
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  monthlyBudget?: number;
  yearlyBudget?: number;
  createdAt: string;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    icono: 'tag'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/expenses/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCategory 
        ? `/api/expenses/categories/${editingCategory.id}`
        : '/api/expenses/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: editingCategory 
            ? 'Categoría actualizada correctamente'
            : 'Categoría creada correctamente'
        });
        
        setFormData({
          nombre: '',
          descripcion: '',
          color: '#3B82F6',
          icono: 'tag'
        });
        setEditingCategory(null);
        setShowForm(false);
        loadCategories();
      } else {
        throw new Error('Error al guardar la categoría');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la categoría. Intente nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.name,
      descripcion: category.description || '',
      color: category.color || '#3B82F6',
      icono: category.icon || 'tag'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Categoría eliminada correctamente'
        });
        loadCategories();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la categoría',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#3B82F6',
      icono: 'tag'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const defaultCategories = [
    { nombre: 'Material Dental', descripcion: 'Materiales y suministros dentales', color: '#3B82F6' },
    { nombre: 'Equipos', descripcion: 'Compra y mantenimiento de equipos', color: '#10B981' },
    { nombre: 'Servicios', descripcion: 'Servicios profesionales y técnicos', color: '#F59E0B' },
    { nombre: 'Marketing', descripcion: 'Publicidad y marketing', color: '#EF4444' },
    { nombre: 'Administrativo', descripcion: 'Gastos administrativos', color: '#8B5CF6' },
    { nombre: 'Formación', descripcion: 'Cursos y capacitación', color: '#06B6D4' }
  ];

  const createDefaultCategories = async () => {
    try {
      for (const category of defaultCategories) {
        await fetch('/api/expenses/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(category)
        });
      }
      
      toast({
        title: 'Éxito',
        description: 'Categorías predeterminadas creadas correctamente'
      });
      
      loadCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron crear las categorías predeterminadas',
        variant: 'destructive'
      });
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Categorías</CardTitle>
              <CardDescription>
                Administra las categorías de gastos de tu clínica
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {categories.length === 0 && (
                <Button variant="outline" onClick={createDefaultCategories}>
                  Crear Categorías Predeterminadas
                </Button>
              )}
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre de la categoría"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Descripción de la categoría"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="color"
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-20 h-10"
                        />
                        <div 
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: formData.color }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600 mb-4">
                Comienza creando categorías para organizar tus gastos
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category: any) => (
                <Card key={category.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        style={{ backgroundColor: category.color || '#3B82F6', color: 'white' }}
                      >
                        {category.name}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente
                                la categoría "{category.name}". Los gastos asociados mantendrán
                                esta categoría pero no se podrá usar para nuevos gastos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Gastos: {category._count?.expenses || 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
