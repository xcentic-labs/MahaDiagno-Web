/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `patners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "patners_phoneNumber_key" ON "patners"("phoneNumber");
