
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPatients() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        status: 'Activo',
        hasPortalAccess: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        firstLoginCompleted: true
      },
      take: 5
    });
    
    console.log('Pacientes activos con acceso al portal:');
    patients.forEach(p => {
      console.log(`- ${p.firstName} ${p.lastName} (${p.email}) - Login completado: ${p.firstLoginCompleted}`);
    });
    
    return patients;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatients();
