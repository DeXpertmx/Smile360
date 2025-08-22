

'use client';

import { useState, useEffect } from 'react';
import { setGlobalDateFormat } from '@/lib/utils';

interface SystemConfig {
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>({
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    currency: 'EUR',
    currencySymbol: '€',
    timezone: 'Europe/Madrid',
    language: 'es',
    clinicName: 'Smile 360',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/configuration');
        
        if (response.ok) {
          const data = await response.json();
          
          // Merge with defaults
          const mergedConfig = {
            ...config,
            ...data
          };
          
          setConfig(mergedConfig);
          
          // Set global date format for utility functions
          setGlobalDateFormat(
            mergedConfig.dateFormat || 'dd/MM/yyyy',
            mergedConfig.timeFormat || '24h',
            mergedConfig.language === 'en' ? 'en-US' : 'es-ES'
          );
        }
      } catch (err) {
        console.error('Error loading system configuration:', err);
        setError('Error al cargar configuración del sistema');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
}
