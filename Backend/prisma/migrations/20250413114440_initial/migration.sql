-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SCHEDULED', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "zone" (
    "id" SERIAL NOT NULL,
    "pincode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "appointment" (
    "id" SERIAL NOT NULL,
    "patient_first_name" TEXT NOT NULL,
    "patient_last_name" TEXT NOT NULL,
    "patient_age" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "referring_doctor" TEXT NOT NULL,
    "additional_phone_number" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'SCHEDULED',
    "userId" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "acceptedBy" INTEGER NOT NULL,
    "addressId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "area" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lng" TEXT NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "banner_url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "serviceboy" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "zone_id_key" ON "zone"("id");

-- CreateIndex
CREATE UNIQUE INDEX "zone_pincode_key" ON "zone"("pincode");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_id_key" ON "appointment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "address_id_key" ON "address"("id");

-- CreateIndex
CREATE UNIQUE INDEX "services_id_key" ON "services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "serviceboy_id_key" ON "serviceboy"("id");

-- CreateIndex
CREATE UNIQUE INDEX "serviceboy_phoneNumber_key" ON "serviceboy"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admin_id_key" ON "admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "serviceboy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serviceboy" ADD CONSTRAINT "serviceboy_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
