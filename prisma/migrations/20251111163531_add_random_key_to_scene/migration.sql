-- AlterTable
ALTER TABLE "scenes" ADD COLUMN     "randomKey" DOUBLE PRECISION NOT NULL DEFAULT random();

-- CreateIndex
CREATE INDEX "scenes_randomKey_idx" ON "scenes"("randomKey");
