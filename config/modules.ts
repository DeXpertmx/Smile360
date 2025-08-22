
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Home,
  Smile,
  TrendingUp,
  Calculator,
  Package,
  Shield,
  PenTool,
  Receipt,
  UserCircle,
  ClipboardList
} from 'lucide-react';

export interface ModuleConfig {
  id: string;
  name: string;
  href: string;
  icon: any;
  feature: string;
  description: string;
  roles?: string[]; // Roles que pueden acceder al módulo
  order: number; // Orden en el menú
  category?: string;
  isCore?: boolean; // Módulos core que siempre están disponibles
}

export const MODULE_CATEGORIES = {
  core: 'Núcleo',
  clinical: 'Clínico',
  business: 'Negocio',
  admin: 'Administración'
};

export const MODULES: Record<string, ModuleConfig> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    feature: 'dashboard',
    description: 'Panel principal con métricas y resumen',
    order: 1,
    category: 'core',
    isCore: true
  },
  
  // MÓDULOS CLÍNICOS
  agenda: {
    id: 'agenda',
    name: 'Agenda',
    href: '/agenda',
    icon: Calendar,
    feature: 'agenda',
    description: 'Gestión de citas y calendario',
    roles: ['ADMIN', 'DOCTOR', 'RECEPCIONISTA'],
    order: 2,
    category: 'clinical'
  },
  
  pacientes: {
    id: 'pacientes',
    name: 'Pacientes',
    href: '/pacientes',
    icon: Users,
    feature: 'pacientes',
    description: 'Gestión de pacientes y expedientes',
    roles: ['ADMIN', 'DOCTOR', 'RECEPCIONISTA'],
    order: 3,
    category: 'clinical'
  },
  
  expedientes: {
    id: 'expedientes',
    name: 'Expedientes',
    href: '/expedientes',
    icon: FileText,
    feature: 'expedientes',
    description: 'Historia clínica y expedientes médicos',
    roles: ['ADMIN', 'DOCTOR'],
    order: 4,
    category: 'clinical'
  },
  
  odontograma: {
    id: 'odontograma',
    name: 'Odontograma',
    href: '/odontograma',
    icon: Smile,
    feature: 'odontograma',
    description: 'Editor de odontogramas dentales',
    roles: ['ADMIN', 'DOCTOR'],
    order: 5,
    category: 'clinical'
  },
  
  periodontograma: {
    id: 'periodontograma',
    name: 'Periodontograma',
    href: '/periodontograma',
    icon: TrendingUp,
    feature: 'periodontograma',
    description: 'Editor de periodontogramas',
    roles: ['ADMIN', 'DOCTOR'],
    order: 6,
    category: 'clinical'
  },
  
  presupuestos: {
    id: 'presupuestos',
    name: 'Presupuestos',
    href: '/presupuestos',
    icon: Calculator,
    feature: 'presupuestos',
    description: 'Sistema de presupuestación',
    roles: ['ADMIN', 'DOCTOR', 'RECEPCIONISTA'],
    order: 7,
    category: 'clinical'
  },
  
  ordenes_tratamiento: {
    id: 'ordenes-tratamiento',
    name: 'Órdenes de Tratamiento',
    href: '/ordenes-tratamiento',
    icon: PenTool,
    feature: 'ordenes_tratamiento',
    description: 'Gestión de órdenes de tratamiento',
    roles: ['ADMIN', 'DOCTOR'],
    order: 8,
    category: 'clinical'
  },
  
  // MÓDULOS DE NEGOCIO
  crm: {
    id: 'crm',
    name: 'CRM',
    href: '/crm',
    icon: TrendingUp,
    feature: 'crm',
    description: 'Gestión de relaciones con clientes',
    roles: ['ADMIN', 'RECEPCIONISTA'],
    order: 9,
    category: 'business'
  },
  
  facturacion: {
    id: 'facturacion',
    name: 'Facturación',
    href: '/facturacion',
    icon: CreditCard,
    feature: 'facturacion',
    description: 'Sistema de facturación electrónica',
    roles: ['ADMIN', 'RECEPCIONISTA'],
    order: 10,
    category: 'business'
  },
  
  gastos: {
    id: 'gastos',
    name: 'Gastos',
    href: '/gastos',
    icon: Receipt,
    feature: 'gastos',
    description: 'Control de gastos y egresos',
    roles: ['ADMIN'],
    order: 11,
    category: 'business'
  },
  
  inventario: {
    id: 'inventario',
    name: 'Inventario',
    href: '/inventario',
    icon: Package,
    feature: 'inventario',
    description: 'Gestión de inventario y stock',
    roles: ['ADMIN', 'RECEPCIONISTA'],
    order: 12,
    category: 'business'
  },
  
  reportes: {
    id: 'reportes',
    name: 'Reportes',
    href: '/reportes',
    icon: BarChart3,
    feature: 'reportes',
    description: 'Reportes y análisis avanzados',
    roles: ['ADMIN'],
    order: 13,
    category: 'business'
  },
  
  aseguradoras: {
    id: 'aseguradoras',
    name: 'Aseguradoras',
    href: '/aseguradoras',
    icon: Shield,
    feature: 'aseguradoras',
    description: 'Gestión de aseguradoras',
    roles: ['ADMIN', 'RECEPCIONISTA'],
    order: 14,
    category: 'business'
  },
  
  morosidad: {
    id: 'morosidad',
    name: 'Morosidad',
    href: '/morosidad',
    icon: ClipboardList,
    feature: 'morosidad',
    description: 'Control de cuentas por cobrar',
    roles: ['ADMIN'],
    order: 15,
    category: 'business'
  },
  
  // MÓDULOS DE ADMINISTRACIÓN
  personal: {
    id: 'personal',
    name: 'Personal',
    href: '/personal',
    icon: UserCircle,
    feature: 'personal',
    description: 'Gestión de personal y usuarios',
    roles: ['ADMIN'],
    order: 16,
    category: 'admin'
  },
  
  configuracion: {
    id: 'configuracion',
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    feature: 'configuracion',
    description: 'Configuración del sistema',
    roles: ['ADMIN'],
    order: 17,
    category: 'admin',
    isCore: true
  },

  demo_modulos: {
    id: 'demo-modulos',
    name: 'Demo Módulos',
    href: '/demo-modulos',
    icon: Settings,
    feature: 'dashboard',
    description: 'Demostración del sistema modular',
    roles: ['ADMIN', 'DOCTOR', 'RECEPCIONISTA', 'AUXILIAR'],
    order: 18,
    category: 'admin',
    isCore: true
  }
};

// Función helper para obtener módulos filtrados
export function getAvailableModules(
  organizationFeatures: string[],
  userRole: string
): ModuleConfig[] {
  return Object.values(MODULES)
    .filter(module => {
      // Siempre mostrar módulos core
      if (module.isCore) return true;
      
      // Verificar si la organización tiene la feature
      if (!organizationFeatures.includes(module.feature)) return false;
      
      // Verificar permisos de rol
      if (module.roles && !module.roles.includes(userRole)) return false;
      
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

// Función helper para verificar acceso a un módulo específico
export function hasModuleAccess(
  moduleId: string,
  organizationFeatures: string[],
  userRole: string
): boolean {
  const module = MODULES[moduleId];
  if (!module) return false;
  
  // Módulos core siempre están disponibles
  if (module.isCore) return true;
  
  // Verificar feature de la organización
  if (!organizationFeatures.includes(module.feature)) return false;
  
  // Verificar permisos de rol
  if (module.roles && !module.roles.includes(userRole)) return false;
  
  return true;
}
