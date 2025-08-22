
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Shield, 
  Edit, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  website?: string;
  coverage: number;
  copayment: number;
  deductible: number;
  maxAnnualCoverage: number;
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  agreementDate?: string;
  renewalDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function InsuranceModule() {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsuranceCompanies();
  }, []);

  const fetchInsuranceCompanies = async () => {
    try {
      const response = await fetch('/api/insurance-companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data || []);
      }
    } catch (error) {
      console.error('Error fetching insurance companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InsuranceCompany['status']) => {
    const statusConfig = {
      'Activo': { variant: 'success', label: 'Activo' },
      'Inactivo': { variant: 'secondary', label: 'Inactivo' },
      'Suspendido': { variant: 'destructive', label: 'Suspendido' }
    };
    
    const config = statusConfig[status] || statusConfig['Inactivo'];
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.contactName && company.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCompanyClick = (company: InsuranceCompany) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Aseguradoras</h1>
          <p className="text-gray-600">Gestión de compañías de seguros dentales</p>
        </div>
        <Button onClick={() => setIsNewCompanyOpen(true)} className="dental-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Aseguradora
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aseguradoras</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-gray-500">Compañías registradas</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(c => c.status === 'Activo').length}
            </div>
            <p className="text-xs text-gray-500">Con convenio activo</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura Promedio</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.length > 0 
                ? `${Math.round(companies.reduce((sum, c) => sum + c.coverage, 0) / companies.length)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-gray-500">Cobertura promedio</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Convenios por renovar</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Buscar Aseguradora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, código o contacto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Insurance Companies List */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Aseguradoras</CardTitle>
          <p className="text-sm text-gray-600">
            Se encontraron {filteredCompanies.length} aseguradoras
          </p>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron aseguradoras</p>
              <Button onClick={() => setIsNewCompanyOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar primera aseguradora
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => handleCompanyClick(company)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg dental-text-primary">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-500">Código: {company.code}</p>
                      </div>
                    </div>
                    {getStatusBadge(company.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cobertura:</span>
                      <span className="font-semibold">{company.coverage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Copago:</span>
                      <span className="font-semibold">{company.copayment}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deducible:</span>
                      <span className="font-semibold">${company.deductible.toLocaleString()}</span>
                    </div>
                  </div>

                  {company.contactName && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {company.contactName}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {selectedCompany?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="coverage">Cobertura</TabsTrigger>
                <TabsTrigger value="contact">Contacto</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Información General</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium">{selectedCompany.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Código</p>
                        <p className="font-medium">{selectedCompany.code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        {getStatusBadge(selectedCompany.status)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Fechas</h3>
                    <div className="space-y-2">
                      {selectedCompany.agreementDate && (
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Convenio</p>
                          <p className="font-medium">{new Date(selectedCompany.agreementDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedCompany.renewalDate && (
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Renovación</p>
                          <p className="font-medium">{new Date(selectedCompany.renewalDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Registrado</p>
                        <p className="font-medium">{new Date(selectedCompany.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCompany.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notas</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedCompany.notes}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="coverage" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cobertura General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Cobertura</span>
                          <span className="font-bold">{selectedCompany.coverage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${selectedCompany.coverage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Copago</span>
                        <span className="font-bold">{selectedCompany.copayment}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deducible</span>
                        <span className="font-bold">${selectedCompany.deductible.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cobertura Máxima Anual</span>
                        <span className="font-bold">${selectedCompany.maxAnnualCoverage.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reclamos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-2">Gestión de Reclamos</p>
                        <p className="text-sm text-gray-400 mb-4">
                          Funcionalidad en desarrollo
                        </p>
                        <Button variant="outline" size="sm" disabled>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Reclamos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Información de Contacto</h3>
                    <div className="space-y-3">
                      {selectedCompany.contactName && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{selectedCompany.contactName}</span>
                        </div>
                      )}
                      {selectedCompany.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{selectedCompany.phone}</span>
                        </div>
                      )}
                      {selectedCompany.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{selectedCompany.email}</span>
                        </div>
                      )}
                      {selectedCompany.website && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <a 
                            href={selectedCompany.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedCompany.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Dirección</h3>
                    <div className="space-y-2">
                      {selectedCompany.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p>{selectedCompany.address}</p>
                            {selectedCompany.city && <p>{selectedCompany.city}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* New Company Dialog */}
      <Dialog open={isNewCompanyOpen} onOpenChange={setIsNewCompanyOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Aseguradora</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              Formulario de registro de aseguradora en desarrollo
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Esta funcionalidad estará disponible próximamente
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
