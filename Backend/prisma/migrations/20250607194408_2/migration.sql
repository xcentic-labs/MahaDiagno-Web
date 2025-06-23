/*
  Warnings:

  - You are about to drop the column `zoneId` on the `serviceboy` table. All the data in the column will be lost.
  - Added the required column `partnerId` to the `serviceboy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "serviceboy" DROP CONSTRAINT "serviceboy_zoneId_fkey";

-- AlterTable
ALTER TABLE "serviceboy" DROP COLUMN "zoneId",
ADD COLUMN     "partnerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "serviceboy" ADD CONSTRAINT "serviceboy_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
