
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrganizationFeatures } from '@/hooks/use-organization-features';
import { MODULES } from '@/config/modules';
import { CheckCircle, XCircle, Shield, Users, Calendar } from 'lucide-react';

export function ModuleDemo() {
  const { 
    features, 
    hasFeature, 
    availableModules, 
    userRole, 
    organizationName, 
    organizationPlan,
    isLoading 
  } = useOrganizationFeatures();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Información de Usuario
          </CardTitle>
          <CardDescription>
            Detalles de tu sesión y organización actual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700">Organización:</p>
              <p className="text-gray-600">{organizationName || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Rol:</p>
              <Badge variant="outline">{userRole}</Badge>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Plan:</p>
              <Badge variant="secondary" className="capitalize">
                {organizationPlan || 'basic'}
              </Badge>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Módulos Activos:</p>
              <p className="text-gray-600">{features.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Features de la Organización
          </CardTitle>
          <CardDescription>
            Features habilitadas para tu organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <Badge key={feature} variant="secondary">
                {feature}
              </Badge>
            ))}
          </div>
          {features.length === 0 && (
            <p className="text-gray-500 italic">No hay features habilitadas</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Módulos Disponibles
          </CardTitle>
          <CardDescription>
            Módulos a los que tienes acceso según tu rol y plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {availableModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{module.name}</p>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {module.isCore && (
                      <Badge variant="outline" className="text-xs">
                        Core
                      </Badge>
                    )}
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test de Acceso a Módulos</CardTitle>
          <CardDescription>
            Verifica el acceso a módulos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(MODULES).map(([moduleId, module]) => {
              const hasAccess = hasFeature(module.feature) && 
                                (!module.roles || module.roles.includes(userRole || ''));
              
              return (
                <div key={moduleId} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <module.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasAccess ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {hasAccess ? 'Permitido' : 'Denegado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
