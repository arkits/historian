/*
  Warnings:

  - Added the required column `type` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" ADD COLUMN     "type" TEXT NOT NULL;
