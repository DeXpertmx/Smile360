
import { Metadata } from 'next';
import { GastosModule } from '@/components/modules/gastos';

export const metadata: Metadata = {
  title: 'Gastos | SmileSys',
  description: 'Gestión de gastos de la clínica dental'
};

export default function GastosPage() {
  return <GastosModule />;
}
