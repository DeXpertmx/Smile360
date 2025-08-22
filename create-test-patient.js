
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestPatient() {
  const prisma = new PrismaClient();
  
  try {
    // Hash de una contraseña de prueba
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const patient = await prisma.patient.create({
      data: {
        firstName: 'Juan',
        lastName: 'Paciente',
        email: 'juan.paciente@test.com',
        phone: '+1234567890',
        status: 'Activo',
        hasPortalAccess: true,
        firstLoginCompleted: true,
        portalPassword: hashedPassword
      }
    });
    
    console.log('✅ Paciente de prueba creado exitosamente:');
    console.log(`   ID: ${patient.id}`);
    console.log(`   Nombre: ${patient.firstName} ${patient.lastName}`);
    console.log(`   Email: ${patient.email}`);
    console.log(`   Contraseña: password123`);
    console.log('');
    console.log('🧪 Ahora puedes probar la recuperación de contraseña con este email.');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Ya existe un paciente con este email. Usando el existente...');
      
      // Actualizar el paciente existente
      const patient = await prisma.patient.update({
        where: { email: 'juan.paciente@test.com' },
        data: {
          status: 'Activo',
          hasPortalAccess: true,
          firstLoginCompleted: true,
          portalPassword: await bcrypt.hash('password123', 12)
        }
      });
      
      console.log('✅ Paciente existente actualizado:');
      console.log(`   ID: ${patient.id}`);
      console.log(`   Email: ${patient.email}`);
      console.log(`   Contraseña: password123`);
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestPatient();
