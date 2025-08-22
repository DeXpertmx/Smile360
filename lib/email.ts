
import nodemailer from 'nodemailer';

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailTemplate) {
  try {
    // Log de configuración para debugging (sin exponer credenciales)
    console.log('📧 Configuración SMTP:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? '✅ Configurado' : '❌ No configurado',
      from: process.env.SMTP_FROM,
      to: to
    });

    // Verificar conexión antes de enviar
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada exitosamente');

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SmileSys" <noreply@smilesys.com>',
      to,
      subject,
      html,
      text,
    });
    
    console.log('✅ Email enviado exitosamente:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error detallado enviando email:', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      code: error instanceof Error ? (error as any).code : undefined,
      response: error instanceof Error ? (error as any).response : undefined,
      to: to,
      subject: subject
    });
    
    return { success: false, error };
  }
}

export function generatePatientInvitationTemplate(
  patientName: string, 
  invitationUrl: string, 
  clinicName: string = 'SmileSys'
) {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido al Portal de Pacientes - ${clinicName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background: white;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-radius: 0 0 8px 8px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 14px;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>¡Bienvenido al Portal de Pacientes!</h1>
            <h2>${clinicName}</h2>
        </div>
        
        <div class="content">
            <h3>Hola ${patientName},</h3>
            
            <p>Nos complace informarte que ahora tienes acceso a nuestro Portal de Pacientes, donde podrás:</p>
            
            <ul>
                <li>📅 Ver tus citas programadas</li>
                <li>📋 Revisar tu historial médico</li>
                <li>💊 Consultar tus recetas</li>
                <li>📄 Firmar órdenes de tratamiento digitalmente</li>
                <li>💳 Ver y gestionar tus pagos</li>
                <li>📞 Contactar directamente con la clínica</li>
            </ul>
            
            <p>Para acceder por primera vez, haz clic en el siguiente botón y establece tu contraseña de acceso:</p>
            
            <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Configurar mi Acceso al Portal</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace es válido por 48 horas y solo puede usarse una vez. Si no configuras tu acceso dentro de este tiempo, deberás solicitar una nueva invitación.
            </div>
            
            <p>Si tienes alguna pregunta o problema para acceder, no dudes en contactarnos.</p>
            
            <p>¡Esperamos que disfrutes de la comodidad de nuestro portal!</p>
        </div>
        
        <div class="footer">
            <p><strong>${clinicName}</strong></p>
            <p>Este es un email automático, por favor no responder.</p>
        </div>
    </body>
    </html>
  `;

  const text = `
    Bienvenido al Portal de Pacientes - ${clinicName}
    
    Hola ${patientName},
    
    Nos complace informarte que ahora tienes acceso a nuestro Portal de Pacientes.
    
    Para acceder por primera vez, visita el siguiente enlace y establece tu contraseña:
    ${invitationUrl}
    
    Este enlace es válido por 48 horas y solo puede usarse una vez.
    
    Si tienes alguna pregunta, no dudes en contactarnos.
    
    Saludos,
    Equipo de ${clinicName}
  `;

  return { html, text };
}

export function generatePasswordResetTemplate(
  patientName: string, 
  resetUrl: string, 
  clinicName: string = 'SmileSys'
) {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña - ${clinicName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background: white;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-radius: 0 0 8px 8px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 14px;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .security-info {
                background: #e3f2fd;
                border: 1px solid #bbdefb;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Recuperar Contraseña</h1>
            <h2>${clinicName}</h2>
        </div>
        
        <div class="content">
            <h3>Hola ${patientName},</h3>
            
            <p>Hemos recibido una solicitud para recuperar tu contraseña del Portal de Pacientes.</p>
            
            <p>Para restablecer tu contraseña y recuperar el acceso a tu cuenta, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">🔑 Restablecer mi Contraseña</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace es válido por 1 hora por razones de seguridad. Si no restableces tu contraseña dentro de este tiempo, deberás solicitar un nuevo enlace.
            </div>
            
            <div class="security-info">
                <strong>🛡️ Información de Seguridad:</strong>
                <ul>
                    <li>Si no solicitaste este cambio de contraseña, puedes ignorar este email</li>
                    <li>Tu contraseña actual seguirá siendo válida hasta que completes el proceso</li>
                    <li>Nunca compartas este enlace con otras personas</li>
                </ul>
            </div>
            
            <p>Si continúas teniendo problemas para acceder a tu cuenta, contacta directamente con nuestra clínica.</p>
            
            <p><strong>Equipo de ${clinicName}</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>${clinicName}</strong></p>
            <p>Este es un email automático, por favor no responder.</p>
        </div>
    </body>
    </html>
  `;

  const text = `
    Recuperar Contraseña - ${clinicName}
    
    Hola ${patientName},
    
    Hemos recibido una solicitud para recuperar tu contraseña del Portal de Pacientes.
    
    Para restablecer tu contraseña, visita el siguiente enlace:
    ${resetUrl}
    
    Este enlace es válido por 1 hora por razones de seguridad.
    
    Si no solicitaste este cambio, puedes ignorar este email.
    
    Saludos,
    Equipo de ${clinicName}
  `;

  return { html, text };
}
