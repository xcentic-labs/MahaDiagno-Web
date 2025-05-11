-- DropForeignKey
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_acceptedBy_fkey";

-- AlterTable
ALTER TABLE "appointment" ALTER COLUMN "acceptedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "serviceboy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
