
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Globe,
  Calendar,
  DollarSign,
  Bell,
  Shield,
  Settings2,
  Save,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClinicSettings {
  id?: string;
  // Información general
  clinicName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  
  // Configuración regional
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  
  // Configuración de citas
  workingHours?: string;
  appointmentDuration: number;
  appointmentBuffer: number;
  maxAdvanceBooking: number;
  appointmentReminders?: string;
  
  // Configuración fiscal
  taxRate: number;
  taxId?: string;
  invoicePrefix: string;
  invoiceFooter?: string;
  paymentTerms: string;
  
  // Notificaciones
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  smtpServer?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  
  // Seguridad
  sessionTimeout: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  
  // Sistema
  defaultPatientStatus: string;
  autoBackup: boolean;
  backupFrequency: string;
}

const currencies = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
];

const timezones = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/Sao_Paulo'
];

const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' }
];

const defaultWorkingHours = {
  monday: { enabled: true, start: '08:00', end: '17:00', break: { start: '12:00', end: '13:00' } },
  tuesday: { enabled: true, start: '08:00', end: '17:00', break: { start: '12:00', end: '13:00' } },
  wednesday: { enabled: true, start: '08:00', end: '17:00', break: { start: '12:00', end: '13:00' } },
  thursday: { enabled: true, start: '08:00', end: '17:00', break: { start: '12:00', end: '13:00' } },
  friday: { enabled: true, start: '08:00', end: '17:00', break: { start: '12:00', end: '13:00' } },
  saturday: { enabled: true, start: '08:00', end: '14:00', break: null },
  sunday: { enabled: false, start: '08:00', end: '17:00', break: null }
};

