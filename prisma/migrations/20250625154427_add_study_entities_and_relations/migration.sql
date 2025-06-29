/*
  Warnings:

  - You are about to drop the column `description` on the `Study` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Study` table. All the data in the column will be lost.
  - Added the required column `requestingDoctorId` to the `Study` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyTypeId` to the `Study` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Study" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "requestingDoctorId" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'INCOMPLETO',
ADD COLUMN     "studyTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "StudyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StudyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyType_name_key" ON "StudyType"("name");

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_studyTypeId_fkey" FOREIGN KEY ("studyTypeId") REFERENCES "StudyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_requestingDoctorId_fkey" FOREIGN KEY ("requestingDoctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
