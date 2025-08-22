
'use client';

import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  number: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Borrador' | 'Enviada' | 'Pagada' | 'Vencida' | 'Cancelada';
  paymentMethod?: string;
  notes?: string;
}

export function BillingModule() {
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'FAC-001',
      patientName: 'Ana García López',
      patientId: 'P000001',
      doctorName: 'Dr. Carlos Méndez',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      subtotal: 250.00,
      tax: 32.50,
      total: 282.50,
      status: 'Pagada',
      paymentMethod: 'Tarjeta de Crédito'
    },
    {
      id: '2',
      number: 'FAC-002',
      patientName: 'Luis Hernández',
      patientId: 'P000002',
      doctorName: 'Dra. María Rodríguez',
      date: '2024-01-16',
      dueDate: '2024-02-16',
      subtotal: 180.00,
      tax: 23.40,
      total: 203.40,
      status: 'Enviada'
    },
    {
      id: '3',
      number: 'FAC-003',
      patientName: 'Carmen Jiménez',
      patientId: 'P000003',
      doctorName: 'Dr. Carlos Méndez',
      date: '2024-01-10',
      dueDate: '2024-02-10',
      subtotal: 450.00,
      tax: 58.50,
      total: 508.50,
      status: 'Vencida'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      'Borrador': { variant: 'secondary', label: 'Borrador' },
      'Enviada': { variant: 'default', label: 'Enviada' },
      'Pagada': { variant: 'success', label: 'Pagada' },
      'Vencida': { variant: 'destructive', label: 'Vencida' },
      'Cancelada': { variant: 'warning', label: 'Cancelada' }
    };
    
    const config = statusConfig[status] || statusConfig['Borrador'];
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = invoices.filter(i => i.status === 'Pagada').reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = invoices.filter(i => i.status === 'Enviada').reduce((sum, i) => sum + i.total, 0);
  const overDueAmount = invoices.filter(i => i.status === 'Vencida').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Facturación</h1>
          <p className="text-gray-600">Gestión de facturas y pagos</p>
        </div>
        <Button className="dental-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Facturas pagadas</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Facturas pendientes</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${overDueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Facturas vencidas</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-gray-500">Facturas emitidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Buscar Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por número de factura, paciente o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Facturas</CardTitle>
          <p className="text-sm text-gray-600">
            Se encontraron {filteredInvoices.length} facturas
          </p>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron facturas</p>
              <Button variant="outline">
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
                    <th className="text-left py-3 px-4 font-medium">Doctor</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium">Vencimiento</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                    <th className="text-center py-3 px-4 font-medium">Estado</th>
                    <th className="text-center py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{invoice.number}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{invoice.patientName}</div>
                          <div className="text-sm text-gray-500">{invoice.patientId}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{invoice.doctorName}</td>
                      <td className="py-3 px-4">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Ingresos del Mes:</span>
              <span className="font-bold text-green-600">
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Por Cobrar:</span>
              <span className="font-bold text-blue-600">
                ${pendingAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Vencidas:</span>
              <span className="font-bold text-red-600">
                ${overDueAmount.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg">
              <span>Total:</span>
              <span className="font-bold">
                ${(totalRevenue + pendingAmount + overDueAmount).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Estado de Facturas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Pagadas:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {invoices.filter(i => i.status === 'Pagada').length}
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {Math.round((invoices.filter(i => i.status === 'Pagada').length / invoices.length) * 100)}%
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Enviadas:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {invoices.filter(i => i.status === 'Enviada').length}
                </span>
                <Badge variant="default">
                  {Math.round((invoices.filter(i => i.status === 'Enviada').length / invoices.length) * 100)}%
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Vencidas:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {invoices.filter(i => i.status === 'Vencida').length}
                </span>
                <Badge variant="destructive">
                  {Math.round((invoices.filter(i => i.status === 'Vencida').length / invoices.length) * 100)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
