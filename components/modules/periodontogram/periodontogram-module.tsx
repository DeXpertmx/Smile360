
'use client';

import React, { useState } from 'react';
import { 
  Stethoscope,
  User,
  Calendar,
  Save,
  Printer,
  RotateCcw,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PeriodontogramModule() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Periodontograma</h1>
          <p className="text-gray-600">Evaluación periodontal completa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button className="dental-gradient">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Patient Info */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nombre del Paciente</p>
              <p className="font-semibold">Seleccione un paciente</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expediente</p>
              <p className="font-semibold">-</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Evaluación</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Periodontogram Chart */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Periodontograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <Stethoscope className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Periodontograma Interactivo
            </h3>
            <p className="text-gray-500 mb-4">
              El módulo de periodontograma interactivo está en desarrollo
            </p>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-gray-400">
                Próximamente incluirá:
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Registro de profundidad de sondaje</li>
                <li>• Evaluación de sangrado al sondaje</li>
                <li>• Registro de movilidad dental</li>
                <li>• Análisis de placa bacteriana</li>
                <li>• Generación automática de reportes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Leyenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Saludable (1-3mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Gingivitis (4-5mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Periodontitis Leve (6-7mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Periodontitis Severa (+8mm)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Programar Seguimiento
        </Button>
      </div>
    </div>
  );
}
