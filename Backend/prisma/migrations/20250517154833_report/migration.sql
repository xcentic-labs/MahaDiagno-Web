-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "isReportUploaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportName" TEXT;

-- AlterTable
ALTER TABLE "serviceboy" ALTER COLUMN "status" SET DEFAULT false;
