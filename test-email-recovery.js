
const nodemailer = require('nodemailer');

// Configuración SMTP exactamente como en la aplicación
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false, // false para puerto 587
  auth: {
    user: "noreplay@dimensionexpert.com",
    pass: "Ee4d1581e3016a0f9acce10044f6fbfe/"
  },
});

async function testPasswordRecoveryEmail() {
  console.log('🧪 Iniciando prueba de email de recuperación de contraseña...\n');

  try {
    // 1. Verificar conexión SMTP
    console.log('1. Verificando conexión SMTP...');
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada exitosamente\n');

    // 2. Generar un email de prueba
    const testEmail = "test@example.com"; // Cambia por un email real para pruebas
    const resetToken = "test123456789";
    const resetUrl = `http://localhost:3000/portal/reset-password?token=${resetToken}`;

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Recuperar Contraseña - Smile 360</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>🔐 Recuperar Contraseña</h1>
            <h2>Smile 360</h2>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <h3>Hola Paciente de Prueba,</h3>
            
            <p>Hemos recibido una solicitud para recuperar tu contraseña del Portal de Pacientes.</p>
            
            <p>Para restablecer tu contraseña y recuperar el acceso a tu cuenta, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                    🔑 Restablecer mi Contraseña
                </a>
            </div>
            
            <p><strong>⚠️ Importante:</strong> Este enlace es válido por 1 hora por razones de seguridad.</p>
            
            <p>Si no solicitaste este cambio de contraseña, puedes ignorar este email.</p>
            
            <p><strong>Equipo de Smile 360</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
            <p><strong>Smile 360</strong></p>
            <p>Este es un email automático, por favor no responder.</p>
        </div>
    </body>
    </html>
    `;

    console.log('2. Enviando email de prueba de recuperación...');
    const info = await transporter.sendMail({
      from: '"Smile 360" <noreplay@dimensionexpert.com>',
      to: testEmail,
      subject: 'Recuperar Contraseña - Smile 360 Portal de Pacientes (PRUEBA)',
      html: html,
      text: `
      Recuperar Contraseña - Smile 360

      Hola Paciente de Prueba,

      Para restablecer tu contraseña, visita: ${resetUrl}

      Este enlace es válido por 1 hora.

      Si no solicitaste este cambio, puedes ignorar este email.

      Equipo de Smile 360
      `
    });

    console.log('✅ Email de recuperación enviado exitosamente!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Destinatario: ${testEmail}`);
    console.log(`🔗 URL de recuperación: ${resetUrl}\n`);

    console.log('🎉 RESULTADO: El sistema de envío de emails funciona correctamente!');
    console.log('💡 Si no recibes el email, revisa la carpeta de spam o cambia el email de prueba por uno real.');

  } catch (error) {
    console.error('❌ Error en la prueba de email:', error);
    console.error('🔍 Detalles del error:');
    console.error(`   - Mensaje: ${error.message}`);
    console.error(`   - Código: ${error.code || 'N/A'}`);
    console.error(`   - Response: ${error.response || 'N/A'}`);
  }
}

testPasswordRecoveryEmail();
