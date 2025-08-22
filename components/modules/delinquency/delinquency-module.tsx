
'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Users,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Download,
  RotateCcw,
  Target,
  TrendingUp
} from 'lucide-react';
import { formatDate } from "@/lib/date-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import toast from 'react-hot-toast';

interface DelinquencyNotification {
  id: string;
  patientId: string;
  type: string;
  title: string;
  description: string;
  originalAmount: number;
  overdueAmount: number;
  lateFeeAmount: number;
  totalOwed: number;
  originalDueDate: string;
  daysOverdue: number;
  status: string;
  priority: string;
  assignedTo?: string;
  nextActionDate?: string;
  resolvedAt?: string;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    numeroExpediente: string;
    email?: string;
    phone?: string;
  };
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  actions: DelinquencyAction[];
  financingPlan?: {
    id: string;
    planNumber: string;
    title: string;
    totalAmount: number;
  };
  financingPayment?: {
    id: string;
    paymentNumber: number;
    scheduledAmount: number;
    dueDate: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    total: number;
    dueDate: string;
  };
}

interface DelinquencyAction {
  id: string;
  actionType: string;
  description: string;
  outcome?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface DelinquencyStats {
  totalNotifications: number;
  pendingNotifications: number;
  totalOverdueAmount: number;
  averageDaysOverdue: number;
  criticalCases: number;
  resolvedThisMonth: number;
}

export default function DelinquencyModule() {
  const [notifications, setNotifications] = useState<DelinquencyNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<DelinquencyNotification[]>([]);
  const [stats, setStats] = useState<DelinquencyStats>({
    totalNotifications: 0,
    pendingNotifications: 0,
    totalOverdueAmount: 0,
    averageDaysOverdue: 0,
    criticalCases: 0,
    resolvedThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<DelinquencyNotification | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isGeneratingNotifications, setIsGeneratingNotifications] = useState(false);

  // Cargar notificaciones al inicio
  useEffect(() => {
    loadNotifications();
  }, []);

  // Filtrar notificaciones cuando cambian los filtros
  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, statusFilter, priorityFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delinquency');
      
      if (!response.ok) {
        throw new Error('Error al cargar las notificaciones de morosidad');
      }

      const data = await response.json();
      setNotifications(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las notificaciones de morosidad');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        `${notification.patient.firstName} ${notification.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.patient.numeroExpediente.includes(searchTerm) ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    // Filtro por prioridad
    if (priorityFilter) {
      filtered = filtered.filter(notification => notification.priority === priorityFilter);
    }

    setFilteredNotifications(filtered);
  };

  const calculateStats = (data: DelinquencyNotification[]) => {
    const totalNotifications = data.length;
    const pendingNotifications = data.filter(n => n.status === 'Pendiente').length;
    const totalOverdueAmount = data.reduce((sum, n) => sum + n.totalOwed, 0);
    const averageDaysOverdue = totalNotifications > 0 ? Math.round(data.reduce((sum, n) => sum + n.daysOverdue, 0) / totalNotifications) : 0;
    const criticalCases = data.filter(n => n.priority === 'Crítica').length;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const resolvedThisMonth = data.filter(n => 
      n.status === 'Resuelto' && 
      n.resolvedAt && 
      new Date(n.resolvedAt) >= thisMonth
    ).length;

    setStats({
      totalNotifications,
      pendingNotifications,
      totalOverdueAmount,
      averageDaysOverdue,
      criticalCases,
      resolvedThisMonth
    });
  };

  const generateAutoNotifications = async () => {
    try {
      setIsGeneratingNotifications(true);
      
      const response = await fetch('/api/delinquency/auto-generate', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Error al generar notificaciones automáticas');
      }
      
      const result = await response.json();
      toast.success(`Se generaron ${result.created} notificaciones automáticas`);
      loadNotifications(); // Recargar la lista
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar notificaciones automáticas');
    } finally {
      setIsGeneratingNotifications(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica':
        return 'bg-red-500';
      case 'Alta':
        return 'bg-orange-500';
      case 'Media':
        return 'bg-yellow-500';
      case 'Baja':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-500';
      case 'Enviado':
        return 'bg-blue-500';
      case 'Visto':
        return 'bg-purple-500';
      case 'Resuelto':
        return 'bg-green-500';
      case 'Cancelado':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            Gestión de Morosidad
          </h1>
          <p className="text-gray-600">Control y seguimiento de pagos vencidos</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={generateAutoNotifications}
            disabled={isGeneratingNotifications}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGeneratingNotifications ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Detectar Automáticamente
              </>
            )}
          </Button>
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configuración de Morosidad</DialogTitle>
              </DialogHeader>
              <DelinquencySettings onSave={() => setShowSettingsDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Casos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingNotifications}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Casos Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalCases}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-red-600">${stats.totalOverdueAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Días</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageDaysOverdue}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedThisMonth}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por paciente, expediente, título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Visto">Visto</SelectItem>
                <SelectItem value="Resuelto">Resuelto</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las prioridades</SelectItem>
                <SelectItem value="Crítica">Crítica</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              variant="outline"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
              <p className="text-gray-600">
                {notifications.length === 0 
                  ? 'No se han encontrado casos de morosidad. Use "Detectar Automáticamente" para buscar pagos vencidos.'
                  : 'No se encontraron notificaciones que coincidan con los filtros aplicados.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {notification.patient.firstName} {notification.patient.lastName}
                          </span>
                          <span>Exp: {notification.patient.numeroExpediente}</span>
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {notification.daysOverdue} días de mora
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getPriorityColor(notification.priority)} text-white`}>
                          {notification.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(notification.status)} text-white`}>
                          {notification.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {notification.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Monto Original</p>
                        <p className="text-gray-900">${notification.originalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Monto en Mora</p>
                        <p className="text-red-600">${notification.overdueAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Recargo por Mora</p>
                        <p className="text-orange-600">${notification.lateFeeAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Total Adeudado</p>
                        <p className="text-red-700 font-bold">${notification.totalOwed.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Vence: {formatDate(notification.originalDueDate)}
                        </span>
                        {notification.assignedUser && (
                          <span>
                            Asignado a: {notification.assignedUser.firstName} {notification.assignedUser.lastName}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setSelectedNotification(notification)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalle
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowActionDialog(true);
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Acción
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      {selectedNotification && (
        <>
          <NotificationDetailDialog
            notification={selectedNotification}
            open={!!selectedNotification && !showActionDialog}
            onClose={() => setSelectedNotification(null)}
            onReload={loadNotifications}
          />
          
          <AddActionDialog
            notification={selectedNotification}
            open={showActionDialog}
            onClose={() => {
              setShowActionDialog(false);
              setSelectedNotification(null);
            }}
            onSaved={loadNotifications}
          />
        </>
      )}
    </div>
  );
}

// Componente para ver detalles de la notificación
function NotificationDetailDialog({ 
  notification, 
  open, 
  onClose, 
  onReload 
}: { 
  notification: DelinquencyNotification;
  open: boolean;
  onClose: () => void;
  onReload: () => void;
}) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/delinquency/${notification.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          resolvedAt: newStatus === 'Resuelto' ? new Date().toISOString() : null
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      toast.success('Estado actualizado correctamente');
      onReload();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalle de Notificación de Morosidad</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Información del paciente */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información del Paciente</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
              <div>
                <p className="font-medium text-gray-600">Nombre</p>
                <p>{notification.patient.firstName} {notification.patient.lastName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Expediente</p>
                <p>{notification.patient.numeroExpediente}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Email</p>
                <p>{notification.patient.email || 'No disponible'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Teléfono</p>
                <p>{notification.patient.phone || 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Información de la deuda */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Detalles de la Deuda</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-600">Monto Original</p>
                  <p className="text-xl font-bold">${notification.originalAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-600">Monto en Mora</p>
                  <p className="text-xl font-bold text-red-600">${notification.overdueAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-600">Recargo por Mora</p>
                  <p className="text-xl font-bold text-orange-600">${notification.lateFeeAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-600">Total Adeudado</p>
                  <p className="text-xl font-bold text-red-700">${notification.totalOwed.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Historial de acciones */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Historial de Acciones</h3>
            {notification.actions.length === 0 ? (
              <p className="text-gray-600">No se han registrado acciones aún.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notification.actions.map((action) => (
                  <div key={action.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{action.actionType}</p>
                        <p className="text-gray-700">{action.description}</p>
                        {action.outcome && (
                          <p className="text-sm text-green-600 mt-1">Resultado: {action.outcome}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>{action.user.firstName} {action.user.lastName}</p>
                        <p>{formatDate(action.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="flex justify-end space-x-3">
            {notification.status !== 'Resuelto' && (
              <>
                <Button
                  onClick={() => updateStatus('Enviado')}
                  disabled={updating}
                  variant="outline"
                >
                  Marcar como Enviado
                </Button>
                <Button
                  onClick={() => updateStatus('Resuelto')}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updating ? 'Actualizando...' : 'Resolver Caso'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para agregar acciones
function AddActionDialog({ 
  notification, 
  open, 
  onClose, 
  onSaved 
}: { 
  notification: DelinquencyNotification;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [actionType, setActionType] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [duration, setDuration] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const saveAction = async () => {
    if (!actionType || !description) {
      toast.error('Tipo de acción y descripción son requeridos');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/delinquency/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: notification.id,
          patientId: notification.patientId,
          actionType,
          description,
          outcome: outcome || null,
          contactMethod: contactMethod || null,
          duration: duration ? parseInt(duration) : null,
          nextSteps: nextSteps || null,
          followUpRequired,
          followUpDate: followUpDate || null,
          followUpNotes: followUpNotes || null
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la acción');
      }

      toast.success('Acción registrada correctamente');
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la acción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Acción de Seguimiento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-medium">Paciente: {notification.patient.firstName} {notification.patient.lastName}</p>
            <p className="text-sm text-gray-600">{notification.title}</p>
          </div>

          <div>
            <Label htmlFor="actionType">Tipo de Acción *</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Llamada Telefónica</SelectItem>
                <SelectItem value="email">Envío de Email</SelectItem>
                <SelectItem value="sms">Envío de SMS</SelectItem>
                <SelectItem value="meeting">Reunión Presencial</SelectItem>
                <SelectItem value="payment_plan">Negociación Plan de Pago</SelectItem>
                <SelectItem value="legal_action">Acción Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descripción de la Acción *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa detalladamente la acción realizada..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="outcome">Resultado/Outcome</Label>
            <Textarea
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="¿Cuál fue el resultado de esta acción? ¿Se logró el objetivo?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactMethod">Método de Contacto</Label>
              <Select value={contactMethod} onValueChange={setContactMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Método utilizado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Teléfono</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="in_person">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duración (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Solo para llamadas/reuniones"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nextSteps">Próximos Pasos</Label>
            <Textarea
              id="nextSteps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="¿Qué pasos se deben seguir a continuación?"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="followUpRequired">Requiere seguimiento</Label>
            </div>

            {followUpRequired && (
              <>
                <div>
                  <Label htmlFor="followUpDate">Fecha de Seguimiento</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="followUpNotes">Notas de Seguimiento</Label>
                  <Textarea
                    id="followUpNotes"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="Recordatorio para el próximo seguimiento..."
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>
            <Button onClick={saveAction} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Acción'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para configuración
function DelinquencySettings({ onSave }: { onSave: () => void }) {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/delinquency/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/delinquency/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Configuración guardada correctamente');
        onSave();
      } else {
        throw new Error('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="fees">Recargos</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Recordatorio (días antes)</Label>
              <Input
                type="number"
                value={settings.reminderDaysBefore || 3}
                onChange={(e) => setSettings({...settings, reminderDaysBefore: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Primer aviso (días después)</Label>
              <Input
                type="number"
                value={settings.firstNoticeDays || 1}
                onChange={(e) => setSettings({...settings, firstNoticeDays: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Segundo aviso (días después)</Label>
              <Input
                type="number"
                value={settings.secondNoticeDays || 7}
                onChange={(e) => setSettings({...settings, secondNoticeDays: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Aviso final (días después)</Label>
              <Input
                type="number"
                value={settings.finalNoticeDays || 15}
                onChange={(e) => setSettings({...settings, finalNoticeDays: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.autoSendReminders || false}
                onChange={(e) => setSettings({...settings, autoSendReminders: e.target.checked})}
              />
              <Label>Enviar recordatorios automáticamente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.autoSendNotices || false}
                onChange={(e) => setSettings({...settings, autoSendNotices: e.target.checked})}
              />
              <Label>Enviar avisos automáticamente</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.enableLateFees || true}
              onChange={(e) => setSettings({...settings, enableLateFees: e.target.checked})}
            />
            <Label>Habilitar recargos por mora</Label>
          </div>

          {settings.enableLateFees && (
            <>
              <div>
                <Label>Tipo de recargo</Label>
                <Select 
                  value={settings.lateFeeType || 'fixed'} 
                  onValueChange={(value) => setSettings({...settings, lateFeeType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Monto fijo</SelectItem>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  {settings.lateFeeType === 'percentage' ? 'Porcentaje (%)' : 'Monto fijo ($)'}
                </Label>
                <Input
                  type="number"
                  value={settings.lateFeeAmount || 50}
                  onChange={(e) => setSettings({...settings, lateFeeAmount: parseFloat(e.target.value)})}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Teléfono de la clínica</Label>
              <Input
                value={settings.clinicPhone || ''}
                onChange={(e) => setSettings({...settings, clinicPhone: e.target.value})}
              />
            </div>
            <div>
              <Label>Email de la clínica</Label>
              <Input
                value={settings.clinicEmail || ''}
                onChange={(e) => setSettings({...settings, clinicEmail: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Dirección de la clínica</Label>
            <Textarea
              value={settings.clinicAddress || ''}
              onChange={(e) => setSettings({...settings, clinicAddress: e.target.value})}
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  );
}
