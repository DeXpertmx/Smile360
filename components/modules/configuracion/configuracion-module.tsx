
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Building, DollarSign, Clock, Globe, Calendar, MessageCircle } from 'lucide-react';
import { toast } from "react-hot-toast";
import { CalComIntegration } from "@/components/modules/agenda/calcom-integration";
import { DateFormatPreview } from "@/components/ui/date-format-preview";
import { WhatsAppConfig } from "@/components/whatsapp/WhatsAppConfig";

interface Configuration {
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  timezone: string;
  language: string;
}

export function ConfiguracionModule() {
  const [config, setConfig] = useState<Configuration>({
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    clinicName: 'Smile 360 Dental Clinic',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    timezone: 'Europe/Madrid',
    language: 'es',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/configuration');
      if (response.ok) {
        const data = await response.json();
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success('Configuración guardada correctamente');
        // Refresh the page to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof Configuration, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Configuración del Sistema</h1>
          <p className="text-gray-600">Personaliza la configuración de Smile 360</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="moneda">Moneda</TabsTrigger>
          <TabsTrigger value="fecha">Fecha y Hora</TabsTrigger>
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select 
                    value={config.language} 
                    onValueChange={(value) => updateConfig('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ca">Català</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select 
                    value={config.timezone} 
                    onValueChange={(value) => updateConfig('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="Europe/Barcelona">Barcelona (GMT+1)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moneda">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Configuración de Moneda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select 
                    value={config.currency} 
                    onValueChange={(value) => updateConfig('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                      <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                      <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                      <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currencySymbol">Símbolo de Moneda</Label>
                  <Input
                    id="currencySymbol"
                    value={config.currencySymbol}
                    onChange={(e) => updateConfig('currencySymbol', e.target.value)}
                    placeholder="€"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Vista Previa</h4>
                <p className="text-blue-700">
                  Ejemplo de precio: <span className="font-bold">{config.currencySymbol}1,250.00</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fecha">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Formato de Fecha y Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFormat">Formato de Fecha</Label>
                  <Select 
                    value={config.dateFormat} 
                    onValueChange={(value) => updateConfig('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeFormat">Formato de Hora</Label>
                  <Select 
                    value={config.timeFormat} 
                    onValueChange={(value) => updateConfig('timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas (14:30)</SelectItem>
                      <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DateFormatPreview dateFormat={config.dateFormat} />
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Vista Previa de Hora</h4>
                <p className="text-green-700">
                  Hora actual: <span className="font-mono font-bold">
                    {config.timeFormat === '24h' 
                      ? new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit' })
                      : new Date().toLocaleTimeString('es-ES', { hour12: true, hour: '2-digit', minute: '2-digit' })
                    }
                  </span>
                </p>
                <p className="text-green-600 text-xs">
                  Formato: <span className="font-mono">{config.timeFormat === '24h' ? '24 horas (HH:mm)' : '12 horas (hh:mm AM/PM)'}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinica">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Información de la Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clinicName">Nombre de la Clínica</Label>
                <Input
                  id="clinicName"
                  value={config.clinicName}
                  onChange={(e) => updateConfig('clinicName', e.target.value)}
                  placeholder="Smile 360 Dental Clinic"
                />
              </div>

              <div>
                <Label htmlFor="clinicAddress">Dirección</Label>
                <Input
                  id="clinicAddress"
                  value={config.clinicAddress}
                  onChange={(e) => updateConfig('clinicAddress', e.target.value)}
                  placeholder="Calle Principal 123, Ciudad"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicPhone">Teléfono</Label>
                  <Input
                    id="clinicPhone"
                    value={config.clinicPhone}
                    onChange={(e) => updateConfig('clinicPhone', e.target.value)}
                    placeholder="+34 xxx xxx xxx"
                  />
                </div>

                <div>
                  <Label htmlFor="clinicEmail">Email</Label>
                  <Input
                    id="clinicEmail"
                    type="email"
                    value={config.clinicEmail}
                    onChange={(e) => updateConfig('clinicEmail', e.target.value)}
                    placeholder="contacto@smilesys.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Integración de Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalComIntegration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Integración con WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WhatsAppConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
        </Button>
      </div>
    </div>
  );
}
