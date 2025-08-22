
import { getServerAuthSession } from '@/lib/auth';
import { MODULES, hasModuleAccess } from '@/config/modules';

/**
 * Verifica si el usuario actual tiene acceso a un módulo específico
 * Para uso en Server Components y API routes
 */
export async function checkModuleAccess(moduleId: string): Promise<{
  hasAccess: boolean;
  session: any;
  redirectUrl?: string;
}> {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return {
      hasAccess: false,
      session: null,
      redirectUrl: '/auth/signin'
    };
  }

  const organizationFeatures = session.user.organizationFeatures || [];
  const userRole = session.user.role;

  const access = hasModuleAccess(moduleId, organizationFeatures, userRole);

  return {
    hasAccess: access,
    session,
    redirectUrl: access ? undefined : '/dashboard'
  };
}

/**
 * Middleware helper para proteger API routes
 */
export function withModuleAccess(moduleId: string) {
  return async function middleware(handler: Function) {
    return async function(req: any, ...args: any[]) {
      const { hasAccess, session } = await checkModuleAccess(moduleId);

      if (!hasAccess) {
        return new Response(
          JSON.stringify({ 
            error: 'Acceso denegado', 
            message: `No tienes permisos para acceder al módulo ${moduleId}` 
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Agregar la sesión al contexto
      req.session = session;
      return handler(req, ...args);
    };
  };
}

/**
 * Obtiene la configuración de un módulo
 */
export function getModuleConfig(moduleId: string) {
  return MODULES[moduleId] || null;
}

/**
 * Obtiene todos los módulos disponibles para una organización y rol
 */
export function getAvailableModulesForUser(organizationFeatures: string[], userRole: string) {
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
