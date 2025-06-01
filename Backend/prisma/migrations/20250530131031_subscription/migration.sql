-- CreateTable
CREATE TABLE "subscription" (
    "id" SERIAL NOT NULL,
    "subscriptionName" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "numberOfTimes" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "benefits" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "patners" (
    "id" SERIAL NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNuber" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "subscription_purchase" (
    "id" SERIAL NOT NULL,
    "patnerId" INTEGER NOT NULL,
    "noOfCouponLeft" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_id_key" ON "subscription"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patners_id_key" ON "patners"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_purchase_id_key" ON "subscription_purchase"("id");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_purchase" ADD CONSTRAINT "subscription_purchase_patnerId_fkey" FOREIGN KEY ("patnerId") REFERENCES "patners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_purchase" ADD CONSTRAINT "subscription_purchase_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
