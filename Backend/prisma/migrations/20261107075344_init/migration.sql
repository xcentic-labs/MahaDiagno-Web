-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SCHEDULED', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('SCHEDULED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('cash', 'razorpay', 'subscriptionBased');

-- CreateEnum
CREATE TYPE "withdrawStatus" AS ENUM ('PENDING', 'SUCCESS', 'REJECTED');

-- CreateEnum
CREATE TYPE "medicineorderStatus" AS ENUM ('PLACED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "zone" (
    "id" SERIAL NOT NULL,
    "pincode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "banner_url" TEXT,
    "isHomeServiceAvail" BOOLEAN NOT NULL,
    "zoneId" INTEGER,
    "partnerId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "imageUrl" TEXT,
    "zoneId" INTEGER,
    "addressId" INTEGER NOT NULL,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "amount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "paymentMethod" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankeeName" TEXT NOT NULL,
    "partnerId" INTEGER,
    "doctorId" INTEGER,
    "pharmacyVendorId" INTEGER
);

-- CreateTable
CREATE TABLE "withdraw" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "withdrawStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethodId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnerId" INTEGER,
    "doctorId" INTEGER,
    "pharmacyVendorId" INTEGER
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
    "partnerId" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "acceptedBy" INTEGER,
    "addressId" INTEGER,
    "isReportUploaded" BOOLEAN NOT NULL DEFAULT false,
    "reportName" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "modeOfPayment" "Mode" NOT NULL DEFAULT 'cash',
    "isRecivesByPartner" BOOLEAN NOT NULL DEFAULT false,
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
    "userId" INTEGER
);

-- CreateTable
CREATE TABLE "serviceboy" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "partnerId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" SERIAL NOT NULL,
    "subscriptionName" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "timePeriod" INTEGER NOT NULL,
    "benefits" TEXT NOT NULL,
    "numberOfServiceBoys" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "subscription_purchase" (
    "id" SERIAL NOT NULL,
    "partnersId" INTEGER NOT NULL,
    "numberOfServiceBoyLeft" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "renewedAt" TIMESTAMP(3),
    "subscriptionId" INTEGER
);

-- CreateTable
CREATE TABLE "homeBanner" (
    "id" SERIAL NOT NULL,
    "imageName" TEXT NOT NULL
);

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
    "status" "DoctorStatus" NOT NULL DEFAULT 'SCHEDULED',
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

-- CreateTable
CREATE TABLE "pharmacyVendor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "addressId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "medicineCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "medicineSubCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "medicineCategoryId" INTEGER NOT NULL,
    "medicineSubCategoryId" INTEGER NOT NULL,
    "pharmacyVendorId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "modeOfPayment" "Mode" NOT NULL DEFAULT 'cash',
    "userId" INTEGER NOT NULL,
    "pharmacyVendorId" INTEGER NOT NULL,
    "addressId" INTEGER NOT NULL,
    "orderstatus" "medicineorderStatus" NOT NULL DEFAULT 'PLACED',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "razorpayRefundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "orderItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,
    "medicineId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "zone_id_key" ON "zone"("id");

-- CreateIndex
CREATE UNIQUE INDEX "zone_pincode_key" ON "zone"("pincode");

-- CreateIndex
CREATE UNIQUE INDEX "services_id_key" ON "services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "partners_id_key" ON "partners"("id");

-- CreateIndex
CREATE UNIQUE INDEX "partners_phoneNumber_key" ON "partners"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "paymentMethod_id_key" ON "paymentMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "paymentMethod_doctorId_key" ON "paymentMethod"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "paymentMethod_pharmacyVendorId_key" ON "paymentMethod"("pharmacyVendorId");

-- CreateIndex
CREATE UNIQUE INDEX "withdraw_id_key" ON "withdraw"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_id_key" ON "appointment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "address_id_key" ON "address"("id");

-- CreateIndex
CREATE UNIQUE INDEX "serviceboy_id_key" ON "serviceboy"("id");

-- CreateIndex
CREATE UNIQUE INDEX "serviceboy_phoneNumber_key" ON "serviceboy"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admin_id_key" ON "admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_id_key" ON "subscription"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_purchase_id_key" ON "subscription_purchase"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_purchase_partnersId_key" ON "subscription_purchase"("partnersId");

-- CreateIndex
CREATE UNIQUE INDEX "homeBanner_id_key" ON "homeBanner"("id");

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
CREATE UNIQUE INDEX "pharmacyVendor_id_key" ON "pharmacyVendor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacyVendor_phoneNumber_key" ON "pharmacyVendor"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "medicineCategory_id_key" ON "medicineCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "medicineSubCategory_id_key" ON "medicineSubCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_id_key" ON "medicine"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_id_key" ON "order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_razorpayOrderId_key" ON "order"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "order_razorpayPaymentId_key" ON "order"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "order_razorpayRefundId_key" ON "order"("razorpayRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "orderItem_id_key" ON "orderItem"("id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_pharmacyVendorId_fkey" FOREIGN KEY ("pharmacyVendorId") REFERENCES "pharmacyVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "paymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_pharmacyVendorId_fkey" FOREIGN KEY ("pharmacyVendorId") REFERENCES "pharmacyVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "serviceboy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serviceboy" ADD CONSTRAINT "serviceboy_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_purchase" ADD CONSTRAINT "subscription_purchase_partnersId_fkey" FOREIGN KEY ("partnersId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_purchase" ADD CONSTRAINT "subscription_purchase_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_pharmacyVendorId_fkey" FOREIGN KEY ("pharmacyVendorId") REFERENCES "pharmacyVendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
