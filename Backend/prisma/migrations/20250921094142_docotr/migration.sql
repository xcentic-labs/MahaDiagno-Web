/*
  Warnings:

  - A unique constraint covering the columns `[doctorId]` on the table `paymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "paymentMethod" DROP CONSTRAINT "paymentMethod_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "withdraw" DROP CONSTRAINT "withdraw_partnerId_fkey";

-- AlterTable
ALTER TABLE "paymentMethod" ADD COLUMN     "doctorId" INTEGER,
ALTER COLUMN "partnerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "withdraw" ADD COLUMN     "doctorId" INTEGER,
ALTER COLUMN "partnerId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "doctor" (
    "id" SERIAL NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "imageUrl" TEXT,
    "specializationId" INTEGER NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isfeatured" BOOLEAN NOT NULL DEFAULT false,
    "clinicName" TEXT,
    "clinicAddress" TEXT,
    "lat" TEXT,
    "lng" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "education" (
    "id" SERIAL NOT NULL,
    "courseName" TEXT NOT NULL,
    "universityName" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "experience" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT,
    "currentlyWorking" BOOLEAN NOT NULL DEFAULT false,
    "doctorId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "timings" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT DEFAULT '10:00',
    "endTime" TEXT DEFAULT '17:00',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "fee" INTEGER DEFAULT 0,
    "doctorId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "slots" (
    "id" SERIAL NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '10:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "timingsId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "doctorappointment" (
    "id" SERIAL NOT NULL,
    "patientFirstName" TEXT NOT NULL,
    "patientLastName" TEXT NOT NULL,
    "patientAge" INTEGER NOT NULL,
    "patientGender" "Gender" NOT NULL,
    "patientPhoneNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'SCHEDULED',
    "rpzOrderId" TEXT,
    "rpzRefundPaymentId" TEXT,
    "rpzPaymentId" TEXT,
    "date" TEXT NOT NULL,
    "slotId" INTEGER NOT NULL,
    "isRescheduled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prescriptionUrl" TEXT,
    "videoCallId" TEXT
);

-- CreateTable
CREATE TABLE "specialization" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "symptom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "specializationId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "patient" (
    "id" SERIAL NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_id_key" ON "doctor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_phoneNumber_key" ON "doctor"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "education_id_key" ON "education"("id");

-- CreateIndex
CREATE UNIQUE INDEX "experience_id_key" ON "experience"("id");

-- CreateIndex
CREATE UNIQUE INDEX "timings_id_key" ON "timings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "slots_id_key" ON "slots"("id");

-- CreateIndex
CREATE UNIQUE INDEX "doctorappointment_id_key" ON "doctorappointment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "doctorappointment_rpzOrderId_key" ON "doctorappointment"("rpzOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "doctorappointment_rpzRefundPaymentId_key" ON "doctorappointment"("rpzRefundPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "doctorappointment_rpzPaymentId_key" ON "doctorappointment"("rpzPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "specialization_id_key" ON "specialization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "symptom_id_key" ON "symptom"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_id_key" ON "patient"("id");

-- CreateIndex
CREATE UNIQUE INDEX "paymentMethod_doctorId_key" ON "paymentMethod"("doctorId");

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timings" ADD CONSTRAINT "timings_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_timingsId_fkey" FOREIGN KEY ("timingsId") REFERENCES "timings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorappointment" ADD CONSTRAINT "doctorappointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorappointment" ADD CONSTRAINT "doctorappointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorappointment" ADD CONSTRAINT "doctorappointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptom" ADD CONSTRAINT "symptom_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
