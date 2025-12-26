/*
  Warnings:

  - A unique constraint covering the columns `[razorpayOrderId]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayRefundId]` on the table `order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpayRefundId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "order_razorpayOrderId_key" ON "order"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "order_razorpayPaymentId_key" ON "order"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "order_razorpayRefundId_key" ON "order"("razorpayRefundId");
