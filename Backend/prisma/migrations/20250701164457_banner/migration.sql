-- CreateTable
CREATE TABLE "homeBanner" (
    "id" SERIAL NOT NULL,
    "imageName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "homeBanner_id_key" ON "homeBanner"("id");
