/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AchievementName" AS ENUM ('NOVICE_SCHOLAR', 'RISING_STAR', 'SKILL_SEEKER', 'KNOWLEDGE_MASTER', 'PRO_EXPLORER', 'ELITE_ADVENTURER', 'GRAND_WIZARD', 'UNIVERSAL_LEGEND');

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "name" "AchievementName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");
