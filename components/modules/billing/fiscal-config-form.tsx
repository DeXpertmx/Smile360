
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader, Save, MapPin, Building, CreditCard, Settings } from 'lucide-react';

const fiscalConfigSchema = z.object({
  country: z.enum(["MX", "ES"]),
  
  // Campos México
  rfc: z.string().optional(),
  businessName: z.string().optional(),
  comercialName: z.string().optional(),
  taxRegime: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Configuración CFDI
  pacProvider: z.string().optional(),
  pacUsername: z.string().optional(),
  pacPassword: z.string().optional(),
  pacApiUrl: z.string().optional(),
  pacApiToken: z.string().optional(),
  
  // Campos España
  cif: z.string().optional(),
  vatNumber: z.string().optional(),
  companyName: z.string().optional(),
  
  // Datos generales
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  
  // Dirección
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country_address: z.string().optional(),
  zipCode: z.string().optional(),
});

type FiscalConfigFormData = z.infer<typeof fiscalConfigSchema>;

interface FiscalConfigFormProps {
  onSaved?: () => void;
}

export function FiscalConfigForm({ onSaved }: FiscalConfigFormProps) {
  const [activeCountry, setActiveCountry] = useState<"MX" | "ES">("MX");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FiscalConfigFormData>({
    resolver: zodResolver(fiscalConfigSchema),
    defaultValues: {
      country: activeCountry,
    }
  });

  // Cargar configuración existente
  const loadFiscalConfig = async (country: string) => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/billing/fiscal-config?country=${country}`);
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          // Mapear la dirección desde JSON
          const address = data.config.address || {};
          
          reset({
            ...data.config,
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            country_address: address.country || '',
            zipCode: address.zipCode || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading fiscal config:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadFiscalConfig(activeCountry);
    setValue('country', activeCountry);
  }, [activeCountry, setValue]);

  const onSubmit = async (data: FiscalConfigFormData) => {
    setLoading(true);
    try {
      // Construir el objeto de dirección
      const address = {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country_address,
        zipCode: data.zipCode,
      };

      const submitData = {
        ...data,
        address,
        // Limpiar campos de dirección individual
        street: undefined,
        city: undefined,
        state: undefined,
        country_address: undefined,
        zipCode: undefined,
      };

      const response = await fetch('/api/billing/fiscal-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar configuración');
      }

      toast({
        title: "Configuración Guardada",
        description: `Configuración fiscal para ${activeCountry === 'MX' ? 'México' : 'España'} guardada exitosamente`,
      });
      
      onSaved?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar configuración",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Catálogos de regímenes fiscales
  const regimenesFiscales = [
    { value: "601", label: "601 - General de Ley Personas Morales" },
    { value: "612", label: "612 - Personas Físicas con Actividades Empresariales" },
    { value: "621", label: "621 - Incorporación Fiscal" },
    { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
    { value: "626", label: "626 - Régimen Simplificado de Confianza" },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeCountry} onValueChange={(value) => setActiveCountry(value as "MX" | "ES")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="MX" className="flex items-center gap-2">
            🇲🇽 México (CFDI)
          </TabsTrigger>
          <TabsTrigger value="ES" className="flex items-center gap-2">
            🇪🇸 España (UE)
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* México */}
          <TabsContent value="MX" className="space-y-6">
            {loadingData ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                {/* Datos Fiscales México */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Datos Fiscales de la Clínica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rfc">RFC *</Label>
                        <Input
                          id="rfc"
                          {...register('rfc')}
                          placeholder="XAXX010101000"
                          className="uppercase"
                        />
                        {errors.rfc && (
                          <p className="text-sm text-red-600">{errors.rfc.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="taxRegime">Régimen Fiscal *</Label>
                        <Select 
                          value={watch('taxRegime') || ''} 
                          onValueChange={(value) => setValue('taxRegime', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar régimen" />
                          </SelectTrigger>
                          <SelectContent>
                            {regimenesFiscales.map((regimen) => (
                              <SelectItem key={regimen.value} value={regimen.value}>
                                {regimen.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="businessName">Razón Social *</Label>
                        <Input
                          id="businessName"
                          {...register('businessName')}
                          placeholder="CLINICA DENTAL SA DE CV"
                        />
                      </div>

                      <div>
                        <Label htmlFor="comercialName">Nombre Comercial</Label>
                        <Input
                          id="comercialName"
                          {...register('comercialName')}
                          placeholder="Smile 360 Dental"
                        />
                      </div>

                      <div>
                        <Label htmlFor="postalCode">Código Postal *</Label>
                        <Input
                          id="postalCode"
                          {...register('postalCode')}
                          placeholder="01000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configuración PAC */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Configuración PAC (Proveedor Autorizado de Certificación)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pacProvider">Proveedor PAC</Label>
                        <Input
                          id="pacProvider"
                          {...register('pacProvider')}
                          placeholder="Nombre del proveedor PAC"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pacApiUrl">URL API PAC *</Label>
                        <Input
                          id="pacApiUrl"
                          {...register('pacApiUrl')}
                          placeholder="https://api.pac.com/v1/cfdi"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pacUsername">Usuario PAC</Label>
                        <Input
                          id="pacUsername"
                          {...register('pacUsername')}
                          placeholder="usuario_pac"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pacApiToken">Token API PAC *</Label>
                        <Input
                          id="pacApiToken"
                          {...register('pacApiToken')}
                          type="password"
                          placeholder="Token de autenticación"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="pacPassword">Password PAC</Label>
                        <Input
                          id="pacPassword"
                          {...register('pacPassword')}
                          type="password"
                          placeholder="Contraseña del PAC"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> Para generar CFDIs necesitas contratar un servicio PAC. 
                        El token API es necesario para la integración automática.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* España */}
          <TabsContent value="ES" className="space-y-6">
            {loadingData ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Datos Fiscales de la Clínica (España)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cif">CIF *</Label>
                      <Input
                        id="cif"
                        {...register('cif')}
                        placeholder="A12345674"
                        className="uppercase"
                      />
                    </div>

                    <div>
                      <Label htmlFor="vatNumber">Número IVA</Label>
                      <Input
                        id="vatNumber"
                        {...register('vatNumber')}
                        placeholder="ES12345674"
                        className="uppercase"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                      <Input
                        id="companyName"
                        {...register('companyName')}
                        placeholder="Smile 360 Dental S.L."
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Nota:</strong> Para España se generarán facturas estándar UE 
                      con el formato requerido por la legislación española.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Datos Generales (para ambos países) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Datos Generales y Dirección
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+34 123 456 789"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder="facturacion@smilesys.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    placeholder="https://smilesys.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Dirección</Label>
                  <Input
                    id="street"
                    {...register('street')}
                    placeholder="Calle Principal 123, Col. Centro"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="Madrid"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado/Provincia</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="Madrid"
                  />
                </div>

                <div>
                  <Label htmlFor="country_address">País</Label>
                  <Select 
                    value={watch('country_address') || ''} 
                    onValueChange={(value) => setValue('country_address', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MX">🇲🇽 México</SelectItem>
                      <SelectItem value="ES">🇪🇸 España</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode')}
                    placeholder="28001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="dental-gradient"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Configuración
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
