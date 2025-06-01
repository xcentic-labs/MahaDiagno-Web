/*
  Warnings:

  - A unique constraint covering the columns `[phoneNuber]` on the table `patners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "patners_phoneNuber_key" ON "patners"("phoneNuber");
