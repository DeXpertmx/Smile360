
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateToMultitenant() {
  console.log('🚀 Iniciando migración a multi-tenancy...');

  try {
    // 1. Crear planes de suscripción por defecto
    console.log('📋 Creando planes de suscripción...');
    
    const plans = [
      {
        name: 'Básico',
        slug: 'basic',
        description: 'Perfecto para clínicas pequeñas que inician',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        maxUsers: 5,
        maxPatients: 100,
        storageLimit: 5,
        features: [
          'Gestión de agenda',
          'Historia clínica digital',
          'Gestión de pacientes',
          'Tratamientos básicos',
          'Soporte por email'
        ],
        isActive: true,
        isPopular: false
      },
      {
        name: 'Profesional',
        slug: 'pro',
        description: 'Para clínicas en crecimiento con más funcionalidades',
        monthlyPrice: 59.99,
        yearlyPrice: 599.99,
        maxUsers: 15,
        maxPatients: 500,
        storageLimit: 25,
        features: [
          'Todo lo del plan Básico',
          'Inventario y stock',
          'Reportes avanzados',
          'Facturación electrónica',
          'WhatsApp integrado',
          'Soporte prioritario'
        ],
        isActive: true,
        isPopular: true
      },
      {
        name: 'Empresarial',
        slug: 'enterprise',
        description: 'Para grandes clínicas y cadenas dentales',
        monthlyPrice: 99.99,
        yearlyPrice: 999.99,
        maxUsers: -1,
        maxPatients: -1,
        storageLimit: 100,
        features: [
          'Todo lo del plan Profesional',
          'Usuarios ilimitados',
          'Pacientes ilimitados',
          'CRM avanzado',
          'API personalizada',
          'Soporte dedicado',
          'Capacitación incluida'
        ],
        isActive: true,
        isPopular: false
      }
    ];

    for (const plan of plans) {
      await prisma.subscriptionPlan.upsert({
        where: { slug: plan.slug },
        update: plan,
        create: plan
      });
    }

    console.log('✅ Planes de suscripción creados');

    // 2. Verificar si hay usuarios existentes
    const existingUsers = await prisma.user.findMany();
    
    if (existingUsers.length > 0) {
      console.log(`👥 Encontrados ${existingUsers.length} usuarios existentes`);
      
      // Crear organización por defecto para usuarios existentes
      console.log('🏢 Creando organización por defecto...');
      
      const defaultOrg = await prisma.organization.create({
        data: {
          name: 'Mi Clínica Dental',
          slug: 'mi-clinica-dental',
          email: existingUsers[0].email,
          phone: existingUsers[0].phone || '',
          country: 'MX',
          currency: 'MXN',
          language: 'es',
          plan: 'pro',
          status: 'active',
          maxUsers: 15,
          maxPatients: 500,
          ownerName: `${existingUsers[0].firstName} ${existingUsers[0].lastName}`.trim(),
          ownerEmail: existingUsers[0].email,
          ownerPhone: existingUsers[0].phone,
          features: [
            'agenda', 'pacientes', 'tratamientos', 
            'inventario', 'reportes', 'facturacion'
          ]
        }
      });

      console.log(`✅ Organización creada con ID: ${defaultOrg.id}`);

      // 3. Asignar todos los usuarios existentes a la organización por defecto
      console.log('👤 Asignando usuarios a la organización...');
      
      const updateResult = await prisma.user.updateMany({
        data: {
          organizationId: defaultOrg.id
        }
      });

      console.log(`✅ ${updateResult.count} usuarios asignados a la organización`);

      // 4. Asignar todos los pacientes existentes a la organización por defecto
      const existingPatients = await prisma.patient.findMany();
      
      if (existingPatients.length > 0) {
        console.log(`🏥 Asignando ${existingPatients.length} pacientes a la organización...`);
        
        const patientUpdateResult = await prisma.patient.updateMany({
          data: {
            organizationId: defaultOrg.id
          }
        });

        console.log(`✅ ${patientUpdateResult.count} pacientes asignados`);
      }

      // 5. Asignar citas existentes a la organización
      const existingAppointments = await prisma.appointment.findMany();
      
      if (existingAppointments.length > 0) {
        console.log(`📅 Asignando ${existingAppointments.length} citas a la organización...`);
        
        const appointmentUpdateResult = await prisma.appointment.updateMany({
          data: {
            organizationId: defaultOrg.id
          }
        });

        console.log(`✅ ${appointmentUpdateResult.count} citas asignadas`);
      }

      // 6. Asignar tratamientos existentes a la organización
      const existingTreatments = await prisma.treatment.findMany();
      
      if (existingTreatments.length > 0) {
        console.log(`💊 Asignando ${existingTreatments.length} tratamientos a la organización...`);
        
        const treatmentUpdateResult = await prisma.treatment.updateMany({
          data: {
            organizationId: defaultOrg.id
          }
        });

        console.log(`✅ ${treatmentUpdateResult.count} tratamientos asignados`);
      }

      console.log('🎉 Migración completada exitosamente!');
      console.log(`
📊 Resumen de la migración:
- Organización creada: ${defaultOrg.name} (${defaultOrg.slug})
- Usuarios migrados: ${updateResult.count}
- Pacientes migrados: ${existingPatients.length}
- Citas migradas: ${existingAppointments.length}
- Tratamientos migrados: ${existingTreatments.length}

🔑 Credenciales de acceso:
- URL: /${defaultOrg.slug}/auth/signin
- Email: ${existingUsers[0].email}
- La contraseña permanece igual
      `);

    } else {
      console.log('ℹ️  No se encontraron usuarios existentes. El sistema está listo para nuevos registros.');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateToMultitenant()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

export { migrateToMultitenant };
