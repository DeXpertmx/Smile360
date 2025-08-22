
'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrganizationFeatures } from '@/hooks/use-organization-features';
import { MODULES, MODULE_CATEGORIES } from '@/config/modules';
import { toast } from 'react-hot-toast';

export function ModuleManager() {
  const { features, hasFeature, organizationPlan } = useOrganizationFeatures();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleToggleModule = async (moduleFeature: string, enabled: boolean) => {
    setIsUpdating(moduleFeature);
    
    try {
      const response = await fetch('/api/admin/modules/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: moduleFeature,
          enabled
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        // Recargar la página para actualizar la sesión
        window.location.reload();
      } else {
        toast.error(result.error || 'Error al actualizar el módulo');
      }
    } catch (error) {
      toast.error('Error de conexión');
      console.error('Error:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getFeaturesByPlan = (plan: string) => {
    switch (plan) {
      case 'basic':
        return ['dashboard', 'agenda', 'pacientes', 'expedientes', 'configuracion'];
      case 'pro':
        return ['dashboard', 'agenda', 'pacientes', 'expedientes', 'presupuestos', 'inventario', 'reportes', 'facturacion', 'configuracion'];
      case 'enterprise':
        return Object.values(MODULES).map(m => m.feature);
      default:
        return ['dashboard', 'configuracion'];
    }
  };

  const availableFeatures = getFeaturesByPlan(organizationPlan || 'basic');

  // Agrupar módulos por categoría
  const modulesByCategory = Object.values(MODULES).reduce((acc, module) => {
    const category = module.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof MODULES[keyof typeof MODULES][]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Módulos</h2>
          <p className="text-gray-600">
            Activa o desactiva módulos según las necesidades de tu clínica
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Plan {organizationPlan?.toUpperCase() || 'BASIC'}
        </Badge>
      </div>

      {Object.entries(modulesByCategory).map(([category, modules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">
              {MODULE_CATEGORIES[category as keyof typeof MODULE_CATEGORIES] || category}
            </CardTitle>
            <CardDescription>
              Módulos de {MODULE_CATEGORIES[category as keyof typeof MODULE_CATEGORIES]?.toLowerCase() || category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => {
                const isAvailableInPlan = availableFeatures.includes(module.feature);
                const isCurrentlyEnabled = hasFeature(module.feature);
                const isCore = module.isCore;
                const isUpdatingThis = isUpdating === module.feature;

                return (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <module.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {module.name}
                          {isCore && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Core
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{module.description}</p>
                        {module.roles && (
                          <div className="flex gap-1 mt-1">
                            {module.roles.map(role => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isAvailableInPlan && (
                        <Badge variant="destructive" className="text-xs">
                          No disponible en tu plan
                        </Badge>
                      )}
                      
                      <Switch
                        checked={isCurrentlyEnabled}
                        onCheckedChange={(enabled) => handleToggleModule(module.feature, enabled)}
                        disabled={isCore || !isAvailableInPlan || isUpdatingThis}
                      />
                      
                      {isUpdatingThis && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Información del Plan</CardTitle>
          <CardDescription>
            Tu plan actual y sus limitaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Plan Actual:</strong> {organizationPlan?.toUpperCase() || 'BASIC'}</p>
            <p><strong>Módulos Incluidos:</strong> {availableFeatures.length}</p>
            <p><strong>Módulos Activos:</strong> {features.length}</p>
          </div>
          
          {organizationPlan === 'basic' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Actualiza a Pro</strong> para acceder a más módulos como Inventario, Reportes y Facturación.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
