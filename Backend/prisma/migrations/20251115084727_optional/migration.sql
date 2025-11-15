-- DropForeignKey
ALTER TABLE "partners" DROP CONSTRAINT "partners_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_zoneId_fkey";

-- AlterTable
ALTER TABLE "partners" ALTER COLUMN "zoneId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "zoneId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
