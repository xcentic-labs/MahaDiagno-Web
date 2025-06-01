/*
  Warnings:

  - You are about to drop the `patners` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscription_purchase" DROP CONSTRAINT "subscription_purchase_patnerId_fkey";

-- DropTable
DROP TABLE "patners";

-- CreateTable
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNuber" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_id_key" ON "partners"("id");

-- CreateIndex
CREATE UNIQUE INDEX "partners_phoneNuber_key" ON "partners"("phoneNuber");

-- AddForeignKey
ALTER TABLE "subscription_purchase" ADD CONSTRAINT "subscription_purchase_patnerId_fkey" FOREIGN KEY ("patnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
