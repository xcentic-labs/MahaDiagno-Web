-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_userId_fkey";

-- AlterTable
ALTER TABLE "address" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "IsSubscriptionBased" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
