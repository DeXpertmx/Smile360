
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Users,
  DollarSign,
  FileText,
  Shield,
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  MessageCircle,
  Clock,
  TrendingUp,
  Zap,
  Crown,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calculator,
  Activity,
  Receipt,
  Settings,
  Wallet,
  Package,
  ClipboardList,
  Stethoscope
} from 'lucide-react';
import { motion } from 'framer-motion';
import WhatsAppChat from './WhatsAppChat';
import { useScrollToSection } from '@/hooks/useScrollToSection';

// Componente Hero Section
const HeroSection = () => {
  const scrollToSection = useScrollToSection();
  
  return (
    <section className="min-h-screen smile360-gradient text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <Badge className="mb-4 bg-white/20 text-black border-white/30">
                🚀 Sistema #1 en gestión dental
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-black">
                Smile360
                <span className="block text-black/80">Gestión 360°</span>
                <span className="block text-2xl lg:text-3xl font-normal text-black/70">
                  para tu clínica dental
                </span>
              </h1>
            </div>
            
            <p className="text-xl text-black/80 leading-relaxed">
              La plataforma integral que revoluciona la gestión de clínicas dentales. 
              Desde la agenda hasta los reportes financieros, todo en una plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 group smile360-button"
                onClick={() => scrollToSection('demo')}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ver Demo Interactivo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black smile360-transition" 
                asChild
              >
                <Link href="/auth/register">
                  Probar 14 días gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-black">500+</div>
                <div className="text-black/70">Clínicas activas</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-black">50K+</div>
                <div className="text-black/70">Pacientes gestionados</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-black">4.9★</div>
                <div className="text-black/70">Valoración promedio</div>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden smile360-shadow-lg">
              <Image
                src="https://www.agneovo.com/wp-content/uploads/2025/03/01_Introduction-Why-Built-in-Displays-Are-the-Future-of-Digital-Dentistry.jpg"
                alt="Smile360 - Clínica dental moderna con tecnología digital"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 smile360-shadow text-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 smile360-bg-light rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 smile360-text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Sistema en línea</div>
                  <div className="text-xs text-gray-500">24/7 disponible</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Demo Interactivo
const InteractiveDemo = () => {
  const [activeModule, setActiveModule] = useState('agenda');

  const modules = {
    agenda: {
      title: 'Agenda Inteligente',
      description: 'Sistema avanzado de citas con sincronización y recordatorios automáticos',
      features: ['Calendario visual interactivo', 'Recordatorios SMS/WhatsApp automáticos', 'Sincronización con Google Calendar'],
      icon: Calendar,
      plan: 'basico'
    },
    patients: {
      title: 'Gestión de Pacientes',
      description: 'Base de datos completa con historiales médicos y documentación',
      features: ['Expedientes digitales completos', 'Documentos y archivos médicos', 'Historia clínica detallada'],
      icon: Users,
      plan: 'basico'
    },
    expedientes: {
      title: 'Expedientes Médicos',
      description: 'Documentación médica completa y organizada por paciente',
      features: ['Historial médico completo', 'Documentos digitales seguros', 'Acceso rápido y búsqueda'],
      icon: FileText,
      plan: 'basico'
    },
    odontograma: {
      title: 'Odontograma Digital',
      description: 'Herramienta visual para diagnósticos y tratamientos dentales',
      features: ['Odontograma interactivo', 'Diagnósticos por diente', 'Historial de tratamientos'],
      icon: Activity,
      plan: 'basico'
    },
    presupuestos: {
      title: 'Presupuestos y Cotizaciones',
      description: 'Genera presupuestos profesionales y cotizaciones detalladas',
      features: ['Presupuestos automáticos', 'Templates personalizables', 'Aprobación digital'],
      icon: Calculator,
      plan: 'basico'
    },
    ordenes: {
      title: 'Órdenes de Tratamiento',
      description: 'Planifica y organiza todos los tratamientos por paciente',
      features: ['Planificación de tratamientos', 'Seguimiento de progreso', 'Coordinación de equipo'],
      icon: ClipboardList,
      plan: 'basico'
    },
    facturacion: {
      title: 'Facturación CFDI',
      description: 'Sistema completo de facturación electrónica y control de pagos',
      features: ['Facturación CFDI México', 'Control de pagos e ingresos', 'Reportes fiscales'],
      icon: Receipt,
      plan: 'profesional'
    },
    periodontograma: {
      title: 'Periodontograma',
      description: 'Herramienta especializada para evaluación periodontal',
      features: ['Periodontograma completo', 'Mediciones especializadas', 'Seguimiento periodontal'],
      icon: BarChart3,
      plan: 'profesional'
    },
    inventario: {
      title: 'Control de Inventario',
      description: 'Gestión completa de materiales y suministros médicos',
      features: ['Inventario en tiempo real', 'Alertas de stock bajo', 'Control de vencimientos'],
      icon: Package,
      plan: 'enterprise'
    },
    gastos: {
      title: 'Control de Gastos',
      description: 'Administración financiera y control de gastos operativos',
      features: ['Registro de gastos', 'Categorización automática', 'Reportes financieros'],
      icon: Wallet,
      plan: 'enterprise'
    },
    personal: {
      title: 'Gestión de Personal',
      description: 'Administración completa del equipo médico y administrativo',
      features: ['Gestión de horarios', 'Control de roles y permisos', 'Nómina y pagos'],
      icon: Users,
      plan: 'enterprise'
    },
    aseguradoras: {
      title: 'Aseguradoras',
      description: 'Gestión de pólizas de seguros y reclamos médicos',
      features: ['Gestión de pólizas', 'Procesamiento de reclamos', 'Autorización de tratamientos'],
      icon: Shield,
      plan: 'enterprise'
    }
  };

  return (
    <section className="py-20 smile360-bg-light" id="demo">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 smile360-badge">Demo Interactivo</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Explora Smile360 en Acción
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo cada módulo de Smile360 puede transformar 
            la operación de tu clínica dental con tecnología de vanguardia
          </p>
        </div>

        {/* Plan Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-md text-sm font-medium">
              Plan Básico
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-yellow-600 rounded-md text-sm font-medium">
              Profesional
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-yellow-600 rounded-md text-sm font-medium">
              Enterprise
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Selector */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(modules).slice(0, 6).map(([key, module]) => {
              const IconComponent = module.icon;
              return (
                <Card 
                  key={key}
                  className={`cursor-pointer smile360-transition hover:shadow-md ${
                    activeModule === key ? 'ring-2 ring-yellow-400 smile360-bg-light' : 'hover:smile360-bg-light'
                  }`}
                  onClick={() => setActiveModule(key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activeModule === key ? 'smile360-gradient text-white' : 'bg-gray-100'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{module.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{module.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Demo Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full smile360-card">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold smile360-text-primary">
                      {modules[activeModule].title}
                    </h3>
                    <Badge className={`text-xs ${
                      modules[activeModule].plan === 'basico' ? 'bg-green-100 text-green-800' :
                      modules[activeModule].plan === 'profesional' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {modules[activeModule].plan === 'basico' ? 'Plan Básico' :
                       modules[activeModule].plan === 'profesional' ? 'Plan Profesional' :
                       'Plan Enterprise'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {modules[activeModule].description}
                  </p>
                </div>

                {/* Demo mockup */}
                <div className="aspect-video smile360-gradient-subtle rounded-lg flex items-center justify-center mb-6 border border-yellow-200">
                  <div className="text-center">
                    <div className="w-16 h-16 smile360-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                      {React.createElement(modules[activeModule].icon, { className: "w-8 h-8 text-black" })}
                    </div>
                    <p className="text-gray-600 mb-3">Vista previa del módulo {modules[activeModule].title}</p>
                    <Button className="smile360-button" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Ver demo completo
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 mb-3">Características principales:</h4>
                  {modules[activeModule].features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 smile360-text-primary flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Quieres ver todos los módulos disponibles?
          </p>
          <Button asChild size="lg" className="smile360-button">
            <Link href="#pricing">
              <ArrowRight className="w-4 h-4 mr-2" />
              Explorar todos los planes
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

// Comparador de Planes
const PricingComparison = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = {
    basic: {
      name: 'Básico',
      icon: CreditCard,
      monthly: 29,
      yearly: 290,
      description: 'Perfecto para clínicas pequeñas',
      features: [
        'Hasta 5 usuarios',
        'Hasta 500 pacientes',
        '✅ Agenda',
        '✅ Pacientes',
        '✅ Expedientes',
        '✅ Odontograma',
        '✅ Presupuestos',
        '✅ Órdenes de tratamiento',
        '✅ Consentimiento informado',
        '✅ Reportes básicos',
        '✅ Configuraciones básicas',
        'Soporte por email'
      ],
      popular: false
    },
    pro: {
      name: 'Profesional',
      icon: Zap,
      monthly: 59,
      yearly: 590,
      description: 'La opción más popular',
      features: [
        'Hasta 15 usuarios',
        'Hasta 2,000 pacientes',
        '✅ Todo del Plan Básico',
        '✅ Consentimiento informado',
        '✅ Facturación CFDI',
        '✅ Periodontograma',
        '✅ Reportes avanzados',
        '✅ Configuraciones avanzadas',
        '📱 WhatsApp integrado',
        'Soporte prioritario',
        'Integraciones API'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      icon: Crown,
      monthly: 99,
      yearly: 990,
      description: 'Para clínicas grandes',
      features: [
        'Usuarios ilimitados',
        'Pacientes ilimitados',
        '✅ Todo Plan Básico y Profesional',
        '✅ Consentimiento informado',
        '✅ Portal de pacientes',
        '✅ Personal (Staff)',
        '✅ Aseguradoras',
        '✅ Inventario',
        '✅ Gastos',
        '🏢 Multi-ubicación',
        'Soporte 24/7',
        'Gerente dedicado',
        'Capacitación incluida',
        'SLA garantizado'
      ],
      popular: false
    }
  };

  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 smile360-badge">Precios Transparentes</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Planes que Se Adaptan a Tu Clínica
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comienza con 14 días gratuitos. Sin compromiso, sin tarjeta de crédito.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center smile360-bg-light rounded-lg p-1 border border-yellow-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium smile360-transition ${
                billingCycle === 'monthly'
                  ? 'bg-white smile360-text-primary shadow-sm'
                  : 'text-gray-600 hover:smile360-text-primary'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium smile360-transition relative ${
                billingCycle === 'yearly'
                  ? 'bg-white smile360-text-primary shadow-sm'
                  : 'text-gray-600 hover:smile360-text-primary'
              }`}
            >
              Anual
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                -20%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(plans).map(([key, plan]) => {
            const IconComponent = plan.icon;
            const price = billingCycle === 'monthly' ? plan.monthly : plan.yearly;
            const saveAmount = billingCycle === 'yearly' ? (plan.monthly * 12 - plan.yearly) : 0;
            
            return (
              <Card 
                key={key}
                className={`relative smile360-card ${
                  plan.popular 
                    ? 'border-yellow-400 smile360-shadow-lg transform scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="smile360-gradient text-black font-semibold">
                      Más Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'smile360-gradient text-black' : 'bg-gray-100'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      ${price}
                      <span className="text-lg text-gray-600 font-normal">
                        /{billingCycle === 'monthly' ? 'mes' : 'año'}
                      </span>
                    </div>
                    {saveAmount > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        Ahorra ${saveAmount} al año
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 smile360-text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full smile360-transition ${
                      plan.popular 
                        ? 'smile360-button text-black' 
                        : 'bg-gray-800 hover:bg-gray-900 text-white'
                    }`}
                    asChild
                  >
                    <Link href="/auth/register">
                      Probar 14 días gratis
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Necesitas más información? 
            <Link href="#contact" className="smile360-text-primary hover:underline ml-1 font-medium">
              Habla con nuestro equipo
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

// Casos de Éxito y Testimonios
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Dr. María González',
      role: 'Directora - Clínica Dental Sonrisas',
      image: 'https://media.gettyimages.com/id/184288977/photo/smiling-mid-adult-female-wearing-lab-coat-arms-crossed.jpg?s=612x612&w=gi&k=20&c=RpN-WGeekkqAR91ipcNil2ZYWpdewjIAXJzCze5U18c=',
      content: 'Smile360 transformó completamente nuestra operación. Hemos reducido el tiempo administrativo en 60% y aumentado la satisfacción del paciente significativamente.',
      rating: 5,
      metrics: {
        timeReduction: '60%',
        patientSatisfaction: '+40%',
        revenue: '+25%'
      }
    },
    {
      name: 'Dr. Carlos Ruiz',
      role: 'Ortodoncista - Centro Dental Integral',
      image: 'https://media.gettyimages.com/id/183889293/photo/smiling-young-male-wearing-lab-coat-hands-in-pockets.jpg?s=612x612&w=gi&k=20&c=0wDytZ9w40hrtd3yxwl6R3FhwmQccb9RgMDXTDMMagg=',
      content: 'La integración de todos los módulos en una sola plataforma nos permitió optimizar procesos y mejorar la comunicación con nuestros pacientes.',
      rating: 5,
      metrics: {
        efficiency: '+50%',
        appointments: '+30%',
        costs: '-35%'
      }
    },
    {
      name: 'Dr. Michael Johnson',
      role: 'Director - SmileCare Dental Group',
      image: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTA4L2thdGV2NjQ0N19waG90b19vZl9hX2JsYWNrX2RlbnRpc3Rfc21pbGluZ19pbl9vZmZpY2VfaXNvbGF0ZWRfb180NWQzZTFiOC0wZDVkLTQ5OGMtOTI5My00ZjFlOWY0ZmQ5M2UucG5n.png',
      content: 'Desde que implementamos Smile360, nuestros ingresos aumentaron 35% y la gestión de múltiples ubicaciones se volvió muy sencilla.',
      rating: 5,
      metrics: {
        revenue: '+35%',
        locations: '5',
        satisfaction: '4.9★'
      }
    }
  ];

  return (
    <section className="py-20 smile360-bg-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 smile360-badge">Casos de Éxito</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 500 clínicas confían en Smile360 para gestionar 
            sus operaciones diarias y hacer crecer su negocio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="smile360-card bg-white hover:smile360-shadow-lg smile360-transition">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 smile360-text-primary fill-current" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 smile360-bg-light rounded-lg border border-yellow-100">
                  {Object.entries(testimonial.metrics).map(([key, value], idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-lg font-bold smile360-text-primary">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-yellow-200">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Calculadora de ROI
const ROICalculator = () => {
  const [formData, setFormData] = useState({
    patients: '',
    avgVisitValue: '',
    hoursPerWeek: '',
    currentSoftwareCost: ''
  });
  const [results, setResults] = useState(null);

  const calculateROI = () => {
    const patients = parseInt(formData.patients) || 0;
    const avgVisitValue = parseFloat(formData.avgVisitValue) || 0;
    const hoursPerWeek = parseFloat(formData.hoursPerWeek) || 0;
    const currentCost = parseFloat(formData.currentSoftwareCost) || 0;

    // Assumptions for calculations
    const timeReduction = 0.3; // 30% time reduction
    const patientIncrease = 0.15; // 15% patient increase
    const smile360Cost = 59; // Pro plan monthly

    const monthlyRevenue = patients * avgVisitValue;
    const timeSavings = hoursPerWeek * 4 * 25; // Hours saved per month * hourly rate
    const additionalRevenue = monthlyRevenue * patientIncrease;
    const costSavings = currentCost - smile360Cost;
    
    const totalMonthlySavings = timeSavings + additionalRevenue + costSavings;
    const yearlyROI = (totalMonthlySavings * 12) / (smile360Cost * 12) * 100;

    setResults({
      timeSavings,
      additionalRevenue,
      totalMonthlySavings,
      yearlyROI,
      paybackPeriod: (smile360Cost * 12) / (totalMonthlySavings * 12)
    });
  };

  return (
    <section className="py-20 smile360-bg-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 smile360-badge">Calculadora ROI</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Calcula Tu Retorno de Inversión
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cuánto puede ahorrar y generar tu clínica con Smile360
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Datos de tu Clínica
                </CardTitle>
                <CardDescription>
                  Ingresa la información básica de tu clínica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="patients">Pacientes activos por mes</Label>
                  <Input
                    id="patients"
                    type="number"
                    placeholder="ej. 200"
                    value={formData.patients}
                    onChange={(e) => setFormData(prev => ({...prev, patients: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="avgVisitValue">Valor promedio por consulta ($)</Label>
                  <Input
                    id="avgVisitValue"
                    type="number"
                    placeholder="ej. 150"
                    value={formData.avgVisitValue}
                    onChange={(e) => setFormData(prev => ({...prev, avgVisitValue: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="hoursPerWeek">Horas administrativas por semana</Label>
                  <Input
                    id="hoursPerWeek"
                    type="number"
                    placeholder="ej. 20"
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData(prev => ({...prev, hoursPerWeek: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="currentSoftwareCost">Costo actual de software ($)</Label>
                  <Input
                    id="currentSoftwareCost"
                    type="number"
                    placeholder="ej. 100"
                    value={formData.currentSoftwareCost}
                    onChange={(e) => setFormData(prev => ({...prev, currentSoftwareCost: e.target.value}))}
                  />
                </div>

                <Button 
                  onClick={calculateROI}
                  className="w-full"
                  disabled={!formData.patients || !formData.avgVisitValue}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Calcular ROI
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Resultados del ROI
                </CardTitle>
                <CardDescription>
                  Tu potencial de ahorro con Smile360
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${results.timeSavings?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Ahorro en tiempo/mes</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${results.additionalRevenue?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Ingresos adicionales/mes</div>
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                      <div className="text-3xl font-bold">
                        ${results.totalMonthlySavings?.toLocaleString()}
                      </div>
                      <div className="text-blue-100">Beneficio total mensual</div>
                      
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="text-xl font-bold">
                          ROI: {results.yearlyROI?.toFixed(0)}%
                        </div>
                        <div className="text-blue-100">Retorno anual sobre inversión</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                        <Link href="/auth/register">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Comenzar mi prueba gratuita
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Completa los datos para ver tu ROI personalizado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

// Chat en vivo / WhatsApp
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  return (
    <section className="py-20 bg-white" id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Contacto</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            ¿Listo para Transformar tu Clínica?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestro equipo está aquí para ayudarte. Contáctanos por el medio que prefieras.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Habla con Nuestro Equipo</h3>
              <p className="text-gray-600 mb-8">
                Estamos disponibles para resolver tus dudas y ayudarte a elegir 
                el plan perfecto para tu clínica.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">WhatsApp Business</h4>
                  <p className="text-gray-600 mb-3">Respuesta inmediata en horario laboral</p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open('https://wa.me/5215551234567?text=Hola, me interesa conocer más sobre Smile360', '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chatear en WhatsApp
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Teléfono</h4>
                  <p className="text-gray-600 mb-1">+52 (55) 1234-5678</p>
                  <p className="text-sm text-gray-500">Lun - Vie, 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-gray-600 mb-1">ventas@smilesys.com</p>
                  <p className="text-sm text-gray-500">Respuesta en menos de 2 horas</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4">¿Por qué elegir Smile360?</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">14 días</div>
                  <div className="text-sm text-gray-600">Prueba gratuita</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">Disponibilidad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600">Clínicas activas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">4.9★</div>
                  <div className="text-sm text-gray-600">Satisfacción</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Solicita una Demo Personalizada</CardTitle>
              <CardDescription>
                Te contactamos en menos de 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      placeholder="Dr. Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+52 55 1234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@clinica.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Cuéntanos sobre tu clínica</Label>
                  <Textarea
                    id="message"
                    placeholder="Número de consultorios, especialidades, personal, etc."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Solicitar Demo Gratuita
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar este formulario aceptas nuestra política de privacidad. 
                  No compartimos tu información con terceros.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Landing Page Component Principal
const LandingPage = () => {
  const scrollToSection = useScrollToSection();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b smile360-shadow">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 smile360-gradient rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold smile360-text-primary">Smile360</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('demo')} 
                className="text-gray-600 hover:smile360-text-primary smile360-transition font-medium"
              >
                Demo
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-gray-600 hover:smile360-text-primary smile360-transition font-medium"
              >
                Precios
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className="text-gray-600 hover:smile360-text-primary smile360-transition font-medium"
              >
                Casos de Éxito
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-gray-600 hover:smile360-text-primary smile360-transition font-medium"
              >
                Contacto
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hover:smile360-bg-light smile360-transition" asChild>
                <Link href="/auth/signin">Iniciar Sesión</Link>
              </Button>
              <Button className="smile360-button" asChild>
                <Link href="/auth/register">Prueba Gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <HeroSection />
      <div id="demo">
        <InteractiveDemo />
      </div>
      <div id="pricing">
        <PricingComparison />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <ROICalculator />
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 smile360-gradient rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold smile360-text-primary">Smile360</span>
              </div>
              <p className="text-gray-400">
                El sistema integral de gestión 360° para clínicas dentales modernas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Características</Link></li>
                <li><Link href="#" className="hover:text-white">Precios</Link></li>
                <li><Link href="#" className="hover:text-white">Integraciones</Link></li>
                <li><Link href="#" className="hover:text-white">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Centro de Ayuda</Link></li>
                <li><Link href="#" className="hover:text-white">Documentación</Link></li>
                <li><Link href="#" className="hover:text-white">Contacto</Link></li>
                <li><Link href="#" className="hover:text-white">Estado del Sistema</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white">Términos</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Smile360. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Chat Component */}
      <WhatsAppChat />
    </div>
  );
};

export default LandingPage;
