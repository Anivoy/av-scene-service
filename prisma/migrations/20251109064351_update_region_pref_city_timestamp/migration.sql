/*
  Warnings:

  - Added the required column `updatedAt` to the `cities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `prefectures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `regions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `scene_images` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "cities" 
  ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3);

ALTER TABLE "prefectures" 
  ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3);

ALTER TABLE "regions" 
  ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3);

ALTER TABLE "scene_images" 
  ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "cities" SET "createdAt" = NOW(), "updatedAt" = NOW() WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;
UPDATE "prefectures" SET "createdAt" = NOW(), "updatedAt" = NOW() WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;
UPDATE "regions" SET "createdAt" = NOW(), "updatedAt" = NOW() WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;
UPDATE "scene_images" SET "createdAt" = NOW(), "updatedAt" = NOW() WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;

ALTER TABLE "cities" 
  ALTER COLUMN "createdAt" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "prefectures" 
  ALTER COLUMN "createdAt" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "regions" 
  ALTER COLUMN "createdAt" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "scene_images" 
  ALTER COLUMN "createdAt" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;
