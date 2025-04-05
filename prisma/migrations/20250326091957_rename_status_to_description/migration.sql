/*
  Warnings:

  - You are about to drop the column `status` on the `form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `form` DROP COLUMN `status`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL DEFAULT '';
