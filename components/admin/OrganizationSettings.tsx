
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Building2, Users, UserCheck, Calendar, CreditCard, Globe, Clock } from 'lucide-react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { toast } from 'react-hot-toast';

export default function OrganizationSettings() {
  const { organization, loading, refresh } = useOrganizationContext();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    timezone: '',
    currency: '',
    language: ''
  });

  React.useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        phone: organization.phone || '',
        website: organization.website || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        timezone: organization.timezone || '',
        currency: organization.currency || '',
        language: organization.language || ''
      });
    }
  }, [organization]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/organization/current', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Configuración actualizada');
        refresh();
      } else {
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error interno del servidor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No se pudo cargar la información de la organización</p>
      </div>
    );
  }

  const userProgress = organization.maxUsers === -1 
    ? 0 
    : (organization.usage?.users / organization.maxUsers) * 100;
    
  const patientProgress = organization.maxPatients === -1 
    ? 0 
    : (organization.usage?.patients / organization.maxPatients) * 100;

  return (
    <div className="space-y-6">
      {/* Información del Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <CardTitle>Plan Actual</CardTitle>
            </div>
            <Badge variant={organization.status === 'active' ? 'default' : 
                          organization.status === 'trial' ? 'secondary' : 'destructive'}>
              {organization.status === 'active' ? 'Activo' :
               organization.status === 'trial' ? 'Prueba Gratuita' :
               organization.status === 'suspended' ? 'Suspendido' : 'Cancelado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-lg capitalize">{organization.plan}</h4>
              {organization.status === 'trial' && organization.trialEndsAt && (
                <p className="text-sm text-gray-600">
                  Prueba termina el {new Date(organization.trialEndsAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm">
                Cambiar Plan
              </Button>
            </div>
          </div>

          <Separator />

          {/* Límites de Uso */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Usuarios</span>
                </div>
                <span className="text-sm text-gray-600">
                  {organization.usage?.users || 0}
                  {organization.maxUsers !== -1 && ` / ${organization.maxUsers}`}
                </span>
              </div>
              {organization.maxUsers !== -1 && (
                <Progress value={userProgress} className="h-2" />
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Pacientes</span>
                </div>
                <span className="text-sm text-gray-600">
                  {organization.usage?.patients || 0}
                  {organization.maxPatients !== -1 && ` / ${organization.maxPatients.toLocaleString()}`}
                </span>
              </div>
              {organization.maxPatients !== -1 && (
                <Progress value={patientProgress} className="h-2" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información General */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <CardTitle>Información de la Clínica</CardTitle>
          </div>
          <CardDescription>
            Configura los datos básicos de tu clínica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Clínica</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+52 555 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.clinica.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado/Provincia</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración Regional */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <CardTitle>Configuración Regional</CardTitle>
          </div>
          <CardDescription>
            Ajusta la configuración regional y de localización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={formData.currency} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                  <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select value={formData.language} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select value={formData.timezone} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                  <SelectItem value="America/Bogota">Colombia (GMT-5)</SelectItem>
                  <SelectItem value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</SelectItem>
                  <SelectItem value="Europe/Madrid">España (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={refresh}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
