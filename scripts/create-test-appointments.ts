
import { PrismaClient } from '@prisma/client';

// Ensure environment variables are loaded
require('dotenv').config();

const prisma = new PrismaClient();

async function createTestAppointments() {
  console.log('🚀 Creando citas de prueba...');

  try {
    // Obtener usuarios (doctores) y pacientes
    const doctors = await prisma.user.findMany({
      where: { role: 'Dentista' }
    });

    const patients = await prisma.patient.findMany();

    if (doctors.length === 0) {
      console.log('❌ No hay doctores en el sistema');
      return;
    }

    if (patients.length === 0) {
      console.log('❌ No hay pacientes en el sistema');
      return;
    }

    // Limpiar citas existentes
    await prisma.appointment.deleteMany({});
    console.log('🧹 Citas existentes eliminadas');

    // Crear citas de prueba
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const testAppointments = [
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        date: today,
        startTime: '09:00',
        endTime: '09:30',
        type: 'Consulta',
        status: 'Programada',
        reason: 'Dolor en muela',
        duration: 30
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[0].id,
        date: today,
        startTime: '10:00',
        endTime: '10:30',
        type: 'Limpieza',
        status: 'Confirmada',
        reason: 'Limpieza rutinaria',
        duration: 30
      },
      {
        patientId: patients[2].id,
        doctorId: doctors[0].id,
        date: tomorrow,
        startTime: '11:00',
        endTime: '11:30',
        type: 'Revisión',
        status: 'Programada',
        reason: 'Control post-tratamiento',
        duration: 30
      },
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        date: nextWeek,
        startTime: '14:00',
        endTime: '15:00',
        type: 'Tratamiento',
        status: 'Programada',
        reason: 'Obturación',
        duration: 60
      }
    ];

    // Usar doctor adicional si está disponible
    if (doctors.length > 1 && patients.length >= 3) {
      testAppointments.push({
        patientId: patients[3].id,
        doctorId: doctors[1].id,
        date: today,
        startTime: '15:00',
        endTime: '15:30',
        type: 'Consulta',
        status: 'Programada',
        reason: 'Primera consulta',
        duration: 30
      });
    }

    // Crear las citas
    for (const appointment of testAppointments) {
      try {
        await prisma.appointment.create({
          data: appointment
        });
        console.log(`✅ Cita creada: ${appointment.type} - ${appointment.startTime}`);
      } catch (error) {
        console.log(`❌ Error creando cita: ${error}`);
      }
    }

    const totalAppointments = await prisma.appointment.count();
    console.log(`🎉 Total de citas creadas: ${totalAppointments}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAppointments();
