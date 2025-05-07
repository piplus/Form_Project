-- DropForeignKey
ALTER TABLE `invite` DROP FOREIGN KEY `Invite_formId_fkey`;

-- DropIndex
DROP INDEX `Invite_formId_fkey` ON `invite`;

-- AlterTable
ALTER TABLE `invite` MODIFY `formId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
