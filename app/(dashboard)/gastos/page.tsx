
'use client';

import { GastosModule } from '@/components/gastos/gastos-module';
import { ModuleGuard } from '@/components/auth/module-guard';

export default function GastosPage() {
  return (
    <ModuleGuard moduleId="gastos">
      <GastosModule />
    </ModuleGuard>
  );
}