export function SettingsModule() {
  const [settings, setSettings] = useState<ClinicSettings>({
    clinicName: "Smile 360 Dental Clinic",
    currency: "USD",
    timezone: "America/New_York", 
    language: "es",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24",
    appointmentDuration: 30,
    appointmentBuffer: 15,
    maxAdvanceBooking: 90,
    taxRate: 0,
    invoicePrefix: "INV",
    paymentTerms: "Inmediato",
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    sessionTimeout: 60,
    passwordMinLength: 8,
    requireTwoFactor: false,
    defaultPatientStatus: "Activo",
    autoBackup: true,
    backupFrequency: "diario"
  });
  
  const [workingHours, setWorkingHours] = useState(defaultWorkingHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        
        // Parsear horarios de trabajo si existen
        if (data.workingHours) {
          try {
            const parsedHours = JSON.parse(data.workingHours);
            setWorkingHours(parsedHours);
          } catch (e) {
            console.warn('Error parsing working hours:', e);
          }
        }
      } else {
        throw new Error('Error al cargar configuraciones');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...settings,
        workingHours: JSON.stringify(workingHours)
      };
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        toast({
          title: "Configuración guardada",
          description: "Las configuraciones se han actualizado exitosamente"
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar configuraciones');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-gray-500 mt-1">
            Personaliza Smile 360 según las necesidades de tu clínica
          </p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Regional
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Citas
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Facturación
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información de la Clínica
              </CardTitle>
              <CardDescription>
                Información básica que aparecerá en facturas y documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicName">Nombre de la Clínica *</Label>
                  <Input
                    id="clinicName"
                    value={settings.clinicName}
                    onChange={(e) => setSettings({...settings, clinicName: e.target.value})}
                    placeholder="Nombre de tu clínica dental"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    placeholder="contacto@clinica.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={settings.website || ''}
                    onChange={(e) => setSettings({...settings, website: e.target.value})}
                    placeholder="https://www.clinica.com"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={settings.address || ''}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      placeholder="Calle Principal 123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={settings.city || ''}
                      onChange={(e) => setSettings({...settings, city: e.target.value})}
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado/Provincia</Label>
                    <Input
                      id="state"
                      value={settings.state || ''}
                      onChange={(e) => setSettings({...settings, state: e.target.value})}
                      placeholder="Estado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                      id="zipCode"
                      value={settings.zipCode || ''}
                      onChange={(e) => setSettings({...settings, zipCode: e.target.value})}
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={settings.country || ''}
                      onChange={(e) => setSettings({...settings, country: e.target.value})}
                      placeholder="País"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración Regional */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Configuración Regional
              </CardTitle>
              <CardDescription>
                Configuración de idioma, moneda y formato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{currency.symbol}</span>
                            <span>{currency.name} ({currency.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Formato de Fecha</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeFormat">Formato de Hora</Label>
                  <Select value={settings.timeFormat} onValueChange={(value) => setSettings({...settings, timeFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 horas (15:30)</SelectItem>
                      <SelectItem value="12">12 horas (3:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Citas */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Configuración de Citas
              </CardTitle>
              <CardDescription>
                Configuración de horarios y parámetros de las citas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="appointmentDuration">Duración por Defecto (minutos)</Label>
                  <Input
                    id="appointmentDuration"
                    type="number"
                    min="15"
                    max="240"
                    value={settings.appointmentDuration}
                    onChange={(e) => setSettings({...settings, appointmentDuration: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentBuffer">Tiempo entre Citas (minutos)</Label>
                  <Input
                    id="appointmentBuffer"
                    type="number"
                    min="0"
                    max="60"
                    value={settings.appointmentBuffer}
                    onChange={(e) => setSettings({...settings, appointmentBuffer: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxAdvanceBooking">Días Máximos para Agendar</Label>
                  <Input
                    id="maxAdvanceBooking"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.maxAdvanceBooking}
                    onChange={(e) => setSettings({...settings, maxAdvanceBooking: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horarios de Trabajo
                </h3>
                <div className="space-y-3">
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24">
                        <Switch
                          checked={hours.enabled}
                          onCheckedChange={(checked) => updateWorkingHours(day, 'enabled', checked)}
                        />
                        <Label className="ml-2 capitalize">
                          {day === 'monday' && 'Lunes'}
                          {day === 'tuesday' && 'Martes'}
                          {day === 'wednesday' && 'Miércoles'}
                          {day === 'thursday' && 'Jueves'}
                          {day === 'friday' && 'Viernes'}
                          {day === 'saturday' && 'Sábado'}
                          {day === 'sunday' && 'Domingo'}
                        </Label>
                      </div>
                      {hours.enabled && (
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">De:</Label>
                            <Input
                              type="time"
                              value={hours.start}
                              onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                              className="w-24"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">A:</Label>
                            <Input
                              type="time"
                              value={hours.end}
                              onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                              className="w-24"
                            />
                          </div>
                          {hours.break && (
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Descanso:</Label>
                              <Input
                                type="time"
                                value={hours.break.start}
                                onChange={(e) => updateWorkingHours(day, 'break', {
                                  ...hours.break!,
                                  start: e.target.value
                                })}
                                className="w-24"
                              />
                              <span>-</span>
                              <Input
                                type="time"
                                value={hours.break.end}
                                onChange={(e) => updateWorkingHours(day, 'break', {
                                  ...hours.break!,
                                  end: e.target.value
                                })}
                                className="w-24"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Facturación */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Configuración Fiscal y Facturación
              </CardTitle>
              <CardDescription>
                Configuración de impuestos, facturación y términos de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">ID Fiscal (RFC/NIT)</Label>
                  <Input
                    id="taxId"
                    value={settings.taxId || ''}
                    onChange={(e) => setSettings({...settings, taxId: e.target.value})}
                    placeholder="RFC123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="invoicePrefix">Prefijo de Facturas</Label>
                  <Input
                    id="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})}
                    placeholder="INV"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Términos de Pago</Label>
                  <Select value={settings.paymentTerms} onValueChange={(value) => setSettings({...settings, paymentTerms: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inmediato">Pago Inmediato</SelectItem>
                      <SelectItem value="15_dias">15 días</SelectItem>
                      <SelectItem value="30_dias">30 días</SelectItem>
                      <SelectItem value="45_dias">45 días</SelectItem>
                      <SelectItem value="60_dias">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="invoiceFooter">Pie de Página de Facturas</Label>
                <Textarea
                  id="invoiceFooter"
                  value={settings.invoiceFooter || ''}
                  onChange={(e) => setSettings({...settings, invoiceFooter: e.target.value})}
                  placeholder="Gracias por confiar en nosotros para su salud dental..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Configuración de recordatorios y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Notificaciones por Email</h3>
                    <p className="text-sm text-gray-500">Enviar recordatorios y notificaciones por correo</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Notificaciones SMS</h3>
                    <p className="text-sm text-gray-500">Enviar mensajes de texto</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Próximamente</Badge>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Notificaciones WhatsApp</h3>
                    <p className="text-sm text-gray-500">Enviar mensajes por WhatsApp</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Próximamente</Badge>
                    <Switch
                      checked={settings.whatsappNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, whatsappNotifications: checked})}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {settings.emailNotifications && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Configuración SMTP
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtpServer">Servidor SMTP</Label>
                        <Input
                          id="smtpServer"
                          value={settings.smtpServer || ''}
                          onChange={(e) => setSettings({...settings, smtpServer: e.target.value})}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPort">Puerto SMTP</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={settings.smtpPort || ''}
                          onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpUsername">Usuario SMTP</Label>
                        <Input
                          id="smtpUsername"
                          value={settings.smtpUsername || ''}
                          onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                          placeholder="tu-email@gmail.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={settings.smtpPassword || ''}
                          onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Seguridad */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Configuración de seguridad y acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="15"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Autenticación de Dos Factores</h3>
                  <p className="text-sm text-gray-500">Requiere verificación adicional para iniciar sesión</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Próximamente</Badge>
                  <Switch
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) => setSettings({...settings, requireTwoFactor: checked})}
                    disabled
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Configuración del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultPatientStatus">Estado por Defecto de Pacientes</Label>
                    <Select value={settings.defaultPatientStatus} onValueChange={(value) => setSettings({...settings, defaultPatientStatus: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Prospecto">Prospecto</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({...settings, backupFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diario</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensual">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Respaldo Automático</h3>
                    <p className="text-sm text-gray-500">Crear respaldos automáticos de la base de datos</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
