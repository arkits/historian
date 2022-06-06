/*
  Warnings:

  - A unique constraint covering the columns `[contentId]` on the table `History` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentId` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" ADD COLUMN     "contentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "History_contentId_key" ON "History"("contentId");
