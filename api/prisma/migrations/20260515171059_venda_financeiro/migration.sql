-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `comissaoPercentual` DOUBLE NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `venda` ADD COLUMN `entrada` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `formaPagamento` VARCHAR(191) NULL,
    ADD COLUMN `parcelas` INTEGER NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `Comissao` (
    `comissaoid` INTEGER NOT NULL AUTO_INCREMENT,
    `vendaId` INTEGER NOT NULL,
    `vendedorId` INTEGER NOT NULL,
    `percentual` DOUBLE NOT NULL,
    `valor` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Comissao_vendaId_key`(`vendaId`),
    PRIMARY KEY (`comissaoid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comissao` ADD CONSTRAINT `Comissao_vendaId_fkey` FOREIGN KEY (`vendaId`) REFERENCES `Venda`(`vendaid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comissao` ADD CONSTRAINT `Comissao_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Usuario`(`usuarioid`) ON DELETE RESTRICT ON UPDATE CASCADE;
