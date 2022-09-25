/*
  Warnings:

  - Added the required column `broadcasterId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "broadcasterId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Broadcaster" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Broadcaster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "Broadcaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
