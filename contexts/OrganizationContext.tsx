
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useOrganization } from '@/hooks/useOrganization';

interface OrganizationContextType {
  organization: any;
  loading: boolean;
  hasFeature: (feature: string) => boolean;
  isWithinLimits: (type: 'users' | 'patients', currentCount: number) => boolean;
  refresh: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const organizationData = useOrganization();

  return (
    <OrganizationContext.Provider value={organizationData}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext debe usarse dentro de OrganizationProvider');
  }
  return context;
}
