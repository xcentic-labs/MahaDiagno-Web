-- AlterTable
ALTER TABLE "subscription_purchase" ADD COLUMN     "subscriptionId" INTEGER;

-- AddForeignKey
ALTER TABLE "subscription_purchase" ADD CONSTRAINT "subscription_purchase_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
