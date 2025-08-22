
import { AgendaModule } from "@/components/modules/agenda/agenda-module";
import { ModuleGuard } from '@/components/auth/module-guard';

export default async function AgendaPage() {
  return (
    <ModuleGuard moduleId="agenda">
      <AgendaModule />
    </ModuleGuard>
  );
}
