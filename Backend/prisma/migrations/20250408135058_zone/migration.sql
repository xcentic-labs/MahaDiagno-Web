-- CreateTable
CREATE TABLE "zone" (
    "id" SERIAL NOT NULL,
    "pincode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "zone_id_key" ON "zone"("id");

-- CreateIndex
CREATE UNIQUE INDEX "zone_pincode_key" ON "zone"("pincode");
