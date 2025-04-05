/*
  Warnings:

  - You are about to drop the column `attempt` on the `formsubmission` table. All the data in the column will be lost.
  - Added the required column `quarter` to the `FormSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `formsubmission` DROP COLUMN `attempt`,
    ADD COLUMN `quarter` INTEGER NOT NULL;
