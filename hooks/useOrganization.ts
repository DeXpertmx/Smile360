
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  maxUsers: number;
  maxPatients: number;
  features: string[];
  country: string;
  currency: string;
  logo?: string;
}

export function useOrganization() {
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.organizationId) {
      fetchOrganization();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/organization/current');
      const data = await response.json();
      
      if (data.success) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature: string) => {
    return organization?.features.includes(feature) ?? false;
  };

  const isWithinLimits = (type: 'users' | 'patients', currentCount: number) => {
    if (!organization) return false;
    
    if (type === 'users') {
      return organization.maxUsers === -1 || currentCount < organization.maxUsers;
    }
    
    if (type === 'patients') {
      return organization.maxPatients === -1 || currentCount < organization.maxPatients;
    }
    
    return false;
  };

  return {
    organization,
    loading,
    hasFeature,
    isWithinLimits,
    refresh: fetchOrganization
  };
}
