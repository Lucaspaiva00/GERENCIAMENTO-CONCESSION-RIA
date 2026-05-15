-- CreateTable
CREATE TABLE `ContaReceber` (
    `contareceberid` INTEGER NOT NULL AUTO_INCREMENT,
    `vendaId` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `vencimento` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'PAGO', 'ATRASADO') NOT NULL DEFAULT 'PENDENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`contareceberid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContaReceber` ADD CONSTRAINT `ContaReceber_vendaId_fkey` FOREIGN KEY (`vendaId`) REFERENCES `Venda`(`vendaid`) ON DELETE CASCADE ON UPDATE CASCADE;
