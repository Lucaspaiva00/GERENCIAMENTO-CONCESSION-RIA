import type { Request, Response } from "express";
import { StatusConta, TipoMovimentacao } from "@prisma/client";
import prisma from "../database/prisma";

async function recalcularLucroVeiculo(veiculoId: number) {
    const venda = await prisma.venda.findFirst({
        where: { veiculoId }
    });

    if (!venda) return;

    const historicos = await prisma.historicoVeiculo.findMany({
        where: { veiculoId }
    });

    const totalDespesas = historicos.reduce((acc, item) => {
        return acc + Number(item.valor || 0);
    }, 0);

    const lucro =
        Number(venda.valorVenda || 0) -
        Number(venda.valorCompra || 0) -
        totalDespesas;

    await prisma.venda.update({
        where: { vendaid: venda.vendaid },
        data: { lucro }
    });
}

export default {
    async cadastrar(req: Request, res: Response) {
        try {
            const { veiculoId, descricao, valor } = req.body;

            const veiculo = await prisma.veiculo.findUnique({
                where: { veiculoid: Number(veiculoId) }
            });

            if (!veiculo) {
                return res.status(404).json({
                    error: "Veículo não encontrado"
                });
            }

            const historico = await prisma.historicoVeiculo.create({
                data: {
                    veiculoId: Number(veiculoId),
                    descricao,
                    valor: valor ? Number(valor) : null
                }
            });

            if (valor && Number(valor) > 0) {
                await prisma.financeiro.create({
                    data: {
                        lojaId: veiculo.lojaId,
                        descricao: `Histórico veículo: ${descricao} - Placa: ${veiculo.placa || "Sem placa"}`,
                        tipo: TipoMovimentacao.SAIDA,
                        valor: Number(valor),
                        status: StatusConta.PAGO
                    }
                });
            }

            await recalcularLucroVeiculo(Number(veiculoId));

            return res.json(historico);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async listar(req: Request, res: Response) {
        try {
            const { veiculoId } = req.params;

            const historicos = await prisma.historicoVeiculo.findMany({
                where: { veiculoId: Number(veiculoId) },
                orderBy: { historicoid: "desc" }
            });

            return res.json(historicos);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const historico = await prisma.historicoVeiculo.findUnique({
                where: { historicoid: Number(id) }
            });

            if (!historico) {
                return res.status(404).json({
                    error: "Histórico não encontrado"
                });
            }

            await prisma.historicoVeiculo.delete({
                where: { historicoid: Number(id) }
            });

            await recalcularLucroVeiculo(historico.veiculoId);

            return res.json({
                message: "Histórico deletado com sucesso"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { descricao, valor } = req.body;

            const historicoExiste = await prisma.historicoVeiculo.findUnique({
                where: { historicoid: Number(id) }
            });

            if (!historicoExiste) {
                return res.status(404).json({
                    error: "Histórico não encontrado"
                });
            }

            const historico = await prisma.historicoVeiculo.update({
                where: { historicoid: Number(id) },
                data: {
                    descricao,
                    valor: valor ? Number(valor) : null
                }
            });

            await recalcularLucroVeiculo(historico.veiculoId);

            return res.json(historico);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
};