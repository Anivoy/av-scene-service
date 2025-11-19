/*
  Warnings:

  - You are about to drop the column `url` on the `scene_images` table. All the data in the column will be lost.
  - Added the required column `path` to the `scene_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scene_images" DROP COLUMN "url",
ADD COLUMN     "path" TEXT NOT NULL;
