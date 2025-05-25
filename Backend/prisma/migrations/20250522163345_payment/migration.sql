-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('cash', 'razorpay');

-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modeOfPayment" "Mode" NOT NULL DEFAULT 'cash';
