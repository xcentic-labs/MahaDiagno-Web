/*
  Warnings:

  - You are about to drop the column `numberOfTimes` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `noOfCouponLeft` on the `subscription_purchase` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `subscription_purchase` table. All the data in the column will be lost.
  - Added the required column `zoneId` to the `partners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isHomeServiceAvail` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partnerId` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zoneId` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfServiceBoys` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timePeriod` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `subscription_purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfServiceBoyLeft` to the `subscription_purchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "subscription_purchase" DROP CONSTRAINT "subscription_purchase_serviceId_fkey";

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zoneId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "isHomeServiceAvail" BOOLEAN NOT NULL,
ADD COLUMN     "partnerId" INTEGER NOT NULL,
ADD COLUMN     "zoneId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "numberOfTimes",
DROP COLUMN "serviceId",
ADD COLUMN     "numberOfServiceBoys" INTEGER NOT NULL,
ADD COLUMN     "timePeriod" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscription_purchase" DROP COLUMN "noOfCouponLeft",
DROP COLUMN "serviceId",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "numberOfServiceBoyLeft" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
