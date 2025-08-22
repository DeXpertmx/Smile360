
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

import { 
  Calendar, 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw as Sync, 
  Link,
  Unlink,
  Clock,
  AlertCircle,
  Webhook,
  Key,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CalComSettings {
  isConnected: boolean;
  apiKey?: string;
  calId?: string;
  webhookId?: string;
  syncEnabled: boolean;
  autoSync: boolean;
  webhookUrl?: string;
  lastSync?: string;
  syncErrors?: string;
  webhookEvents: string[];
}

const DEFAULT_WEBHOOK_EVENTS = [
  'BOOKING_CREATED',
  'BOOKING_CANCELLED', 
  'BOOKING_RESCHEDULED',
  'BOOKING_CONFIRMED'
];

export function CalComIntegration() {
  const [settings, setSettings] = useState<CalComSettings>({
    isConnected: false,
    syncEnabled: false,
    autoSync: false,
    webhookEvents: DEFAULT_WEBHOOK_EVENTS
  });

  const [apiKey, setApiKey] = useState('');
  const [calId, setCalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/calcom/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setApiKey(data.apiKey || '');
        setCalId(data.calId || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey || !calId) {
      toast.error('Por favor ingresa la API Key y Cal ID');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/calcom/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, calId })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Conexión exitosa con Cal.com');
        return true;
      } else {
        toast.error(result.error || 'Error al conectar con Cal.com');
        return false;
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Error de conexión');
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!apiKey || !calId) {
      toast.error('Por favor ingresa la API Key y Cal ID');
      return;
    }

    // Test connection first
    const isConnectionValid = await handleTestConnection();
    if (!isConnectionValid) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/calcom/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey,
          calId,
          syncEnabled: true,
          autoSync: settings.autoSync,
          webhookEvents: settings.webhookEvents
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        toast.success('Configuración guardada correctamente');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que quieres desconectar Cal.com?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/calcom/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setSettings({
          isConnected: false,
          syncEnabled: false,
          autoSync: false,
          webhookEvents: DEFAULT_WEBHOOK_EVENTS
        });
        setApiKey('');
        setCalId('');
        toast.success('Cal.com desconectado correctamente');
      } else {
        toast.error('Error al desconectar');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/calcom/sync', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Sincronización completada: ${result.synchronized} citas sincronizadas`);
        loadSettings(); // Reload to get updated lastSync
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error en la sincronización');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Error de conexión');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSettingsUpdate = async (newSettings: Partial<CalComSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (updatedSettings.isConnected) {
      try {
        const response = await fetch('/api/calcom/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedSettings)
        });
        
        if (response.ok) {
          toast.success('Configuración actualizada');
        } else {
          toast.error('Error al actualizar configuración');
        }
      } catch (error) {
        console.error('Error updating settings:', error);
        toast.error('Error de conexión');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Integración con Cal.com</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {settings.isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">Estado de Conexión</span>
              </div>
              <Badge 
                className={
                  settings.isConnected 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }
              >
                {settings.isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            
            {settings.isConnected && (
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={loading}
              >
                <Unlink className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>

          {/* Configuration Form */}
          {!settings.isConnected && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-gray-900">Configuración de Cal.com</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Cal.com API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="cal_live_..."
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Obtén tu API Key desde el panel de Cal.com en Configuración → Desarrolladores
                  </p>
                </div>

                <div>
                  <Label htmlFor="cal-id">Cal ID (Username)</Label>
                  <Input
                    id="cal-id"
                    value={calId}
                    onChange={(e) => setCalId(e.target.value)}
                    placeholder="tu-usuario-calcom"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Tu nombre de usuario en Cal.com (ej: si tu link es cal.com/usuario, entonces es "usuario")
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey || !calId}
                  variant="outline"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {isTesting ? 'Probando...' : 'Probar Conexión'}
                </Button>

                <Button 
                  onClick={handleSaveConfiguration}
                  disabled={loading || !apiKey || !calId}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Link className="w-4 h-4 mr-2" />
                  {loading ? 'Conectando...' : 'Conectar y Guardar'}
                </Button>
              </div>
            </div>
          )}

          {settings.isConnected && (
            <>
              {/* Webhook Information */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium text-gray-900">Información del Webhook</h3>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Webhook className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-900">
                        URL del Webhook
                      </h4>
                      <p className="text-sm text-blue-800 font-mono bg-blue-100 p-2 rounded">
                        {settings.webhookUrl || `${window.location.origin}/api/calcom/webhook`}
                      </p>
                      <p className="text-sm text-blue-700">
                        Configura esta URL en tu panel de Cal.com en Configuración → Webhooks
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Settings */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium text-gray-900">Configuración de Sincronización</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-enabled">Habilitar Sincronización</Label>
                    <p className="text-sm text-gray-600">
                      Sincronizar citas entre Smile 360 y Cal.com automáticamente
                    </p>
                  </div>
                  <Switch
                    id="sync-enabled"
                    checked={settings.syncEnabled}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate({ syncEnabled: checked })
                    }
                    disabled={loading}
                  />
                </div>

                {settings.syncEnabled && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-sync">Sincronización en Tiempo Real</Label>
                      <p className="text-sm text-gray-600">
                        Recibir eventos de Cal.com instantáneamente vía webhook
                      </p>
                    </div>
                    <Switch
                      id="auto-sync"
                      checked={settings.autoSync}
                      onCheckedChange={(checked) => 
                        handleSettingsUpdate({ autoSync: checked })
                      }
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              {/* Manual Sync */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Sincronización Manual</h3>
                    {settings.lastSync && (
                      <p className="text-sm text-gray-600">
                        Última sincronización: {new Date(settings.lastSync).toLocaleString('es-ES')}
                      </p>
                    )}
                    {settings.syncErrors && (
                      <p className="text-sm text-red-600 mt-1">
                        Errores: {settings.syncErrors}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleManualSync}
                    disabled={isSyncing || !settings.syncEnabled}
                  >
                    <Sync className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </Button>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-900">
                      Ventajas de la Integración con Cal.com
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• <strong>Tiempo Real:</strong> Los cambios se reflejan instantáneamente vía webhooks</li>
                      <li>• <strong>Bidireccional:</strong> Las citas se sincronizan en ambas direcciones</li>
                      <li>• <strong>Automático:</strong> Sin necesidad de sincronización manual</li>
                      <li>• <strong>Confiable:</strong> Sistema robusto de manejo de errores</li>
                      <li>• <strong>Seguro:</strong> Verificación de webhooks con secretos</li>
                      <li>• <strong>Completo:</strong> Soporte para creación, modificación y cancelación</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Instrucciones de Configuración
                    </h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>1. En Cal.com:</strong></p>
                      <ul className="ml-4 space-y-1">
                        <li>• Ve a Configuración → Desarrolladores</li>
                        <li>• Genera una nueva API Key</li>
                        <li>• Ve a Configuración → Webhooks</li>
                        <li>• Añade la URL del webhook mostrada arriba</li>
                        <li>• Selecciona los eventos: Booking Created, Cancelled, Rescheduled</li>
                      </ul>
                      <p><strong>2. En Smile 360:</strong></p>
                      <ul className="ml-4 space-y-1">
                        <li>• Las citas de Cal.com aparecerán automáticamente</li>
                        <li>• Los cambios se reflejarán en tiempo real</li>
                        <li>• Puedes gestionar todo desde una sola interfaz</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
