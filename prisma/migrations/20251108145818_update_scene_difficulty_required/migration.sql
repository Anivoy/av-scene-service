/*
  Warnings:

  - Made the column `difficultyId` on table `scenes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "scenes" DROP CONSTRAINT "scenes_difficultyId_fkey";

-- AlterTable
ALTER TABLE "scenes" ALTER COLUMN "difficultyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_difficultyId_fkey" FOREIGN KEY ("difficultyId") REFERENCES "difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
