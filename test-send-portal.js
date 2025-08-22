
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSendToPortal() {
  try {
    console.log('🔍 Probando funcionalidad de envío al portal...');
    
    // Obtener una orden de tratamiento pendiente
    const order = await prisma.treatmentOrder.findFirst({
      where: { status: 'Pendiente' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      console.log('❌ No se encontraron órdenes pendientes');
      return;
    }

    console.log(`✅ Orden encontrada: ${order.orderNumber} - ${order.procedureType}`);
    console.log(`👤 Paciente: ${order.patient.firstName} ${order.patient.lastName}`);
    
    // Generar token único
    const signatureToken = generateUniqueToken();
    console.log(`🔑 Token generado: ${signatureToken}`);
    
    // Actualizar la orden con el token
    const updatedOrder = await prisma.treatmentOrder.update({
      where: { id: order.id },
      data: {
        signatureToken,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Token válido por 7 días
      }
    });

    console.log('✅ Orden actualizada con token exitosamente');
    
    // Crear el enlace al portal
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const portalLink = `${baseUrl}/portal/sign/${order.id}?token=${signatureToken}`;
    
    console.log(`🔗 Enlace del portal: ${portalLink}`);
    
    console.log('\n📋 Resultado:');
    console.log({
      message: 'Orden enviada al portal del paciente',
      portalLink,
      patient: {
        name: `${order.patient.firstName} ${order.patient.lastName}`,
        email: order.patient.email,
        phone: order.patient.phone
      },
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    console.log('\n✅ Prueba completada exitosamente - No se encontraron errores');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

function generateUniqueToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Ejecutar la prueba
testSendToPortal();
