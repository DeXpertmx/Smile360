
'use client';

import { useSession } from 'next-auth/react';
import { MODULES, hasModuleAccess, getAvailableModules, type ModuleConfig } from '@/config/modules';
import { useMemo } from 'react';

export interface UseOrganizationFeaturesReturn {
  features: string[];
  hasFeature: (feature: string) => boolean;
  hasModuleAccess: (moduleId: string) => boolean;
  availableModules: ModuleConfig[];
  isLoading: boolean;
  userRole: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationPlan: string | null;
}

export function useOrganizationFeatures(): UseOrganizationFeaturesReturn {
  const { data: session, status } = useSession();
  
  const features = useMemo(() => {
    // En caso de que no tengamos features en la sesión, usar features por defecto del plan
    if (session?.user?.organizationFeatures) {
      return session.user.organizationFeatures;
    }
    
    // Fallback: features básicas por defecto
    const plan = session?.user?.organizationPlan || 'basic';
    const defaultFeatures: Record<string, string[]> = {
      basic: ['dashboard', 'agenda', 'pacientes', 'expedientes', 'configuracion'],
      pro: ['dashboard', 'agenda', 'pacientes', 'expedientes', 'presupuestos', 'inventario', 'reportes', 'facturacion', 'configuracion'],
      enterprise: Object.values(MODULES).map(m => m.feature)
    };
    
    return defaultFeatures[plan] || defaultFeatures.basic;
  }, [session]);

  const userRole = session?.user?.role || null;
  
  const hasFeature = (feature: string): boolean => {
    return features.includes(feature);
  };

  const hasModuleAccessFn = (moduleId: string): boolean => {
    if (!userRole) return false;
    return hasModuleAccess(moduleId, features, userRole);
  };

  const availableModules = useMemo(() => {
    if (!userRole) return [];
    return getAvailableModules(features, userRole);
  }, [features, userRole]);

  return {
    features,
    hasFeature,
    hasModuleAccess: hasModuleAccessFn,
    availableModules,
    isLoading: status === 'loading',
    userRole,
    organizationId: session?.user?.organizationId || null,
    organizationName: session?.user?.organizationName || null,
    organizationPlan: session?.user?.organizationPlan || null
  };
}

// Hook helper para verificar acceso específico
export function useModuleAccess(moduleId: string) {
  const { hasModuleAccess, isLoading } = useOrganizationFeatures();
  
  return {
    hasAccess: hasModuleAccess(moduleId),
    isLoading
  };
}
