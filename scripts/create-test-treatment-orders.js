
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestTreatmentOrders() {
  try {
    console.log('🏥 Creando órdenes de tratamiento de prueba...');

    // Buscar pacientes y doctores existentes
    const patients = await prisma.patient.findMany({ take: 3 });
    const doctors = await prisma.user.findMany({ 
      where: { role: 'DOCTOR' },
      take: 2 
    });

    if (patients.length === 0 || doctors.length === 0) {
      console.log('❌ No se encontraron pacientes o doctores. Creando algunos de prueba...');
      
      // Crear un doctor de prueba
      const doctor = await prisma.user.create({
        data: {
          email: 'dr.test@smilesys.com',
          firstName: 'Dr. Juan',
          lastName: 'Pérez',
          role: 'DOCTOR',
          especialidad: 'Odontología General',
          active: true
        }
      });

      // Crear pacientes de prueba
      const patient1 = await prisma.patient.create({
        data: {
          numeroExpediente: 'EXP-001-TEST',
          firstName: 'María',
          lastName: 'García',
          email: 'maria.garcia@email.com',
          phone: '+1-555-0101',
          birthDate: new Date('1985-05-15'),
          address: 'Calle Principal 123',
          emergencyContact: 'Juan García',
          emergencyPhone: '+1-555-0102'
        }
      });

      const patient2 = await prisma.patient.create({
        data: {
          numeroExpediente: 'EXP-002-TEST',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          email: 'carlos.rodriguez@email.com',
          phone: '+1-555-0201',
          birthDate: new Date('1990-08-20'),
          address: 'Avenida Central 456',
          emergencyContact: 'Ana Rodríguez',
          emergencyPhone: '+1-555-0202'
        }
      });

      patients.push(patient1, patient2);
      doctors.push(doctor);
    }

    // Crear órdenes de tratamiento de prueba
    const treatmentOrders = [
      {
        procedureType: 'Implante Dental',
        procedureDescription: 'Colocación de implante dental en premolar superior derecho',
        treatmentDetails: 'Procedimiento quirúrgico para colocar implante de titanio en la zona del premolar superior derecho. Incluye:\n- Anestesia local\n- Preparación del lecho óseo\n- Colocación del implante\n- Sutura\n- Medicación post-operatoria\n\nTiempo estimado: 1-2 horas',
        diagnosis: 'Ausencia de premolar superior derecho por extracción previa. Hueso residual adecuado para implante.',
        risks: 'Riesgos mínimos asociados incluyen: sangrado temporal, inflamación, infección (menos del 2%), falla en la osteointegración (menos del 5%)',
        alternatives: 'Alternativas incluyen: prótesis removible parcial, puente dental fijo, no realizar tratamiento',
        postOperativeCare: 'Cuidados post-operatorios:\n- Aplicar hielo las primeras 24 horas\n- Evitar enjuagues vigorosos por 48 horas\n- Tomar medicación según prescripción\n- Dieta blanda por 7 días\n- Control en 7-10 días',
        expectedOutcome: 'Resultado esperado: implante completamente integrado en 3-6 meses, listo para colocación de corona definitiva',
        totalCost: 2500.00,
        paymentTerms: 'Pago inicial: $1,000 al momento de la cirugía. Saldo: $1,500 al momento de la colocación de la corona',
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        status: 'Pendiente'
      },
      {
        procedureType: 'Ortodoncia con Brackets',
        procedureDescription: 'Tratamiento ortodóncico completo con brackets metálicos',
        treatmentDetails: 'Tratamiento ortodóncico integral para corrección de malposición dental. Incluye:\n- Estudio ortodóncico completo\n- Colocación de brackets metálicos\n- Ajustes mensuales (24 meses aprox.)\n- Retenedores al finalizar\n\nDuración estimada: 18-24 meses',
        diagnosis: 'Apiñamiento dental moderado en ambas arcadas. Mordida cruzada posterior derecha.',
        risks: 'Riesgos asociados: molestias temporales, llagas menores, reabsorción radicular mínima (muy raro), descalcificación si hay mala higiene',
        alternatives: 'Alternativas incluyen: ortodoncia invisible (Invisalign), ortodoncia lingual, no realizar tratamiento',
        postOperativeCare: 'Cuidados durante el tratamiento:\n- Cepillado después de cada comida\n- Uso de hilo dental con enhebrador\n- Evitar alimentos duros y pegajosos\n- Usar cera ortodóncica si es necesario\n- Asistir a citas de control mensual',
        expectedOutcome: 'Resultado esperado: sonrisa alineada, mordida funcional correcta, mejora estética significativa',
        totalCost: 3200.00,
        paymentTerms: 'Pago inicial: $800. Pagos mensuales: $100 durante 24 meses',
        patientId: patients[1]?.id || patients[0].id,
        doctorId: doctors[0].id,
        status: 'Pendiente'
      },
      {
        procedureType: 'Blanqueamiento Dental Profesional',
        procedureDescription: 'Blanqueamiento dental en consultorio con gel de peróxido',
        treatmentDetails: 'Procedimiento de blanqueamiento profesional en consultorio. Incluye:\n- Evaluación del color inicial\n- Protección de encías\n- Aplicación de gel blanqueador (3 sesiones de 15 min)\n- Aplicación de flúor post-tratamiento\n- Kit de mantenimiento en casa\n\nTiempo total: 90 minutos',
        diagnosis: 'Tinción dental por café, té y envejecimiento natural. Dientes sanos aptos para blanqueamiento.',
        risks: 'Riesgos menores: sensibilidad dental temporal (24-48 horas), irritación leve de encías si hay contacto con gel',
        alternatives: 'Alternativas incluyen: blanqueamiento en casa con férulas, blanqueamiento con tiras, no realizar tratamiento',
        postOperativeCare: 'Cuidados post-blanqueamiento:\n- Evitar alimentos y bebidas con colorantes por 48 horas\n- Usar pasta dental para sensibilidad si es necesario\n- Mantener buena higiene oral\n- Kit de mantenimiento cada 3-6 meses',
        expectedOutcome: 'Resultado esperado: dientes 4-6 tonos más claros, sonrisa más brillante y juvenil',
        totalCost: 450.00,
        paymentTerms: 'Pago completo al momento del tratamiento',
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        status: 'Pendiente'
      }
    ];

    // Crear las órdenes
    for (const orderData of treatmentOrders) {
      await prisma.treatmentOrder.create({
        data: orderData
      });
      console.log(`✅ Orden creada: ${orderData.procedureType}`);
    }

    console.log('✅ ¡Órdenes de tratamiento de prueba creadas exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('- 3 órdenes de tratamiento pendientes de firma');
    console.log('- Diferentes tipos de procedimientos');
    console.log('- Listas para probar la funcionalidad de firma digital');
    console.log('\n🔗 Ahora puedes probar:');
    console.log('1. El botón "Firmar" en el módulo de órdenes');
    console.log('2. El botón "Enviar al Portal" para firma móvil');
    console.log('3. La firma desde el portal del paciente');

  } catch (error) {
    console.error('❌ Error creando órdenes de tratamiento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTreatmentOrders();
