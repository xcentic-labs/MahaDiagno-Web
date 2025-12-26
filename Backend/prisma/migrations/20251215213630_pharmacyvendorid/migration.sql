/*
  Warnings:

  - A unique constraint covering the columns `[pharmacyVendorId]` on the table `paymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "paymentMethod" ADD COLUMN     "pharmacyVendorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "paymentMethod_pharmacyVendorId_key" ON "paymentMethod"("pharmacyVendorId");

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_pharmacyVendorId_fkey" FOREIGN KEY ("pharmacyVendorId") REFERENCES "pharmacyVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
