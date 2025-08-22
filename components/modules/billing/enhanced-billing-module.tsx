
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Receipt, 
  Edit, 
  Eye,
  DollarSign,
  Calendar,
  Users,
  FileText,
  PrinterIcon,
  Download,
  Clock,
  Settings,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Invoice {
  id: string;
  invoiceNumber: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    rfc?: string;
    taxId?: string;
  };
  user: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  country: string;
  currency: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  uuid?: string;
  cfdiStatus?: string;
  cfdiUse?: string;
  paymentMethod?: string;
  notes?: string;
  items: InvoiceItem[];
  payments: Payment[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  treatment?: {
    id: string;
    name: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  paymentDate: string;
  notes?: string;
}

interface BillingStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export function EnhancedBillingModule() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFiscalConfig, setShowFiscalConfig] = useState(false);
  
  const { toast } = useToast();

  // Cargar facturas
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(countryFilter && countryFilter !== 'all' && { country: countryFilter })
      });

      const response = await fetch(`/api/billing/invoices?${params}`);
      if (!response.ok) throw new Error('Error al cargar facturas');
      
      const data = await response.json();
      setInvoices(data.invoices);
      
      // Calcular estadísticas
      const totalRevenue = data.invoices
        .filter((inv: Invoice) => inv.status === 'Pagada')
        .reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
      
      const pendingRevenue = data.invoices
        .filter((inv: Invoice) => ['Enviada', 'Pendiente'].includes(inv.status))
        .reduce((sum: number, inv: Invoice) => sum + inv.total, 0);

      setStats({
        totalInvoices: data.invoices.length,
        paidInvoices: data.invoices.filter((inv: Invoice) => inv.status === 'Pagada').length,
        pendingInvoices: data.invoices.filter((inv: Invoice) => ['Enviada', 'Pendiente'].includes(inv.status)).length,
        totalRevenue,
        pendingRevenue
      });

    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Error",
        description: "Error al cargar las facturas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [page, searchQuery, statusFilter, countryFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; label: string; icon: any }> = {
      'Borrador': { variant: 'secondary', label: 'Borrador', icon: Edit },
      'Enviada': { variant: 'default', label: 'Enviada', icon: FileText },
      'Pagada': { variant: 'default', label: 'Pagada', icon: CheckCircle },
      'Parcialmente Pagada': { variant: 'secondary', label: 'Parcial', icon: Clock },
      'Vencida': { variant: 'destructive', label: 'Vencida', icon: AlertCircle },
      'Cancelada': { variant: 'destructive', label: 'Cancelada', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Borrador'];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getCountryFlag = (country: string) => {
    return country === 'MX' ? '🇲🇽' : country === 'ES' ? '🇪🇸' : '🌍';
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'MXN' ? '$' : currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const generateCFDI = async (invoiceId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/cfdi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      toast({
        title: "CFDI Generado",
        description: `UUID: ${data.cfdi.uuid}`,
      });
      
      // Recargar facturas
      loadInvoices();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al generar CFDI",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelCFDI = async (invoiceId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/cfdi/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "CFDI Cancelado",
        description: "El CFDI ha sido cancelado exitosamente",
      });
      
      // Recargar facturas
      loadInvoices();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cancelar CFDI",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Facturación</h1>
          <p className="text-gray-600">Gestión completa de facturas, CFDI y pagos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showFiscalConfig} onOpenChange={setShowFiscalConfig}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configuración Fiscal</DialogTitle>
              </DialogHeader>
              {/* TODO: Agregar componente de configuración fiscal */}
              <div className="p-4 text-center text-gray-500">
                Configuración fiscal próximamente disponible
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="dental-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Factura</DialogTitle>
              </DialogHeader>
              {/* TODO: Agregar componente de crear factura */}
              <div className="p-4 text-center text-gray-500">
                Formulario de creación próximamente disponible
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-gray-500">Facturas emitidas</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidInvoices}</div>
            <p className="text-xs text-gray-500">Pagadas completamente</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</div>
            <p className="text-xs text-gray-500">Por cobrar</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Total cobrado</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.pendingRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Monto pendiente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="dental-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número, paciente o RFC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Enviada">Enviada</SelectItem>
                <SelectItem value="Pagada">Pagada</SelectItem>
                <SelectItem value="Parcialmente Pagada">Parcialmente Pagada</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="MX">🇲🇽 México</SelectItem>
                <SelectItem value="ES">🇪🇸 España</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={loadInvoices} 
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron facturas</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="dental-gradient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primera factura
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Número</th>
                    <th className="text-left py-3 px-4 font-medium">Paciente</th>
                    <th className="text-center py-3 px-4 font-medium">País</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                    <th className="text-center py-3 px-4 font-medium">Estado</th>
                    <th className="text-center py-3 px-4 font-medium">CFDI</th>
                    <th className="text-center py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">
                            {invoice.patient.firstName} {invoice.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.patient.rfc || invoice.patient.taxId || 'Sin RFC/CIF'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-lg" title={invoice.country}>
                          {getCountryFlag(invoice.country)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {invoice.country === 'MX' && (
                          <>
                            {invoice.uuid ? (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                UUID: {invoice.uuid.slice(0, 8)}...
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Sin timbrar
                              </Badge>
                            )}
                          </>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {invoice.status === 'Borrador' && (
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {invoice.country === 'MX' && !invoice.uuid && invoice.status !== 'Borrador' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => generateCFDI(invoice.id)}
                              disabled={loading}
                            >
                              <Receipt className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {invoice.country === 'MX' && invoice.uuid && invoice.cfdiStatus === 'Vigente' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => cancelCFDI(invoice.id)}
                              disabled={loading}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button variant="ghost" size="sm">
                            <PrinterIcon className="w-4 h-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Factura {selectedInvoice.invoiceNumber}
              </DialogTitle>
            </DialogHeader>
            {/* TODO: Agregar componente de detalle de factura */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Datos del Paciente</h4>
                  <p>{selectedInvoice.patient.firstName} {selectedInvoice.patient.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedInvoice.patient.email}</p>
                  <p className="text-sm text-gray-500">{selectedInvoice.patient.phone}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Datos Fiscales</h4>
                  <p>País: {getCountryFlag(selectedInvoice.country)} {selectedInvoice.country}</p>
                  <p>RFC/CIF: {selectedInvoice.patient.rfc || selectedInvoice.patient.taxId || 'N/A'}</p>
                  {selectedInvoice.uuid && (
                    <p className="text-sm">UUID: {selectedInvoice.uuid}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Conceptos</h4>
                <div className="border rounded">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2">Descripción</th>
                        <th className="text-center p-2">Cant.</th>
                        <th className="text-right p-2">Precio</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">
                            {formatCurrency(item.unitPrice, selectedInvoice.currency)}
                          </td>
                          <td className="p-2 text-right">
                            {formatCurrency(item.total, selectedInvoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 text-right">
                  <div>Subtotal: {formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</div>
                  <div>Impuestos: {formatCurrency(selectedInvoice.tax, selectedInvoice.currency)}</div>
                  <div className="font-bold text-lg">
                    Total: {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                  </div>
                </div>
              </div>
              
              {selectedInvoice.payments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Pagos Registrados</h4>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{payment.method}</span>
                          {payment.reference && (
                            <span className="text-sm text-gray-500"> - Ref: {payment.reference}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">
                            {formatCurrency(payment.amount, selectedInvoice.currency)}
                          </span>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
