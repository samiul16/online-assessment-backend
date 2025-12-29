/*
  Warnings:

  - You are about to drop the column `isActive` on the `Assessment` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serial` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "isActive",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "serial" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "image" TEXT,
ALTER COLUMN "marks" SET DEFAULT 1;
