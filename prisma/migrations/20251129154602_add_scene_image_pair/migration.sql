/*
  Warnings:

  - You are about to drop the `scene_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "scene_images" DROP CONSTRAINT "scene_images_sceneId_fkey";

-- DropTable
DROP TABLE "scene_images";

-- CreateTable
CREATE TABLE "scene_image_pairs" (
    "id" TEXT NOT NULL,
    "snippetPath" TEXT NOT NULL,
    "referencePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sceneId" TEXT NOT NULL,

    CONSTRAINT "scene_image_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scene_image_pairs_sceneId_key" ON "scene_image_pairs"("sceneId");

-- AddForeignKey
ALTER TABLE "scene_image_pairs" ADD CONSTRAINT "scene_image_pairs_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
