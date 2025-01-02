/*
  Warnings:

  - You are about to drop the column `cartId` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_cartId_fkey`;

-- DropIndex
DROP INDEX `products_cartId_fkey` ON `products`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `cartId`;

-- CreateTable
CREATE TABLE `_CartToProduct` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CartToProduct_AB_unique`(`A`, `B`),
    INDEX `_CartToProduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CartToProduct` ADD CONSTRAINT `_CartToProduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CartToProduct` ADD CONSTRAINT `_CartToProduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
