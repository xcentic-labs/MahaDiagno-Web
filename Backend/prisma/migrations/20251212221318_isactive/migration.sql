-- AlterTable
ALTER TABLE "medicine" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "medicineCategory" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "medicineSubCategory" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "pharmacyVendor" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
