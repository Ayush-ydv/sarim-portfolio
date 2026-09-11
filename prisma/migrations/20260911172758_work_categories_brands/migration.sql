-- CreateEnum
CREATE TYPE "GalleryLayout" AS ENUM ('LANDSCAPE', 'VERTICAL');

-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "galleryLayout" "GalleryLayout" NOT NULL DEFAULT 'LANDSCAPE',
ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "homeBlocks" TEXT[] DEFAULT ARRAY['brands', 'work']::TEXT[];

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "siteSettingsId" TEXT NOT NULL DEFAULT 'singleton',
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
