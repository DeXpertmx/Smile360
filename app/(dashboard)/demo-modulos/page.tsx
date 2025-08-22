
'use client';

import { ModuleDemo } from '@/components/demo/module-demo';
import { ModuleGuard } from '@/components/auth/module-guard';

export default function DemoModulosPage() {
  return (
    <ModuleGuard moduleId="dashboard" showMessage={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demo del Sistema Modular</h1>
          <p className="text-gray-600">
            Demostración de cómo funciona el sistema de módulos independientes
          </p>
        </div>
        
        <ModuleDemo />
      </div>
    </ModuleGuard>
  );
}
