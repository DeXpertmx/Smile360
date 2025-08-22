

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Ensure environment variables are loaded
require('dotenv').config();

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🚀 Creando usuarios de prueba...');

  const testUsers = [
    {
      firstName: 'Admin',
      lastName: 'Smile360',
      email: 'admin@smile360.com',
      password: 'admin123',
      role: 'Administrador'
    },
    {
      firstName: 'Dr. María',
      lastName: 'García',
      email: 'dra.garcia@smilesys.com',
      password: 'doctor123',
      role: 'Dentista',
      especialidad: 'Ortodoncia',
      phone: '+57 300 123 4567'
    },
    {
      firstName: 'Dr. Carlos',
      lastName: 'Rodríguez',
      email: 'dr.rodriguez@smilesys.com',
      password: 'doctor123',
      role: 'Dentista',
      especialidad: 'Endodoncia',
      phone: '+57 301 234 5678'
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@smilesys.com',
      password: 'recep123',
      role: 'Recepcionista',
      phone: '+57 302 345 6789'
    },
    {
      firstName: 'Luis',
      lastName: 'Pérez',
      email: 'luis.perez@smilesys.com',
      password: 'recep123',
      role: 'Recepcionista',
      phone: '+57 303 456 7890'
    }
  ];

  const rolePermissions: Record<string, string[]> = {
    'Administrador': [
      'manage_staff',
      'view_all_patients',
      'manage_appointments',
      'view_financials',
      'manage_inventory',
      'system_settings',
      'export_reports',
      'manage_backups'
    ],
    'Dentista': [
      'view_assigned_patients',
      'manage_appointments',
      'create_treatments',
      'view_patient_history',
      'create_prescriptions',
      'manage_odontogram',
      'create_budgets'
    ],
    'Recepcionista': [
      'view_basic_patients',
      'schedule_appointments',
      'manage_calendar',
      'handle_payments',
      'basic_reports',
      'patient_communication'
    ]
  };

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (existingUser) {
        console.log(`❌ Usuario ${user.email} ya existe`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Create user
      const createdUser = await prisma.user.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          especialidad: user.especialidad || null,
          phone: user.phone || null,
          permisos: rolePermissions[user.role] || [],
          active: true,
          tempPassword: false
        }
      });

      console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`❌ Error creando usuario ${user.email}:`, error);
    }
  }

  // Create some test patients
  console.log('👥 Creando pacientes de prueba...');

  const testPatients = [
    {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '+57 310 123 4567',
      birthDate: new Date('1985-05-15'),
      gender: 'Masculino',
      address: 'Calle 123 #45-67',
      city: 'Bogotá'
    },
    {
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+57 311 234 5678',
      birthDate: new Date('1990-08-22'),
      gender: 'Femenino',
      address: 'Carrera 45 #67-89',
      city: 'Medellín'
    },
    {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+57 312 345 6789',
      birthDate: new Date('1978-12-03'),
      gender: 'Masculino',
      address: 'Avenida 67 #89-12',
      city: 'Cali'
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@email.com',
      phone: '+57 313 456 7890',
      birthDate: new Date('1995-03-10'),
      gender: 'Femenino',
      address: 'Diagonal 12 #34-56',
      city: 'Barranquilla'
    },
    {
      firstName: 'Luis',
      lastName: 'García',
      email: 'luis.garcia@email.com',
      phone: '+57 314 567 8901',
      birthDate: new Date('1988-07-18'),
      gender: 'Masculino',
      address: 'Transversal 89 #12-34',
      city: 'Cartagena'
    }
  ];

  let patientNumber = 1;
  for (const patient of testPatients) {
    try {
      const existingPatient = await prisma.patient.findFirst({
        where: { email: patient.email }
      });

      if (existingPatient) {
        console.log(`❌ Paciente ${patient.email} ya existe`);
        continue;
      }

      const numeroExpediente = `P${patientNumber.toString().padStart(6, '0')}`;
      
      const createdPatient = await prisma.patient.create({
        data: {
          ...patient,
          numeroExpediente,
          status: 'Activo'
        }
      });

      console.log(`✅ Paciente creado: ${patient.firstName} ${patient.lastName} (${numeroExpediente})`);
      patientNumber++;
    } catch (error) {
      console.error(`❌ Error creando paciente ${patient.firstName} ${patient.lastName}:`, error);
    }
  }

  console.log('🎉 Proceso completado!');
  console.log('\n📋 Credenciales de acceso:');
  console.log('• Administrador: admin@smilesys.com / admin123');
  console.log('• Doctora: dra.garcia@smilesys.com / doctor123');
  console.log('• Doctor: dr.rodriguez@smilesys.com / doctor123');
  console.log('• Recepcionista: ana.martinez@smilesys.com / recep123');
  console.log('• Recepcionista: luis.perez@smilesys.com / recep123');
}

createTestUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

