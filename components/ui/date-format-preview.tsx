

'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';

interface DateFormatPreviewProps {
  dateFormat: string;
  className?: string;
}

export function DateFormatPreview({ dateFormat, className = '' }: DateFormatPreviewProps) {
  const today = new Date();
  const sampleDate = new Date(2024, 11, 25); // 25 de diciembre de 2024

  return (
    <div className={`bg-blue-50 p-3 rounded-lg ${className}`}>
      <h4 className="font-semibold text-blue-800 text-sm mb-2">Vista Previa del Formato</h4>
      <div className="space-y-1 text-sm">
        <p className="text-blue-700">
          Hoy: <span className="font-mono font-semibold">{formatDate(today, dateFormat)}</span>
        </p>
        <p className="text-blue-700">
          Ejemplo: <span className="font-mono font-semibold">{formatDate(sampleDate, dateFormat)}</span>
        </p>
        <p className="text-blue-600 text-xs">
          Formato: <span className="font-mono">{dateFormat}</span>
        </p>
      </div>
    </div>
  );
}
