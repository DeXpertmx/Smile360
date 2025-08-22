

'use client';

import { SessionProvider } from 'next-auth/react';
import { TreatmentOrdersModule } from '@/components/treatment-orders/TreatmentOrdersModule';

export default function OrdenesTratamientoPage() {
  return (
    <SessionProvider>
      <TreatmentOrdersModule />
    </SessionProvider>
  );
}
