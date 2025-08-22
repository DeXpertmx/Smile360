-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "includeOdontogram" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "odontogramaData" TEXT;
