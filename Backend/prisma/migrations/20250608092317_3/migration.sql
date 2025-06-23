/*
  Warnings:

  - You are about to drop the column `IsSubscriptionBased` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `isRecivesByAdmin` on the `appointment` table. All the data in the column will be lost.
  - Made the column `userId` on table `appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `partnerId` on table `appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_addressId_fkey";

-- DropForeignKey
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_userId_fkey";

-- AlterTable
ALTER TABLE "appointment" DROP COLUMN "IsSubscriptionBased",
DROP COLUMN "isRecivesByAdmin",
ADD COLUMN     "isRecivesByPartner" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "addressId" DROP NOT NULL,
ALTER COLUMN "partnerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
