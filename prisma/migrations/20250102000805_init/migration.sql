/*
  Warnings:

  - You are about to drop the column `email` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `carts` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `carts_email_key` ON `carts`;

-- AlterTable
ALTER TABLE `carts` DROP COLUMN `email`,
    DROP COLUMN `name`,
    ADD COLUMN `custommer` VARCHAR(191) NULL;
