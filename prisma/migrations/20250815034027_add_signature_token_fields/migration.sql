-- AlterTable
ALTER TABLE "TreatmentOrder" ADD COLUMN     "signatureToken" TEXT,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3);
