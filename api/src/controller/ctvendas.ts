import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { StatusConta, StatusVeiculo, TipoMovimentacao } from "@prisma/client";
import prisma from "../database/prisma";

const criar = async (req: Request, res: Response) => {
    try {
        const lojaId = req.usuario.lojaId;
        const {
            clienteId,
            veiculoId,
            vendedorId,
            valorVenda,
            formaPagamento,
            entrada,
            parcelas,
            observacoes
        } = req.body;

        const veiculo = await prisma.veiculo.findFirst({
            where: {
                veiculoid: Number(veiculoId),
                lojaId
            }
        });

        if (!veiculo) {
            return res.status(404).json({ error: "Veículo não encontrado" });
        }

        if (veiculo.status === StatusVeiculo.VENDIDO) {
            return res.status(400).json({ error: "Veículo já vendido" });
        }

        const cliente = await prisma.cliente.findFirst({
            where: {
                clienteid: Number(clienteId),
                lojaId
            }
        });

        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }

        let vendedor = null;

        if (vendedorId) {
            vendedor = await prisma.usuario.findFirst({
                where: {
                    usuarioid: Number(vendedorId),
                    lojaId
                }
            });

            if (!vendedor) {
                return res.status(404).json({ error: "Vendedor não encontrado" });
            }
        }

        const lucro = Number(valorVenda) - Number(veiculo.valorCompra || 0);

        const venda =
            await prisma.$transaction(

                async (tx) => {
                    const novaVenda = await tx.venda.create({
                        data: {
                            lojaId,
                            clienteId: Number(clienteId),
                            veiculoId: Number(veiculoId),
                            vendedorId: vendedorId ? Number(vendedorId) : null,
                            valorVenda: Number(valorVenda),
                            valorCompra: Number(veiculo.valorCompra || 0),
                            lucro,
                            formaPagamento,
                            entrada: Number(entrada || 0),
                            parcelas: Number(parcelas || 1),
                            observacoes
                        }
                    });

                    await tx.veiculo.update({
                        where: { veiculoid: Number(veiculoId) },
                        data: { status: StatusVeiculo.VENDIDO }
                    });

                    await tx.financeiro.create({
                        data: {
                            lojaId,
                            descricao: `Venda do veículo ${veiculo.titulo}`,
                            tipo: TipoMovimentacao.ENTRADA,
                            valor: Number(entrada || valorVenda),
                            status: StatusConta.PAGO,
                            vencimento: new Date()
                        }
                    });

                    if (Number(parcelas) > 1) {

                        const valorRestante =
                            Number(valorVenda) -
                            Number(entrada || 0);

                        const valorParcela =
                            valorRestante /
                            Number(parcelas);

                        const parcelasCriar = [];

                        for (
                            let i = 1;
                            i <= Number(parcelas);
                            i++
                        ) {

                            const vencimento =
                                new Date();

                            vencimento.setMonth(
                                vencimento.getMonth() + i
                            );

                            parcelasCriar.push({

                                vendaId:
                                    novaVenda.vendaid,

                                descricao:
                                    `Parcela ${i}/${parcelas}`,

                                valor:
                                    Number(valorParcela),

                                vencimento,

                                status:
                                    StatusConta.PENDENTE

                            });

                        }

                        await tx.contaReceber.createMany({

                            data:
                                parcelasCriar

                        });

                    }

                    if (vendedor && vendedor.comissaoPercentual) {
                        const valorComissao =
                            (Number(valorVenda) * Number(vendedor.comissaoPercentual)) / 100;

                        await tx.comissao.create({
                            data: {
                                vendaId: novaVenda.vendaid,
                                vendedorId: vendedor.usuarioid,
                                percentual: vendedor.comissaoPercentual,
                                valor: valorComissao
                            }
                        });
                    }

                    return novaVenda;

                },
                {
                    timeout: 30000
                });

        return res.json(venda);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao criar venda" });
    }
};

const listar = async (req: Request, res: Response) => {
    try {
        const lojaId = req.usuario.lojaId;
        const { busca, dataInicio, dataFim, vendedorId, formaPagamento } = req.query;

        const filtros: Prisma.VendaWhereInput = { lojaId };

        if (busca) {
            filtros.OR = [
                { cliente: { nome: { contains: String(busca) } } },
                { veiculo: { titulo: { contains: String(busca) } } },
                { cliente: { cpf: { contains: String(busca) } } },
                { veiculo: { placa: { contains: String(busca) } } }
            ];
        }

        if (dataInicio || dataFim) {
            filtros.createdAt = {};
            if (dataInicio) filtros.createdAt.gte = new Date(String(dataInicio));
            if (dataFim) {
                const dataFinal = new Date(String(dataFim));
                dataFinal.setHours(23, 59, 59, 999);
                filtros.createdAt.lte = dataFinal;
            }
        }

        if (vendedorId) filtros.vendedorId = Number(vendedorId);
        if (formaPagamento) filtros.formaPagamento = String(formaPagamento);

        const vendas = await prisma.venda.findMany({
            where: filtros,
            include: {
                cliente: true,
                veiculo: true,
                vendedor: true,
                contaRecebers: true,
                comissao: true
            },
            orderBy: { vendaid: "desc" }
        });

        return res.json(vendas);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erro ao listar vendas" });
    }
};

const detalhar = async (req: Request, res: Response) => {
    try {
        const lojaId = req.usuario.lojaId;
        const { id } = req.params;

        const venda = await prisma.venda.findFirst({
            where: {
                vendaid: Number(id),
                lojaId
            },
            include: {
                cliente: true,
                veiculo: true,
                vendedor: true,
                contaRecebers: true,
                comissao: true
            }
        });

        if (!venda) {
            return res.status(404).json({ error: "Venda não encontrada" });
        }

        return res.json(venda);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erro ao detalhar venda" });
    }
};

const cancelar = async (req: Request, res: Response) => {
    try {
        const lojaId = req.usuario.lojaId;
        const { id } = req.params;

        const venda = await prisma.venda.findFirst({
            where: {
                vendaid: Number(id),
                lojaId
            }
        });

        if (!venda) {
            return res.status(404).json({ error: "Venda não encontrada" });
        }

        await prisma.$transaction(async (tx) => {
            await tx.veiculo.update({
                where: { veiculoid: venda.veiculoId },
                data: { status: StatusVeiculo.DISPONIVEL }
            });

            await tx.contaReceber.deleteMany({
                where: { vendaId: venda.vendaid }
            });

            await tx.comissao.deleteMany({
                where: { vendaId: venda.vendaid }
            });

            await tx.venda.delete({
                where: { vendaid: venda.vendaid }
            });
        });

        return res.json({ message: "Venda cancelada com sucesso" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erro ao cancelar venda" });
    }
};

export default { criar, listar, detalhar, cancelar };
