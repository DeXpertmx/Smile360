const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: '.env' });

async function testEmailConfiguration() {
  console.log('🧪 === PRUEBA DE CONFIGURACIÓN DE EMAIL ===\n');

  // Mostrar configuración (sin credenciales)
  console.log('📋 Configuración actual:');
  console.log({
    host: process.env.SMTP_HOST || '❌ No configurado',
    port: process.env.SMTP_PORT || '❌ No configurado', 
    secure: process.env.SMTP_SECURE || '❌ No configurado',
    user: process.env.SMTP_USER ? '✅ Configurado' : '❌ No configurado',
    password: process.env.SMTP_PASSWORD ? '✅ Configurado' : '❌ No configurado',
    from: process.env.SMTP_FROM || '❌ No configurado'
  });

  // Crear transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log('\n🔍 Verificando conexión SMTP...');
  
  try {
    // Verificar conexión
    await transporter.verify();
    console.log('✅ ¡Conexión SMTP exitosa!');

    // Enviar email de prueba
    console.log('\n📧 Enviando email de prueba...');
    
    const testEmail = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Enviar a la misma cuenta para prueba
      subject: '🧪 Prueba de Configuración SMTP - Smile 360',
      html: `
        <h1>¡Prueba Exitosa! 🎉</h1>
        <p>La configuración SMTP de Smile 360 está funcionando correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>Host:</strong> ${process.env.SMTP_HOST}</p>
        <p><strong>Puerto:</strong> ${process.env.SMTP_PORT}</p>
      `,
      text: `¡Prueba Exitosa! La configuración SMTP de Smile 360 está funcionando correctamente. Fecha: ${new Date().toLocaleString('es-ES')}`
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ ¡Email de prueba enviado exitosamente!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Enviado a:', testEmail.to);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.code) {
      console.error('🔍 Código de error:', error.code);
    }
    if (error.response) {
      console.error('📄 Respuesta del servidor:', error.response);
    }
  }

  console.log('\n🏁 === FIN DE LA PRUEBA ===');
}

// Ejecutar la prueba
testEmailConfiguration().catch(console.error);
