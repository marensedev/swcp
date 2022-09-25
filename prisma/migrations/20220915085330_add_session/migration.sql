/*
  Warnings:

  - A unique constraint covering the columns `[parentId,title]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parentId,title]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "ua" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_parentId_title_key" ON "Content"("parentId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_parentId_title_key" ON "Folder"("parentId", "title");
