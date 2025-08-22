
const fetch = require('node-fetch');

// Polyfill para fetch en Node.js
if (!global.fetch) {
  global.fetch = fetch;
}

async function testForgotPasswordFlow() {
  const baseUrl = 'http://localhost:3000';
  const testEmail = 'juan.paciente@test.com';

  console.log('🔍 Probando flujo completo de recuperación de contraseña...\n');

  try {
    // Paso 1: Verificar email
    console.log('1. Verificando email...');
    const verifyResponse = await fetch(`${baseUrl}/api/patient-portal/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    console.log(`   Status: ${verifyResponse.status}`);
    const verifyData = await verifyResponse.json();
    console.log(`   Respuesta: ${JSON.stringify(verifyData, null, 2)}`);

    if (!verifyResponse.ok) {
      console.log('❌ Error en verificación de email');
      return;
    }

    console.log('✅ Email verificado exitosamente\n');

    // Paso 2: Enviar solicitud de recuperación
    console.log('2. Enviando solicitud de recuperación...');
    const { patientId } = verifyData;
    
    const resetResponse = await fetch(`${baseUrl}/api/patients/${patientId}/send-password-reset`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Simular autenticación (necesaria para esta API)
        'Cookie': 'next-auth.session-token=test'
      },
      body: JSON.stringify({ email: testEmail }),
    });

    console.log(`   Status: ${resetResponse.status}`);
    const resetData = await resetResponse.json();
    console.log(`   Respuesta: ${JSON.stringify(resetData, null, 2)}`);

    if (resetResponse.ok) {
      console.log('✅ Email de recuperación enviado exitosamente!');
      console.log(`📧 Revisa el email ${testEmail} para el enlace de recuperación`);
    } else {
      console.log('❌ Error enviando email de recuperación:', resetData.error);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testForgotPasswordFlow();
