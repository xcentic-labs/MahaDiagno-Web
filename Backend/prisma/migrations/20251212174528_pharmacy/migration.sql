-- AlterEnum
ALTER TYPE "DoctorStatus" ADD VALUE 'REJECTED';

-- CreateTable
CREATE TABLE "pharmacyVendor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "addressId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "medicineCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "medicineSubCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "medicineCategoryId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "medicine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "quantityDescription" TEXT NOT NULL,
    "medicineCategoryId" INTEGER NOT NULL,
    "medicineSubCategoryId" INTEGER NOT NULL,
    "pharmacyVendorId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "pharmacyVendor_id_key" ON "pharmacyVendor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacyVendor_phoneNumber_key" ON "pharmacyVendor"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "medicineCategory_id_key" ON "medicineCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "medicineSubCategory_id_key" ON "medicineSubCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_id_key" ON "medicine"("id");

-- AddForeignKey
ALTER TABLE "pharmacyVendor" ADD CONSTRAINT "pharmacyVendor_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicineSubCategory" ADD CONSTRAINT "medicineSubCategory_medicineCategoryId_fkey" FOREIGN KEY ("medicineCategoryId") REFERENCES "medicineCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_medicineCategoryId_fkey" FOREIGN KEY ("medicineCategoryId") REFERENCES "medicineCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_medicineSubCategoryId_fkey" FOREIGN KEY ("medicineSubCategoryId") REFERENCES "medicineSubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_pharmacyVendorId_fkey" FOREIGN KEY ("pharmacyVendorId") REFERENCES "pharmacyVendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
