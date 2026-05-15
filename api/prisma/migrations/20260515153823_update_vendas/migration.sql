/*
  Warnings:

  - Added the required column `valorCompra` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Made the column `lucro` on table `venda` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `venda` ADD COLUMN `observacoes` TEXT NULL,
    ADD COLUMN `valorCompra` DOUBLE NOT NULL,
    MODIFY `lucro` DOUBLE NOT NULL;
