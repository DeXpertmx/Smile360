
import { Metadata } from 'next';
import DelinquencyModule from '@/components/modules/delinquency/delinquency-module';

export const metadata: Metadata = {
  title: 'Gestión de Morosidad | SmileSys',
  description: 'Control y seguimiento de pagos vencidos y casos de morosidad',
};

export default function DelinquencyPage() {
  return <DelinquencyModule />;
}
