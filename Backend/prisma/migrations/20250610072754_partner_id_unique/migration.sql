/*
  Warnings:

  - A unique constraint covering the columns `[partnersId]` on the table `subscription_purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscription_purchase_partnersId_key" ON "subscription_purchase"("partnersId");
