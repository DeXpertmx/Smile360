
# Configuración del Portal de Pacientes

## Funcionalidad Implementada

El sistema ahora incluye un portal de pacientes completo con invitaciones por email:

### 🔧 **Configuración de Email**

Para que funcionen las invitaciones por email, configura las siguientes variables en tu archivo `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-contraseña-de-aplicación"
SMTP_FROM="SmileSys <noreply@smilesys.com>"
```

#### Para Gmail:
1. Activa la verificación en 2 pasos
2. Genera una "Contraseña de aplicación"
3. Usa esa contraseña en `SMTP_PASSWORD`

### 📧 **Flujo de Invitación**

1. **Creación de Paciente**: Al crear un paciente con email, automáticamente se envía una invitación
2. **Email de Invitación**: El paciente recibe un email con un enlace seguro
3. **Configuración de Acceso**: El paciente configura su contraseña en `/portal/setup?token=...`
4. **Acceso al Portal**: El paciente puede acceder en `/portal/login`

### 🛡️ **Seguridad**

- Tokens únicos con expiración de 48 horas
- Contraseñas hasheadas con bcrypt
- Validación de sesiones con JWT
- Un token por paciente (se regenera si se reenvía)

### 📱 **URLs del Sistema**

- **Portal de Pacientes**: `/portal/login`
- **Configuración Inicial**: `/portal/setup?token=TOKEN`
- **Dashboard del Paciente**: `/portal/`

### 🔧 **APIs Disponibles**

- `POST /api/patient-invitation/validate` - Validar token de invitación
- `POST /api/patient-invitation/complete` - Completar configuración
- `POST /api/patient-portal/auth` - Autenticar paciente
- `POST /api/patients/[id]/send-invitation` - Reenviar invitación

### 📋 **Base de Datos**

Se agregaron los siguientes campos al modelo `Patient`:
```prisma
hasPortalAccess     Boolean   @default(false)
portalPassword      String?
firstLoginCompleted Boolean   @default(false)
invitationSent      Boolean   @default(false)
invitationSentAt    DateTime?
```

Y el nuevo modelo `PatientInvitation`:
```prisma
model PatientInvitation {
  id        String   @id @default(cuid())
  patientId String   @unique
  token     String   @unique
  expires   DateTime
  isUsed    Boolean  @default(false)
  usedAt    DateTime?
  createdAt DateTime @default(now())
  patient   Patient  @relation("PatientInvitation")
}
```

### 🎨 **Componentes de UI**

- `PatientInvitationStatus` - Muestra el estado de invitación y permite reenviar
- Páginas completas del portal con diseño responsive
- Integración con el sistema de design existente

### ✅ **Funciones Implementadas**

- ✅ Invitación automática al crear paciente con email
- ✅ Email con template HTML profesional
- ✅ Configuración segura de contraseña
- ✅ Login de pacientes
- ✅ Portal básico con información del paciente
- ✅ Reenvío de invitaciones
- ✅ Validación de tokens y sesiones
- ✅ Manejo de errores y estados de carga

### 🔄 **Próximos Pasos Sugeridos**

1. Integrar con el módulo de citas existente
2. Mostrar documentos del paciente (recetas, órdenes)
3. Sistema de notificaciones
4. Actualización de información personal
5. Solicitud de citas desde el portal
