
'use client';

import { ModuleManager } from '@/components/admin/module-manager';
import { ModuleGuard } from '@/components/auth/module-guard';

export default function ModulesConfigPage() {
  return (
    <ModuleGuard moduleId="configuracion">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Módulos</h1>
          <p className="text-gray-600">
            Gestiona los módulos activos de tu sistema según tu plan de suscripción
          </p>
        </div>
        
        <ModuleManager />
      </div>
    </ModuleGuard>
  );
}
