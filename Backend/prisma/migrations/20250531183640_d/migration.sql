/*
  Warnings:

  - You are about to drop the column `patnerId` on the `subscription_purchase` table. All the data in the column will be lost.
  - Added the required column `partnersId` to the `subscription_purchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscription_purchase" DROP CONSTRAINT "subscription_purchase_patnerId_fkey";

-- AlterTable
ALTER TABLE "subscription_purchase" DROP COLUMN "patnerId",
ADD COLUMN     "partnersId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "subscription_purchase" ADD CONSTRAINT "subscription_purchase_partnersId_fkey" FOREIGN KEY ("partnersId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
