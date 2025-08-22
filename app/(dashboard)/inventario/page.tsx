
import { InventoryModule } from '@/components/inventory/InventoryModule';
import { ModuleGuard } from '@/components/auth/module-guard';

export default function InventarioPage() {
  return (
    <ModuleGuard moduleId="inventario">
      <InventoryModule />
    </ModuleGuard>
  );
}
