import type { Request, Response } from "express";
import { StatusVeiculo, TipoEstoque, TipoMovimentacao } from "@prisma/client";
import prisma from "../database/prisma";

export default {
    async indicadores(req: Request, res: Response) {
        try {
            const lojaId = req.usuario.lojaId;

            const totalVeiculos = await prisma.veiculo.count({
                where: { lojaId }
            });

            const vendidos = await prisma.veiculo.count({
                where: { lojaId, status: StatusVeiculo.VENDIDO }
            });

            const consignados = await prisma.veiculo.count({
                where: { lojaId, tipoEstoque: TipoEstoque.CONSIGNADO }
            });

            const disponiveis = await prisma.veiculo.count({
                where: { lojaId, status: StatusVeiculo.DISPONIVEL }
            });

            const manutencao = await prisma.veiculo.count({
                where: { lojaId, status: StatusVeiculo.MANUTENCAO }
            });

            const estoqueCompra = await prisma.veiculo.aggregate({
                where: {
                    lojaId,
                    status: { not: StatusVeiculo.VENDIDO }
                },
                _sum: { valorCompra: true }
            });

            const estoqueVenda = await prisma.veiculo.aggregate({
                where: {
                    lojaId,
                    status: { not: StatusVeiculo.VENDIDO }
                },
                _sum: { valorVenda: true }
            });

            const valorInvestidoEstoque = estoqueCompra._sum.valorCompra || 0;
            const valorVendaEstoque = estoqueVenda._sum.valorVenda || 0;
            const lucroPrevistoEstoque = valorVendaEstoque - valorInvestidoEstoque;

            const entradas = await prisma.financeiro.aggregate({
                where: { lojaId, tipo: TipoMovimentacao.ENTRADA },
                _sum: { valor: true }
            });

            const saidas = await prisma.financeiro.aggregate({
                where: { lojaId, tipo: TipoMovimentacao.SAIDA },
                _sum: { valor: true }
            });

            const totalEntradas = entradas._sum.valor || 0;
            const totalSaidas = saidas._sum.valor || 0;
            const saldo = totalEntradas - totalSaidas;

            return res.json({
                veiculos: {
                    total: totalVeiculos,
                    vendidos,
                    consignados,
                    disponiveis,
                    manutencao
                },
                financeiro: {
                    entradas: totalEntradas,
                    saidas: totalSaidas,
                    saldo
                },
                estoque: {
                    valorInvestido: valorInvestidoEstoque,
                    valorVenda: valorVendaEstoque,
                    lucroPrevisto: lucroPrevistoEstoque
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
};
