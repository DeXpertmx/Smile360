-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AUXILIAR',
    "phone" TEXT,
    "especialidad" TEXT,
    "licencia" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permisos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "horarioTrabajo" JSONB,
    "tempPassword" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalComConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT,
    "calId" TEXT,
    "webhookId" TEXT,
    "webhookSecret" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "syncErrors" TEXT,
    "webhookUrl" TEXT,
    "webhookEvents" TEXT[] DEFAULT ARRAY['BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_RESCHEDULED']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalComConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "budgetId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Planificado',
    "priority" TEXT NOT NULL DEFAULT 'Media',
    "estimatedDuration" INTEGER,
    "estimatedSessions" INTEGER,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSession" (
    "id" TEXT NOT NULL,
    "treatmentPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tooth" TEXT,
    "surface" TEXT,
    "procedure" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "priority" TEXT NOT NULL DEFAULT 'Media',
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sessionNumber" INTEGER,
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "numeroExpediente" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "occupation" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "bloodType" TEXT,
    "allergies" TEXT,
    "medicalHistory" TEXT,
    "insuranceInfo" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Programada',
    "notes" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "calComBookingId" TEXT,
    "calComEventId" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "syncErrors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "doctorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "diagnosis" TEXT,
    "procedure" TEXT,
    "medications" TEXT,
    "instructions" TEXT,
    "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Planificado',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "budgetId" TEXT,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "treatmentId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashMovementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicSettings" (
    "id" TEXT NOT NULL,
    "clinicName" TEXT NOT NULL DEFAULT 'SmileSys Dental Clinic',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "language" TEXT NOT NULL DEFAULT 'es',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24',
    "workingHours" TEXT,
    "appointmentDuration" INTEGER NOT NULL DEFAULT 30,
    "appointmentBuffer" INTEGER NOT NULL DEFAULT 15,
    "maxAdvanceBooking" INTEGER NOT NULL DEFAULT 90,
    "appointmentReminders" TEXT,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxId" TEXT,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "invoiceFooter" TEXT,
    "paymentTerms" TEXT NOT NULL DEFAULT 'Inmediato',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false,
    "smtpServer" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 60,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 8,
    "requireTwoFactor" BOOLEAN NOT NULL DEFAULT false,
    "defaultPatientStatus" TEXT NOT NULL DEFAULT 'Activo',
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT NOT NULL DEFAULT 'diario',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalDocument" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "treatmentId" TEXT,
    "prescriptionNumber" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "professionalLicense" TEXT NOT NULL,
    "specialization" TEXT,
    "diagnosis" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "medications" TEXT NOT NULL,
    "template" TEXT,
    "notes" TEXT,
    "prescriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Activa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "treatmentId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tests" TEXT NOT NULL,
    "instructions" TEXT,
    "diagnosis" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "status" TEXT NOT NULL DEFAULT 'Solicitada',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "hasResults" BOOLEAN NOT NULL DEFAULT false,
    "resultsNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT,
    "url" TEXT,
    "content" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "description" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "medications" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "budgetNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "treatment" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Borrador',
    "validUntil" TIMESTAMP(3),
    "approvedDate" TIMESTAMP(3),
    "rejectedDate" TIMESTAMP(3),
    "convertedDate" TIMESTAMP(3),
    "notes" TEXT,
    "termsConditions" TEXT,
    "patientSignature" TEXT,
    "signatureDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "estimated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "brand" TEXT,
    "supplier" TEXT,
    "supplierCode" TEXT,
    "purchasePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "salePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresLot" BOOLEAN NOT NULL DEFAULT false,
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2),
    "reference" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "lotNumber" TEXT,
    "expirationDate" TIMESTAMP(3),
    "stockBefore" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "patientId" TEXT,
    "treatmentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialConsumption" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAlert" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmPatient" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'media',
    "status" TEXT NOT NULL DEFAULT 'prospecto',
    "assignedTo" TEXT,
    "currentTreatment" TEXT,
    "currentTreatmentType" TEXT,
    "budgetTotal" DECIMAL(10,2),
    "budgetStatus" TEXT,
    "lastContact" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextFollowUp" TIMESTAMP(3),
    "crmNotes" TEXT,
    "tags" TEXT,
    "convertedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmPatient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periodontogram" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Periodontograma',
    "examinationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "diagnosis" TEXT,
    "recommendations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'En_Proceso',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "riskLevel" TEXT,
    "treatmentPlan" TEXT,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Periodontogram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodontalMeasurement" (
    "id" TEXT NOT NULL,
    "periodontogramId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "pocketDepthMesial" INTEGER NOT NULL DEFAULT 0,
    "pocketDepthCentral" INTEGER NOT NULL DEFAULT 0,
    "pocketDepthDistal" INTEGER NOT NULL DEFAULT 0,
    "attachmentLevelMesial" INTEGER NOT NULL DEFAULT 0,
    "attachmentLevelCentral" INTEGER NOT NULL DEFAULT 0,
    "attachmentLevelDistal" INTEGER NOT NULL DEFAULT 0,
    "bleedingMesial" BOOLEAN NOT NULL DEFAULT false,
    "bleedingCentral" BOOLEAN NOT NULL DEFAULT false,
    "bleedingDistal" BOOLEAN NOT NULL DEFAULT false,
    "suppressionMesial" BOOLEAN NOT NULL DEFAULT false,
    "suppressionCentral" BOOLEAN NOT NULL DEFAULT false,
    "suppressionDistal" BOOLEAN NOT NULL DEFAULT false,
    "plaqueMesial" BOOLEAN NOT NULL DEFAULT false,
    "plaqueCentral" BOOLEAN NOT NULL DEFAULT false,
    "plaqueDistal" BOOLEAN NOT NULL DEFAULT false,
    "gingivalMarginMesial" INTEGER NOT NULL DEFAULT 0,
    "gingivalMarginCentral" INTEGER NOT NULL DEFAULT 0,
    "gingivalMarginDistal" INTEGER NOT NULL DEFAULT 0,
    "mobility" INTEGER NOT NULL DEFAULT 0,
    "furcationInvolvement" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodontalMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToothStatus" (
    "id" TEXT NOT NULL,
    "periodontogramId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Sano',
    "condition" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "surfaces" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "treatments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "colorCode" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "notes" TEXT,
    "treatmentStatus" TEXT NOT NULL DEFAULT 'No Aplica',
    "treatmentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToothStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodontalTreatment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "periodontogramId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "area" TEXT,
    "sessions" INTEGER NOT NULL DEFAULT 1,
    "completedSessions" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "nextSession" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Planificado',
    "results" TEXT,
    "complications" TEXT,
    "estimatedCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "actualCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "treatmentNotes" TEXT,
    "homeCarePlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodontalTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "contractNumber" TEXT,
    "contactPerson" TEXT,
    "paymentTerms" TEXT,
    "coveragePercentage" DECIMAL(5,2) DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientInsurance" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "groupNumber" TEXT,
    "memberNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "coverageType" TEXT NOT NULL DEFAULT 'Básica',
    "maxBenefit" DECIMAL(10,2),
    "usedBenefit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deductible" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "copayPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Activa',
    "primaryHolder" BOOLEAN NOT NULL DEFAULT true,
    "holderName" TEXT,
    "relationship" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCoverage" (
    "id" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "treatmentCode" TEXT NOT NULL,
    "treatmentName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "coveragePercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "maxAmount" DECIMAL(10,2),
    "frequency" TEXT,
    "ageRestriction" TEXT,
    "waitingPeriod" INTEGER,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAuthorization" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "patientInsuranceId" TEXT NOT NULL,
    "treatmentId" TEXT,
    "authNumber" TEXT NOT NULL,
    "treatmentCode" TEXT NOT NULL,
    "treatmentDescription" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "requestedAmount" DECIMAL(10,2) NOT NULL,
    "approvedAmount" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "diagnosis" TEXT,
    "notes" TEXT,
    "denialReason" TEXT,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceClaim" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "patientInsuranceId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "claimDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "chargedAmount" DECIMAL(10,2) NOT NULL,
    "allowedAmount" DECIMAL(10,2),
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "patientResponsibility" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Enviado',
    "treatmentCode" TEXT NOT NULL,
    "treatmentDescription" TEXT NOT NULL,
    "diagnosis" TEXT,
    "notes" TEXT,
    "denialReason" TEXT,
    "referenceNumber" TEXT,
    "submittedBy" TEXT NOT NULL,
    "submissionMethod" TEXT NOT NULL DEFAULT 'Electrónico',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "icon" TEXT,
    "monthlyBudget" DECIMAL(10,2),
    "yearlyBudget" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "expenseNumber" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "vendor" TEXT,
    "vendorContact" TEXT,
    "receiptNumber" TEXT,
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Efectivo',
    "bankAccount" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "taxDeductible" BOOLEAN NOT NULL DEFAULT false,
    "taxCategory" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringType" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "tags" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "parameters" TEXT NOT NULL,
    "filters" TEXT,
    "groupBy" TEXT,
    "sortBy" TEXT,
    "chartType" TEXT,
    "showChart" BOOLEAN NOT NULL DEFAULT true,
    "showTable" BOOLEAN NOT NULL DEFAULT true,
    "allowExport" BOOLEAN NOT NULL DEFAULT true,
    "exportFormats" TEXT[] DEFAULT ARRAY['PDF', 'Excel', 'CSV']::TEXT[],
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleFreq" TEXT,
    "scheduleTime" TEXT,
    "emailTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "description" TEXT,
    "responsibilities" TEXT,
    "requirements" TEXT,
    "minSalary" DECIMAL(10,2),
    "maxSalary" DECIMAL(10,2),
    "salaryType" TEXT NOT NULL DEFAULT 'Mensual',
    "level" TEXT NOT NULL DEFAULT 'Junior',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxOccupancy" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeNumber" TEXT NOT NULL,
    "positionId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT,
    "photo" TEXT,
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "gender" TEXT,
    "nationality" TEXT,
    "street" TEXT,
    "apartment" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'México',
    "phone" TEXT,
    "landline" TEXT,
    "personalEmail" TEXT,
    "email" TEXT NOT NULL,
    "position" TEXT,
    "professionalLicense" TEXT,
    "licenseDocument" TEXT,
    "university" TEXT,
    "degree" TEXT,
    "graduationDate" TIMESTAMP(3),
    "degreeDocument" TEXT,
    "specializations" TEXT,
    "certifications" TEXT,
    "insuranceNumber" TEXT,
    "insuranceCompany" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractType" TEXT NOT NULL DEFAULT 'Indefinido',
    "contractDocument" TEXT,
    "baseSalary" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "commissionStructure" TEXT,
    "bonusStructure" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "clabe" TEXT,
    "workSchedule" TEXT,
    "positionHistory" TEXT,
    "salaryHistory" TEXT,
    "endDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "username" TEXT,
    "password" TEXT,
    "systemRole" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessLog" TEXT,
    "requirePasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "trainingRecords" TEXT,
    "incidentRecords" TEXT,
    "emergencyContactName" TEXT,
    "emergencyRelationship" TEXT,
    "emergencyPhone" TEXT,
    "bloodType" TEXT,
    "allergies" TEXT,
    "chronicConditions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Activo',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceEvaluation" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "evaluationPeriod" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(3,2) NOT NULL,
    "technicalSkills" DECIMAL(3,2),
    "communication" DECIMAL(3,2),
    "teamwork" DECIMAL(3,2),
    "punctuality" DECIMAL(3,2),
    "initiative" DECIMAL(3,2),
    "strengths" TEXT,
    "improvements" TEXT,
    "goals" TEXT,
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Borrador',
    "evaluationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeRecord" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "breakTime" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DECIMAL(4,2),
    "recordType" TEXT NOT NULL DEFAULT 'Regular',
    "notes" TEXT,
    "location" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentOrderTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "requiresSignature" BOOLEAN NOT NULL DEFAULT true,
    "legalDisclaimer" TEXT,
    "termsConditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentOrderTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "budgetId" TEXT,
    "treatmentPlanId" TEXT,
    "templateId" TEXT,
    "procedureType" TEXT NOT NULL,
    "procedureDescription" TEXT NOT NULL,
    "treatmentDetails" TEXT NOT NULL,
    "diagnosis" TEXT,
    "risks" TEXT,
    "alternatives" TEXT,
    "postOperativeCare" TEXT,
    "expectedOutcome" TEXT,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "paymentTerms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "patientSignature" TEXT,
    "signatureDate" TIMESTAMP(3),
    "signatureIpAddress" TEXT,
    "witnessName" TEXT,
    "witnessSignature" TEXT,
    "hasInformedConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentDetails" TEXT,
    "pdfUrl" TEXT,
    "documentHash" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "payDate" TIMESTAMP(3),
    "regularHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "baseSalaryAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overtimeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "commissionsAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonusAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "socialSecurityDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deductionNotes" TEXT,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "payslipGenerated" BOOLEAN NOT NULL DEFAULT false,
    "payslipUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Mensual',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "payDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Abierto',
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "taxRate" DECIMAL(5,4),
    "ssRate" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "payrollRecordId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "earnedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentPeriod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionConfig" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "treatmentCommissionRate" DECIMAL(5,4),
    "budgetCommissionRate" DECIMAL(5,4),
    "referralCommissionRate" DECIMAL(5,4),
    "minimumAmount" DECIMAL(10,2),
    "paymentDelay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "staffMemberId" TEXT,
    "departmentId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "includeSalary" BOOLEAN NOT NULL DEFAULT true,
    "includeCommissions" BOOLEAN NOT NULL DEFAULT true,
    "includeBonuses" BOOLEAN NOT NULL DEFAULT true,
    "includeDeductions" BOOLEAN NOT NULL DEFAULT true,
    "includeHours" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "fileUrl" TEXT,
    "fileFormat" TEXT NOT NULL DEFAULT 'PDF',
    "generatedAt" TIMESTAMP(3),
    "generatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingPlan" (
    "id" TEXT NOT NULL,
    "planNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "budgetId" TEXT,
    "treatmentPlanId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "downPayment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "financedAmount" DECIMAL(12,2) NOT NULL,
    "numberOfPayments" INTEGER NOT NULL,
    "paymentFrequency" TEXT NOT NULL DEFAULT 'Mensual',
    "interestRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "paymentAmount" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstPaymentDate" TIMESTAMP(3) NOT NULL,
    "finalPaymentDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "approvalStatus" TEXT NOT NULL DEFAULT 'Por_Aprobar',
    "notes" TEXT,
    "terms" TEXT,
    "patientSignature" TEXT,
    "doctorSignature" TEXT,
    "signatureDate" TIMESTAMP(3),
    "guarantorName" TEXT,
    "guarantorPhone" TEXT,
    "guarantorEmail" TEXT,
    "guarantorAddress" TEXT,
    "allowPartialPayments" BOOLEAN NOT NULL DEFAULT true,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 5,
    "lateFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notifyBeforeDue" BOOLEAN NOT NULL DEFAULT true,
    "notifyDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingPayment" (
    "id" TEXT NOT NULL,
    "financingPlanId" TEXT NOT NULL,
    "paymentNumber" INTEGER NOT NULL,
    "scheduledAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "paymentMethod" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "lateFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "receiptNumber" TEXT,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelinquencyNotification" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "financingPlanId" TEXT,
    "financingPaymentId" TEXT,
    "invoiceId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "originalAmount" DECIMAL(12,2) NOT NULL,
    "overdueAmount" DECIMAL(12,2) NOT NULL,
    "lateFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalOwed" DECIMAL(12,2) NOT NULL,
    "originalDueDate" TIMESTAMP(3) NOT NULL,
    "daysOverdue" INTEGER NOT NULL,
    "nextActionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "priority" TEXT NOT NULL DEFAULT 'Media',
    "notificationMethod" TEXT,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "actionsTaken" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "assignedTo" TEXT,
    "followUpDate" TIMESTAMP(3),
    "autoGenerated" BOOLEAN NOT NULL DEFAULT true,
    "autoSend" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelinquencyNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelinquencySettings" (
    "id" TEXT NOT NULL,
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "firstNoticeDays" INTEGER NOT NULL DEFAULT 1,
    "secondNoticeDays" INTEGER NOT NULL DEFAULT 7,
    "finalNoticeDays" INTEGER NOT NULL DEFAULT 15,
    "legalNoticeDays" INTEGER NOT NULL DEFAULT 30,
    "enableLateFees" BOOLEAN NOT NULL DEFAULT true,
    "lateFeeType" TEXT NOT NULL DEFAULT 'fixed',
    "lateFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "lateFeeFrequency" TEXT NOT NULL DEFAULT 'once',
    "autoSendReminders" BOOLEAN NOT NULL DEFAULT true,
    "autoSendNotices" BOOLEAN NOT NULL DEFAULT false,
    "enableEmail" BOOLEAN NOT NULL DEFAULT true,
    "enableSMS" BOOLEAN NOT NULL DEFAULT false,
    "enableWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "enablePhone" BOOLEAN NOT NULL DEFAULT true,
    "reminderTemplate" TEXT,
    "firstNoticeTemplate" TEXT,
    "secondNoticeTemplate" TEXT,
    "finalNoticeTemplate" TEXT,
    "clinicPhone" TEXT,
    "clinicEmail" TEXT,
    "clinicAddress" TEXT,
    "contactHoursStart" TEXT NOT NULL DEFAULT '08:00',
    "contactHoursEnd" TEXT NOT NULL DEFAULT '18:00',
    "contactDays" TEXT[] DEFAULT ARRAY['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelinquencySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelinquencyAction" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "outcome" TEXT,
    "contactMethod" TEXT,
    "duration" INTEGER,
    "nextSteps" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelinquencyAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultInterestRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "defaultNumberOfPayments" INTEGER NOT NULL DEFAULT 12,
    "defaultPaymentFrequency" TEXT NOT NULL DEFAULT 'Mensual',
    "defaultDownPaymentPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "terms" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "requiresGuarantor" BOOLEAN NOT NULL DEFAULT false,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 5,
    "lateFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "minAmount" DECIMAL(12,2),
    "maxAmount" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashRegister" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "initialAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT,
    "responsibleUser" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "sessionId" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "patientId" TEXT,
    "invoiceId" TEXT,
    "expenseId" TEXT,
    "userId" TEXT NOT NULL,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "exchangeRate" DECIMAL(10,4),
    "originalAmount" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashSession" (
    "id" TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionNumber" TEXT NOT NULL,
    "openingBalance" DECIMAL(10,2) NOT NULL,
    "expectedClosing" DECIMAL(10,2) NOT NULL,
    "actualClosing" DECIMAL(10,2),
    "difference" DECIMAL(10,2),
    "totalIncome" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalExpense" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "workingDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABIERTA',
    "notes" TEXT,
    "discrepancyNotes" TEXT,
    "denominations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_key_key" ON "Configuration"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CalComConfig_userId_key" ON "CalComConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentPlan_budgetId_key" ON "TreatmentPlan"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_numeroExpediente_key" ON "Patient"("numeroExpediente");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_calComBookingId_key" ON "Appointment"("calComBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_prescriptionNumber_key" ON "Prescription"("prescriptionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_orderNumber_key" ON "LabOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_budgetNumber_key" ON "Budget"("budgetNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTransaction_transactionNumber_key" ON "InventoryTransaction"("transactionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CrmPatient_patientId_key" ON "CrmPatient"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_name_key" ON "InsuranceCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_code_key" ON "InsuranceCompany"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PreAuthorization_authNumber_key" ON "PreAuthorization"("authNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceClaim_claimNumber_key" ON "InsuranceClaim"("claimNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_code_key" ON "ExpenseCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_expenseNumber_key" ON "Expense"("expenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_userId_key" ON "StaffMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_employeeNumber_key" ON "StaffMember"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_email_key" ON "StaffMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_username_key" ON "StaffMember"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentOrder_orderNumber_key" ON "TreatmentOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRecord_staffMemberId_payrollPeriodId_key" ON "PayrollRecord"("staffMemberId", "payrollPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionConfig_staffMemberId_key" ON "CommissionConfig"("staffMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancingPlan_planNumber_key" ON "FinancingPlan"("planNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FinancingPlan_budgetId_key" ON "FinancingPlan"("budgetId");

-- CreateIndex
CREATE INDEX "FinancingPlan_patientId_idx" ON "FinancingPlan"("patientId");

-- CreateIndex
CREATE INDEX "FinancingPlan_doctorId_idx" ON "FinancingPlan"("doctorId");

-- CreateIndex
CREATE INDEX "FinancingPlan_status_idx" ON "FinancingPlan"("status");

-- CreateIndex
CREATE INDEX "FinancingPayment_financingPlanId_idx" ON "FinancingPayment"("financingPlanId");

-- CreateIndex
CREATE INDEX "FinancingPayment_dueDate_idx" ON "FinancingPayment"("dueDate");

-- CreateIndex
CREATE INDEX "FinancingPayment_status_idx" ON "FinancingPayment"("status");

-- CreateIndex
CREATE INDEX "DelinquencyNotification_patientId_idx" ON "DelinquencyNotification"("patientId");

-- CreateIndex
CREATE INDEX "DelinquencyNotification_status_idx" ON "DelinquencyNotification"("status");

-- CreateIndex
CREATE INDEX "DelinquencyNotification_priority_idx" ON "DelinquencyNotification"("priority");

-- CreateIndex
CREATE INDEX "DelinquencyNotification_originalDueDate_idx" ON "DelinquencyNotification"("originalDueDate");

-- CreateIndex
CREATE INDEX "DelinquencyNotification_assignedTo_idx" ON "DelinquencyNotification"("assignedTo");

-- CreateIndex
CREATE INDEX "DelinquencyAction_notificationId_idx" ON "DelinquencyAction"("notificationId");

-- CreateIndex
CREATE INDEX "DelinquencyAction_userId_idx" ON "DelinquencyAction"("userId");

-- CreateIndex
CREATE INDEX "DelinquencyAction_patientId_idx" ON "DelinquencyAction"("patientId");

-- CreateIndex
CREATE INDEX "DelinquencyAction_actionType_idx" ON "DelinquencyAction"("actionType");

-- CreateIndex
CREATE INDEX "CashRegister_isActive_idx" ON "CashRegister"("isActive");

-- CreateIndex
CREATE INDEX "CashMovement_cashRegisterId_idx" ON "CashMovement"("cashRegisterId");

-- CreateIndex
CREATE INDEX "CashMovement_sessionId_idx" ON "CashMovement"("sessionId");

-- CreateIndex
CREATE INDEX "CashMovement_type_idx" ON "CashMovement"("type");

-- CreateIndex
CREATE INDEX "CashMovement_movementDate_idx" ON "CashMovement"("movementDate");

-- CreateIndex
CREATE INDEX "CashSession_workingDate_idx" ON "CashSession"("workingDate");

-- CreateIndex
CREATE INDEX "CashSession_status_idx" ON "CashSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CashSession_cashRegisterId_sessionNumber_key" ON "CashSession"("cashRegisterId", "sessionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CashCategory_name_key" ON "CashCategory"("name");

-- CreateIndex
CREATE INDEX "CashCategory_type_isActive_idx" ON "CashCategory"("type", "isActive");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalComConfig" ADD CONSTRAINT "CalComConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentSession" ADD CONSTRAINT "TreatmentSession_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "TreatmentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cashMovementId_fkey" FOREIGN KEY ("cashMovementId") REFERENCES "CashMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalDocument" ADD CONSTRAINT "MedicalDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialConsumption" ADD CONSTRAINT "MaterialConsumption_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialConsumption" ADD CONSTRAINT "MaterialConsumption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmPatient" ADD CONSTRAINT "CrmPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periodontogram" ADD CONSTRAINT "Periodontogram_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periodontogram" ADD CONSTRAINT "Periodontogram_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodontalMeasurement" ADD CONSTRAINT "PeriodontalMeasurement_periodontogramId_fkey" FOREIGN KEY ("periodontogramId") REFERENCES "Periodontogram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToothStatus" ADD CONSTRAINT "ToothStatus_periodontogramId_fkey" FOREIGN KEY ("periodontogramId") REFERENCES "Periodontogram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodontalTreatment" ADD CONSTRAINT "PeriodontalTreatment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodontalTreatment" ADD CONSTRAINT "PeriodontalTreatment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodontalTreatment" ADD CONSTRAINT "PeriodontalTreatment_periodontogramId_fkey" FOREIGN KEY ("periodontogramId") REFERENCES "Periodontogram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCoverage" ADD CONSTRAINT "InsuranceCoverage_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAuthorization" ADD CONSTRAINT "PreAuthorization_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAuthorization" ADD CONSTRAINT "PreAuthorization_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAuthorization" ADD CONSTRAINT "PreAuthorization_patientInsuranceId_fkey" FOREIGN KEY ("patientInsuranceId") REFERENCES "PatientInsurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAuthorization" ADD CONSTRAINT "PreAuthorization_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceClaim" ADD CONSTRAINT "InsuranceClaim_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceClaim" ADD CONSTRAINT "InsuranceClaim_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceClaim" ADD CONSTRAINT "InsuranceClaim_patientInsuranceId_fkey" FOREIGN KEY ("patientInsuranceId") REFERENCES "PatientInsurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceClaim" ADD CONSTRAINT "InsuranceClaim_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeRecord" ADD CONSTRAINT "TimeRecord_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentOrder" ADD CONSTRAINT "TreatmentOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentOrder" ADD CONSTRAINT "TreatmentOrder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentOrder" ADD CONSTRAINT "TreatmentOrder_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentOrder" ADD CONSTRAINT "TreatmentOrder_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "TreatmentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentOrder" ADD CONSTRAINT "TreatmentOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TreatmentOrderTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionConfig" ADD CONSTRAINT "CommissionConfig_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingPlan" ADD CONSTRAINT "FinancingPlan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingPlan" ADD CONSTRAINT "FinancingPlan_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingPlan" ADD CONSTRAINT "FinancingPlan_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingPayment" ADD CONSTRAINT "FinancingPayment_financingPlanId_fkey" FOREIGN KEY ("financingPlanId") REFERENCES "FinancingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyNotification" ADD CONSTRAINT "DelinquencyNotification_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyNotification" ADD CONSTRAINT "DelinquencyNotification_financingPlanId_fkey" FOREIGN KEY ("financingPlanId") REFERENCES "FinancingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyNotification" ADD CONSTRAINT "DelinquencyNotification_financingPaymentId_fkey" FOREIGN KEY ("financingPaymentId") REFERENCES "FinancingPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyNotification" ADD CONSTRAINT "DelinquencyNotification_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyNotification" ADD CONSTRAINT "DelinquencyNotification_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyAction" ADD CONSTRAINT "DelinquencyAction_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "DelinquencyNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyAction" ADD CONSTRAINT "DelinquencyAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyAction" ADD CONSTRAINT "DelinquencyAction_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRegister" ADD CONSTRAINT "CashRegister_responsibleUser_fkey" FOREIGN KEY ("responsibleUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
