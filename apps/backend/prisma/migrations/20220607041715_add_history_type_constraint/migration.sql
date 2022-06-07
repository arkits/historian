/*
  Warnings:

  - A unique constraint covering the columns `[contentId,userId,type]` on the table `History` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "History_contentId_userId";

-- CreateIndex
CREATE UNIQUE INDEX "History_contentId_userId_type" ON "History"("contentId", "userId", "type");
