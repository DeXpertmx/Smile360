
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Eye, Edit, CreditCard, Calculator, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { FinancingPlanForm } from "./FinancingPlanForm";
import { FinancingPlanDetail } from "./FinancingPlanDetail";
import { PaymentForm } from "./PaymentForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FinancingPlan {
  id: string;
  planNumber: string;
  title: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    numeroExpediente: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  totalAmount: number;
  downPayment: number;
  financedAmount: number;
  numberOfPayments: number;
  paymentFrequency: string;
  paymentAmount: number;
  status: string;
  approvalStatus: string;
  firstPaymentDate: string;
  finalPaymentDate: string;
  createdAt: string;
  stats: {
    totalPaid: number;
    remainingAmount: number;
    progress: number;
    paidPayments: number;
    pendingPayments: number;
    overduePayments?: number;
  };
}

const statusColors = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'Activo': 'bg-blue-100 text-blue-800',
  'Completado': 'bg-green-100 text-green-800',
  'Cancelado': 'bg-red-100 text-red-800',
  'Vencido': 'bg-red-100 text-red-800',
};

const approvalStatusColors = {
  'Por_Aprobar': 'bg-orange-100 text-orange-800',
  'Aprobado': 'bg-green-100 text-green-800',
  'Rechazado': 'bg-red-100 text-red-800',
};

export function FinancingModule() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("list");
  const [financingPlans, setFinancingPlans] = useState<FinancingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<FinancingPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const fetchFinancingPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/financing-plans?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFinancingPlans(data.financingPlans || []);
      } else {
        throw new Error('Error al cargar planes de financiamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los planes de financiamiento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchFinancingPlans();
    }
  }, [session, statusFilter]);

  const filteredPlans = financingPlans.filter((plan) =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${plan.patient.firstName} ${plan.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.patient.numeroExpediente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedPlan(null);
    fetchFinancingPlans();
    toast.success('Plan de financiamiento guardado exitosamente');
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    fetchFinancingPlans();
    toast.success('Pago registrado exitosamente');
  };

  const handleViewPlan = (plan: FinancingPlan) => {
    setSelectedPlan(plan);
    setActiveTab("detail");
  };

  const handleEditPlan = (plan: FinancingPlan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const calculateSummary = () => {
    const activeLoans = filteredPlans.filter(p => p.status === 'Activo');
    const totalFinanced = activeLoans.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalCollected = activeLoans.reduce((sum, p) => sum + p.stats.totalPaid, 0);
    const totalPending = activeLoans.reduce((sum, p) => sum + p.stats.remainingAmount, 0);
    const overdueLoans = activeLoans.filter(p => (p.stats.overduePayments || 0) > 0).length;

    return {
      totalLoans: activeLoans.length,
      totalFinanced,
      totalCollected,
      totalPending,
      overdueLoans,
    };
  };

  const summary = calculateSummary();

  if (loading && !showForm && activeTab !== "detail") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando planes de financiamiento...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <FinancingPlanForm
        plan={selectedPlan}
        onSave={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setSelectedPlan(null);
        }}
      />
    );
  }

  if (showPaymentForm && selectedPlan) {
    return (
      <PaymentForm
        financingPlan={selectedPlan}
        onSave={handlePaymentSuccess}
        onCancel={() => setShowPaymentForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financiamiento</h1>
          <p className="text-gray-600">Gestión de planes de financiamiento para tratamientos</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan de Financiamiento
        </Button>
      </div>

      {/* Resumen de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Planes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Financiado</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.totalFinanced.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cobrado</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary.totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Por Cobrar</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${summary.totalPending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Con Atrasos</p>
                <p className="text-2xl font-bold text-red-600">{summary.overdueLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Planes</TabsTrigger>
          {selectedPlan && <TabsTrigger value="detail">Detalle del Plan</TabsTrigger>}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por paciente, número de plan o título..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Planes */}
          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                        <Badge className={statusColors[plan.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                          {plan.status}
                        </Badge>
                        <Badge variant="outline" className={approvalStatusColors[plan.approvalStatus as keyof typeof approvalStatusColors] || 'bg-gray-100 text-gray-800'}>
                          {plan.approvalStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Paciente</p>
                          <p className="text-gray-600">
                            {plan.patient.firstName} {plan.patient.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Exp: {plan.patient.numeroExpediente}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">Monto Total</p>
                          <p className="text-gray-600">
                            ${plan.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {plan.numberOfPayments} cuotas de ${plan.paymentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">Progreso</p>
                          <div className="flex items-center gap-2">
                            <Progress value={plan.stats.progress} className="flex-1" />
                            <span className="text-xs">{plan.stats.progress}%</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {plan.stats.paidPayments}/{plan.stats.paidPayments + plan.stats.pendingPayments} pagos
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">Próximo Pago</p>
                          <p className="text-gray-600">
                            {format(new Date(plan.firstPaymentDate), "dd/MM/yyyy", { locale: es })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {plan.paymentFrequency}
                          </p>
                        </div>
                      </div>

                      {plan.stats.overduePayments && plan.stats.overduePayments > 0 && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {plan.stats.overduePayments} pago(s) vencido(s)
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPlan(plan)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalle
                      </Button>
                      
                      {plan.status === 'Activo' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowPaymentForm(true);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Registrar Pago
                        </Button>
                      )}
                      
                      {(session?.user?.role === 'ADMIN' || plan.status === 'Pendiente') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlans.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes de financiamiento</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter 
                    ? "No se encontraron planes que coincidan con los filtros aplicados."
                    : "Aún no hay planes de financiamiento registrados."
                  }
                </p>
                {!searchTerm && !statusFilter && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detail">
          {selectedPlan && (
            <FinancingPlanDetail
              plan={selectedPlan}
              onEdit={() => handleEditPlan(selectedPlan)}
              onClose={() => {
                setSelectedPlan(null);
                setActiveTab("list");
              }}
              onPayment={() => setShowPaymentForm(true)}
              onRefresh={fetchFinancingPlans}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
