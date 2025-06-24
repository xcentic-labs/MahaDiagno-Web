-- CreateEnum
CREATE TYPE "withdrawStatus" AS ENUM ('PENDING', 'SUCCESS', 'REJECTED');

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "paymentMethod" (
    "id" SERIAL NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankeeName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "withdraw" (
    "id" SERIAL NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "withdrawStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethodId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "paymentMethod_id_key" ON "paymentMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "withdraw_id_key" ON "withdraw"("id");

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "paymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
