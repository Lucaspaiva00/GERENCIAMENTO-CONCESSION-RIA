-- AlterTable
ALTER TABLE "Financeiro" ADD COLUMN     "historicoId" INTEGER,
ADD COLUMN     "veiculoId" INTEGER;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("veiculoid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_historicoId_fkey" FOREIGN KEY ("historicoId") REFERENCES "HistoricoVeiculo"("historicoid") ON DELETE SET NULL ON UPDATE CASCADE;
