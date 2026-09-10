-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('GALLERY', 'CONTENT', 'RESUME');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('EMBED', 'VIDEO_UPLOAD', 'AUDIO', 'LINK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroImageUrl" TEXT,
    "heroNameLine1" TEXT NOT NULL DEFAULT '',
    "heroNameLine2" TEXT NOT NULL DEFAULT '',
    "heroTagline" TEXT NOT NULL DEFAULT '',
    "bioImageUrl" TEXT,
    "bioText" TEXT NOT NULL,
    "philosophyText" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL DEFAULT 'Let''s make something together!',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "instagramUrl" TEXT,
    "vimeoUrl" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickLink" (
    "id" TEXT NOT NULL,
    "siteSettingsId" TEXT NOT NULL DEFAULT 'singleton',
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuickLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "navLabel" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionContent" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "heading" TEXT,
    "bodyText" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "SectionContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "roleLabel" TEXT,
    "description" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'EMBED',
    "mediaUrl" TEXT,
    "streamVideoId" TEXT,
    "thumbnailUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeData" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "resumeFileUrl" TEXT,

    CONSTRAINT "ResumeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEntry" (
    "id" TEXT NOT NULL,
    "resumeDataId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SectionContent_sectionId_key" ON "SectionContent"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeData_sectionId_key" ON "ResumeData"("sectionId");

-- AddForeignKey
ALTER TABLE "QuickLink" ADD CONSTRAINT "QuickLink_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionContent" ADD CONSTRAINT "SectionContent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeData" ADD CONSTRAINT "ResumeData_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEntry" ADD CONSTRAINT "ResumeEntry_resumeDataId_fkey" FOREIGN KEY ("resumeDataId") REFERENCES "ResumeData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
