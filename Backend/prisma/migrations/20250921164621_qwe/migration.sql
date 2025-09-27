/*
  Warnings:

  - The `status` column on the `doctorappointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('SCHEDULED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "doctorappointment" DROP COLUMN "status",
ADD COLUMN     "status" "DoctorStatus" NOT NULL DEFAULT 'SCHEDULED';
