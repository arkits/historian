/*
  Warnings:

  - A unique constraint covering the columns `[contentId,userId]` on the table `History` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "History_contentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "History_contentId_userId" ON "History"("contentId", "userId");
