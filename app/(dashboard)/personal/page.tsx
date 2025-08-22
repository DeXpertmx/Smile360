
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  Activity,
  Mail,
  Phone,
  Calendar,
  Settings,
  Crown,
  Stethoscope,
  HeadphonesIcon as Reception,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Building2,
  CreditCard,
  FileText,
  Heart,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PersonalFormAdvanced } from '@/components/personal/PersonalFormAdvanced';
import { PayrollModule } from '@/components/personal/PayrollModule';
import toast from 'react-hot-toast';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  position?: string;
  specializations?: string;
  professionalLicense?: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  city?: string;
  state?: string;
  country?: string;
  hireDate?: string;
  contractType?: string;
  baseSalary?: number;
  currency?: string;
  bankName?: string;
  bankAccount?: string;
  systemRole?: string;
  permissions?: string[];
  emergencyContactName?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  status: string;
  photo?: string;
  user?: any;
  createdAt: string;
  updatedAt: string;
}

export default function PersonalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Check permissions
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'Administrador') {
      toast.error('No tienes permisos para acceder a esta sección');
      router.push('/dashboard');
      return;
    }
    fetchStaffMembers();
  }, [session, router]);

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('/api/staff-members');
      if (response.ok) {
        const data = await response.json();
        setStaffMembers(data.staffMembers || []);
      } else {
        throw new Error('Error al cargar personal');
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error('Error al cargar el personal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/staff-members/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Empleado eliminado exitosamente');
        fetchStaffMembers();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar el empleado');
    }
  };

  const handleSave = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedStaff(null);
    fetchStaffMembers();
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedStaff(null);
  };

  const exportStaffReport = () => {
    // Implementar exportación de reporte
    toast.success('Exportando reporte de personal...');
  };

  const filteredStaff = staffMembers.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || member.position === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-gray-100 text-gray-800';
      case 'Suspendido': return 'bg-yellow-100 text-yellow-800';
      case 'Terminado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionIcon = (position: string) => {
    if (position?.includes('Doctor') || position?.includes('Odont')) {
      return <Stethoscope className="w-4 h-4" />;
    }
    if (position?.includes('Administr')) {
      return <Crown className="w-4 h-4" />;
    }
    if (position?.includes('Recepcion')) {
      return <Reception className="w-4 h-4" />;
    }
    return <Users className="w-4 h-4" />;
  };

  const uniquePositions = [...new Set(staffMembers.filter(s => s.position).map(s => s.position))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando personal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span>Gestión de Personal Avanzada</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema integral de recursos humanos para clínica dental
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={exportStaffReport}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Reporte</span>
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedStaff(null)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
              </DialogHeader>
              <PersonalFormAdvanced
                staffMember={null}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Nómina</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Reportes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Personal</p>
                    <p className="text-2xl font-bold text-gray-900">{staffMembers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Personal Activo</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {staffMembers.filter(s => s.status === 'Activo').length}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Personal Clínico</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {staffMembers.filter(s => s.position && 
                        (s.position.includes('Doctor') || s.position.includes('Odont') || 
                         s.position.includes('Higienist') || s.position.includes('Asistent'))
                      ).length}
                    </p>
                  </div>
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nuevos Este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {staffMembers.filter(s => {
                        const hireDate = new Date(s.hireDate || s.createdAt);
                        const thisMonth = new Date();
                        return hireDate.getMonth() === thisMonth.getMonth() && 
                               hireDate.getFullYear() === thisMonth.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Personal de la Clínica</CardTitle>
              <CardDescription>
                Gestión integral de recursos humanos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, email o puesto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Estados</SelectItem>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Suspendido">Suspendido</SelectItem>
                      <SelectItem value="Terminado">Terminado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Puestos</SelectItem>
                      {uniquePositions.map((position) => (
                        <SelectItem key={position} value={position!}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Staff List */}
              <div className="space-y-4">
                {filteredStaff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.photo} />
                        <AvatarFallback>
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">
                            {member.firstName} {member.lastName}
                          </h3>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status === 'Activo' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {member.status}
                          </Badge>
                          {member.position && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              {getPositionIcon(member.position)}
                              <span>{member.position}</span>
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{member.email}</span>
                          </div>
                          
                          {member.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          
                          {member.professionalLicense && (
                            <div className="flex items-center space-x-1">
                              <Shield className="w-4 h-4" />
                              <span>Cédula: {member.professionalLicense}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {member.hireDate 
                                ? `Ingreso: ${new Date(member.hireDate).toLocaleDateString('es-ES')}`
                                : `Registrado: ${new Date(member.createdAt).toLocaleDateString('es-ES')}`
                              }
                            </span>
                          </div>
                        </div>

                        {member.specializations && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-blue-600 font-medium">
                              Especialidades: {member.specializations}
                            </span>
                          </div>
                        )}

                        {member.baseSalary && (
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">
                              {new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: member.currency || 'MXN'
                              }).format(member.baseSalary)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(member)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedStaff(member);
                            setIsPayrollDialogOpen(true);
                          }}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Nómina
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {filteredStaff.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No se encontró personal</p>
                    {searchTerm && (
                      <p className="text-gray-400 mt-2">
                        Intenta con un término de búsqueda diferente
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <PayrollModule />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Personal</CardTitle>
              <CardDescription>
                Genera reportes automáticos para auditorías y análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline">
                  <FileText className="w-8 h-8" />
                  <span>Reporte General de Personal</span>
                </Button>
                
                <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline">
                  <Shield className="w-8 h-8" />
                  <span>Certificaciones Vencidas</span>
                </Button>
                
                <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline">
                  <Calendar className="w-8 h-8" />
                  <span>Cumpleaños del Mes</span>
                </Button>
                
                <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline">
                  <CreditCard className="w-8 h-8" />
                  <span>Reporte de Nóminas</span>
                </Button>
                
                <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline">
                  <Heart className="w-8 h-8" />
                  <span>Contactos de Emergencia</span>
                </Button>
                
                <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline">
                  <Building2 className="w-8 h-8" />
                  <span>Organigrama</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
          </DialogHeader>
          <PersonalFormAdvanced
            staffMember={selectedStaff}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Payroll Dialog */}
      <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Nómina - {selectedStaff?.firstName} {selectedStaff?.lastName}
            </DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <PayrollModule staffMember={selectedStaff} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
