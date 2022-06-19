/*
  Warnings:

  - A unique constraint covering the columns `[contentId,userId,type,timelineTime]` on the table `History` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timelineTime` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "History_contentId_userId_type";

-- AlterTable
ALTER TABLE "History" ADD COLUMN     "timelineTime" TIMESTAMP(6) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "History_hash" ON "History"("contentId", "userId", "type", "timelineTime");
