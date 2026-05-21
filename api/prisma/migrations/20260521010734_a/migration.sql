-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "TipoVeiculo" AS ENUM ('MOTO', 'CARRO');

-- CreateEnum
CREATE TYPE "TipoEstoque" AS ENUM ('PROPRIO', 'CONSIGNADO');

-- CreateEnum
CREATE TYPE "StatusVeiculo" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "StatusConta" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO');

-- CreateTable
CREATE TABLE "Loja" (
    "lojaid" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("lojaid")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "usuarioid" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL DEFAULT 'VENDEDOR',
    "comissaoPercentual" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuarioid")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "clienteid" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "telefone2" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "cep" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("clienteid")
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "veiculoid" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "anoModelo" INTEGER,
    "placa" TEXT,
    "renavam" TEXT,
    "chassi" TEXT,
    "cor" TEXT,
    "km" INTEGER,
    "possuiManual" BOOLEAN NOT NULL DEFAULT false,
    "possuiChaveReserva" BOOLEAN NOT NULL DEFAULT false,
    "valorCompra" DOUBLE PRECISION NOT NULL,
    "valorVenda" DOUBLE PRECISION NOT NULL,
    "imagem" TEXT,
    "tipo" "TipoVeiculo" NOT NULL,
    "tipoEstoque" "TipoEstoque" NOT NULL,
    "status" "StatusVeiculo" NOT NULL DEFAULT 'DISPONIVEL',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("veiculoid")
);

-- CreateTable
CREATE TABLE "HistoricoVeiculo" (
    "historicoid" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoVeiculo_pkey" PRIMARY KEY ("historicoid")
);

-- CreateTable
CREATE TABLE "Venda" (
    "vendaid" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "vendedorId" INTEGER,
    "valorVenda" DOUBLE PRECISION NOT NULL,
    "valorCompra" DOUBLE PRECISION NOT NULL,
    "lucro" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT,
    "entrada" DOUBLE PRECISION DEFAULT 0,
    "parcelas" INTEGER DEFAULT 1,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("vendaid")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "comissaoid" SERIAL NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("comissaoid")
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "contareceberid" SERIAL NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusConta" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("contareceberid")
);

-- CreateTable
CREATE TABLE "Financeiro" (
    "financeiroid" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" "StatusConta" NOT NULL DEFAULT 'PENDENTE',
    "vencimento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Financeiro_pkey" PRIMARY KEY ("financeiroid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_veiculoId_key" ON "Venda"("veiculoId");

-- CreateIndex
CREATE UNIQUE INDEX "Comissao_vendaId_key" ON "Comissao"("vendaId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("lojaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("lojaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Veiculo" ADD CONSTRAINT "Veiculo_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("lojaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoVeiculo" ADD CONSTRAINT "HistoricoVeiculo_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("veiculoid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("lojaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("clienteid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("veiculoid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("usuarioid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("vendaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("vendaid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("lojaid") ON DELETE CASCADE ON UPDATE CASCADE;
