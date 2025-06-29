/*
  Warnings:

  - Added the required column `name` to the `Study` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Study" ADD COLUMN     "name" TEXT NOT NULL;
