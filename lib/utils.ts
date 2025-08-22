
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuración global de formatos (se puede sobrescribir con configuración del sistema)
let globalDateFormat = 'dd/MM/yyyy';
let globalTimeFormat = '24h';
let globalLocale = 'es-ES';

// Función para establecer la configuración global de formatos
export function setGlobalDateFormat(dateFormat: string, timeFormat: string, locale: string = 'es-ES') {
  globalDateFormat = dateFormat;
  globalTimeFormat = timeFormat;
  globalLocale = locale;
}

// Funciones de utilidad mejoradas con configuración del sistema
export function formatDate(date: Date | string, customFormat?: string): string {
  const d = new Date(date);
  const format = customFormat || globalDateFormat;
  
  // Convertir formato personalizado a opciones de Intl
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  if (format === 'MM/dd/yyyy') {
    return d.toLocaleDateString('en-US', options);
  } else if (format === 'yyyy-MM-dd') {
    return d.toLocaleDateString('sv-SE', options);
  } else {
    // Default: dd/MM/yyyy
    return d.toLocaleDateString('es-ES', options);
  }
}

export function formatDateTime(date: Date | string, customDateFormat?: string, customTimeFormat?: string): string {
  const d = new Date(date);
  const dateFormat = customDateFormat || globalDateFormat;
  const timeFormat = customTimeFormat || globalTimeFormat;
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h'
  };
  
  let locale = globalLocale;
  let formattedDate = '';
  
  if (dateFormat === 'MM/dd/yyyy') {
    locale = 'en-US';
  } else if (dateFormat === 'yyyy-MM-dd') {
    locale = 'sv-SE';
  }
  
  formattedDate = d.toLocaleDateString(locale, dateOptions);
  const formattedTime = d.toLocaleTimeString(locale, timeOptions);
  
  return `${formattedDate} ${formattedTime}`;
}

export function formatTime(time: string, customFormat?: string): string {
  const format = customFormat || globalTimeFormat;
  
  if (format === '12h' && time.includes(':')) {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }
  
  return time.slice(0, 5); // Formato HH:MM (24h)
}

// Nueva función para formatear fecha para input type="date"
export function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Nueva función para formatear fecha desde input type="date" al formato del sistema
export function formatDateFromInput(dateString: string, customFormat?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return formatDate(date, customFormat);
}

// Nueva función para formatear moneda
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

// Función para formatear moneda con configuración específica
export function formatCurrencyWithSettings(amount: number, settings?: { currency?: string; locale?: string }): string {
  const currency = settings?.currency || 'USD';
  const locale = settings?.locale || 'en-US';
  return formatCurrency(amount, currency, locale);
}

// Función para generar colores consistentes
export function generateColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const colors = [
    'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'red', 'orange'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

// Función para calcular porcentajes
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

// Función para truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Función para formatear números
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}
