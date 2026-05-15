-- CreateTable
CREATE TABLE `Loja` (
    `lojaid` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`lojaid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `usuarioid` INTEGER NOT NULL AUTO_INCREMENT,
    `lojaId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ADMIN', 'VENDEDOR') NOT NULL DEFAULT 'VENDEDOR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`usuarioid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `clienteid` INTEGER NOT NULL AUTO_INCREMENT,
    `lojaId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`clienteid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Veiculo` (
    `veiculoid` INTEGER NOT NULL AUTO_INCREMENT,
    `lojaId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `ano` INTEGER NOT NULL,
    `placa` VARCHAR(191) NULL,
    `chassi` VARCHAR(191) NULL,
    `cor` VARCHAR(191) NULL,
    `km` INTEGER NULL,
    `valorCompra` DOUBLE NOT NULL,
    `valorVenda` DOUBLE NOT NULL,
    `tipo` ENUM('MOTO', 'CARRO') NOT NULL,
    `tipoEstoque` ENUM('PROPRIO', 'CONSIGNADO') NOT NULL,
    `status` ENUM('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'MANUTENCAO') NOT NULL DEFAULT 'DISPONIVEL',
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Veiculo_placa_key`(`placa`),
    UNIQUE INDEX `Veiculo_chassi_key`(`chassi`),
    PRIMARY KEY (`veiculoid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoVeiculo` (
    `historicoid` INTEGER NOT NULL AUTO_INCREMENT,
    `veiculoId` INTEGER NOT NULL,
    `descricao` TEXT NOT NULL,
    `valor` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`historicoid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venda` (
    `vendaid` INTEGER NOT NULL AUTO_INCREMENT,
    `lojaId` INTEGER NOT NULL,
    `clienteId` INTEGER NOT NULL,
    `veiculoId` INTEGER NOT NULL,
    `vendedorId` INTEGER NULL,
    `valorVenda` DOUBLE NOT NULL,
    `lucro` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Venda_veiculoId_key`(`veiculoId`),
    PRIMARY KEY (`vendaid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Financeiro` (
    `financeiroid` INTEGER NOT NULL AUTO_INCREMENT,
    `lojaId` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `valor` DOUBLE NOT NULL,
    `status` ENUM('PENDENTE', 'PAGO', 'ATRASADO') NOT NULL DEFAULT 'PENDENTE',
    `vencimento` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`financeiroid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`lojaid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`lojaid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Veiculo` ADD CONSTRAINT `Veiculo_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`lojaid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoVeiculo` ADD CONSTRAINT `HistoricoVeiculo_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `Veiculo`(`veiculoid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`lojaid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`clienteid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `Veiculo`(`veiculoid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Usuario`(`usuarioid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Financeiro` ADD CONSTRAINT `Financeiro_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`lojaid`) ON DELETE CASCADE ON UPDATE CASCADE;
