

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LogOut,
  Menu,
  X,
  UserCircle,
  ChevronDown,
  Users,
  Star,
  Shield
} from 'lucide-react';
import { useOrganizationFeatures } from '@/hooks/use-organization-features';
import { MODULE_CATEGORIES } from '@/config/modules';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { availableModules, organizationPlan, isLoading: featuresLoading } = useOrganizationFeatures();

  // Agrupar módulos por categoría
  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, typeof availableModules> = {};
    
    availableModules.forEach(module => {
      const category = module.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(module);
    });

    return grouped;
  }, [availableModules]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanDisplayName = (plan?: string) => {
    switch (plan) {
      case 'basic': return 'Básico';
      case 'pro': return 'Pro';
      case 'enterprise': return 'Enterprise';
      default: return 'Plan';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar para móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Image
                  src="/images/logo-smile360.png"
                  alt="Smile 360"
                  width={150}
                  height={50}
                  className="h-10 w-auto"
                />
              </div>
              <nav className="mt-5 px-2 space-y-2">
                {/* Plan Badge */}
                {organizationPlan && (
                  <div className="px-2 py-2">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(organizationPlan)}`}>
                      <Star className="w-3 h-3 mr-1" />
                      Plan {getPlanDisplayName(organizationPlan)}
                    </div>
                  </div>
                )}

                {/* Módulos por categoría */}
                {Object.entries(modulesByCategory).map(([category, modules]) => (
                  <div key={category} className="space-y-1">
                    {/* Header de categoría */}
                    {category !== 'core' && (
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors"
                      >
                        <span>{MODULE_CATEGORIES[category as keyof typeof MODULE_CATEGORIES] || category}</span>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${
                            collapsedCategories.includes(category) ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                    )}

                    {/* Módulos de la categoría */}
                    {(!collapsedCategories.includes(category) || category === 'core') && (
                      <div className="space-y-1">
                        {modules.map((module) => {
                          const isActive = pathname === module.href;
                          const Icon = module.icon;
                          
                          return (
                            <Link
                              key={module.id}
                              href={module.href}
                              className={`${
                                isActive
                                  ? 'bg-blue-100 border-r-4 border-blue-600 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                            >
                              <Icon
                                className={`${
                                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                } mr-3 flex-shrink-0 h-5 w-5`}
                              />
                              {module.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Si no hay módulos disponibles */}
                {availableModules.length === 0 && !featuresLoading && (
                  <div className="px-2 py-4 text-center text-gray-500">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No hay módulos disponibles</p>
                    <p className="text-xs text-gray-400 mt-1">Contacta al administrador</p>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-6">
              <Image
                src="/images/logo-smile360.png"
                alt="Smile 360"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-2">
              {/* Plan Badge */}
              {organizationPlan && (
                <div className="px-2 py-2">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(organizationPlan)}`}>
                    <Star className="w-3 h-3 mr-1" />
                    Plan {getPlanDisplayName(organizationPlan)}
                  </div>
                </div>
              )}

              {/* Módulos por categoría */}
              {Object.entries(modulesByCategory).map(([category, modules]) => (
                <div key={category} className="space-y-1">
                  {/* Header de categoría */}
                  {category !== 'core' && (
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors"
                    >
                      <span>{MODULE_CATEGORIES[category as keyof typeof MODULE_CATEGORIES] || category}</span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          collapsedCategories.includes(category) ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  )}

                  {/* Módulos de la categoría */}
                  {(!collapsedCategories.includes(category) || category === 'core') && (
                    <div className="space-y-1">
                      {modules.map((module) => {
                        const isActive = pathname === module.href;
                        const Icon = module.icon;
                        
                        return (
                          <Link
                            key={module.id}
                            href={module.href}
                            className={`${
                              isActive
                                ? 'bg-blue-100 border-r-4 border-blue-600 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                          >
                            <Icon
                              className={`${
                                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                              } mr-3 flex-shrink-0 h-5 w-5`}
                            />
                            {module.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Si no hay módulos disponibles */}
              {availableModules.length === 0 && !featuresLoading && (
                <div className="px-2 py-4 text-center text-gray-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay módulos disponibles</p>
                  <p className="text-xs text-gray-400 mt-1">Contacta al administrador</p>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header superior */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900 ml-2">
                      {availableModules.find(module => module.href === pathname)?.name || 'Smile360'}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Portal del Paciente Link */}
              <Link
                href="/portal/login"
                target="_blank"
                className="mr-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <Users className="w-4 h-4 mr-1" />
                Portal Paciente
              </Link>
              
              <div className="relative">
                <button
                  type="button"
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <UserCircle className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-sm font-medium text-gray-700">{session?.user?.name}</span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{session?.user?.name}</div>
                      <div className="text-gray-500">{session?.user?.email}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

