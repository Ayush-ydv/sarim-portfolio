-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "ctaButtonLabel" TEXT NOT NULL DEFAULT 'Book Me',
ADD COLUMN     "servicesHeading" TEXT NOT NULL DEFAULT 'What I do';

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "siteSettingsId" TEXT NOT NULL DEFAULT 'singleton',
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "siteSettingsId" TEXT NOT NULL DEFAULT 'singleton',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stat" ADD CONSTRAINT "Stat_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
