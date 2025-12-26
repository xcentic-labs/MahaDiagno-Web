/*
  Warnings:

  - A unique constraint covering the columns `[pharmacyVendorId]` on the table `withdraw` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pharmacyVendor" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "withdraw" ADD COLUMN     "pharmacyVendorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "withdraw_pharmacyVendorId_key" ON "withdraw"("pharmacyVendorId");

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_pharmacyVendorId_fkey" FOREIGN KEY ("pharmacyVendorId") REFERENCES "pharmacyVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
