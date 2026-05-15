const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* ========================= */
/* CRIAR VENDA */
/* ========================= */

const criar = async (req, res) => {

    try {

        const lojaId =
            req.usuario.lojaId;

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

        /* VEÍCULO */

        const veiculo =
            await prisma.veiculo.findFirst({

                where: {

                    veiculoid:
                        Number(veiculoId),

                    lojaId

                }

            });

        if (!veiculo) {

            return res.status(404).json({
                error: "Veículo não encontrado"
            });

        }

        if (veiculo.status === "VENDIDO") {

            return res.status(400).json({
                error: "Veículo já vendido"
            });

        }

        /* CLIENTE */

        const cliente =
            await prisma.cliente.findFirst({

                where: {

                    clienteid:
                        Number(clienteId),

                    lojaId

                }

            });

        if (!cliente) {

            return res.status(404).json({
                error: "Cliente não encontrado"
            });

        }

        /* VENDEDOR */

        let vendedor = null;

        if (vendedorId) {

            vendedor =
                await prisma.usuario.findFirst({

                    where: {

                        usuarioid:
                            Number(vendedorId),

                        lojaId

                    }

                });

            if (!vendedor) {

                return res.status(404).json({
                    error: "Vendedor não encontrado"
                });

            }

        }

        const lucro =
            Number(valorVenda) -
            Number(veiculo.valorCompra);

        /* TRANSACTION */

        const venda =
            await prisma.$transaction(async (tx) => {

                /* VENDA */

                const novaVenda =
                    await tx.venda.create({

                        data: {

                            lojaId,

                            clienteId:
                                Number(clienteId),

                            veiculoId:
                                Number(veiculoId),

                            vendedorId:
                                vendedorId
                                    ? Number(vendedorId)
                                    : null,

                            valorVenda:
                                Number(valorVenda),

                            valorCompra:
                                Number(veiculo.valorCompra),

                            lucro,

                            formaPagamento,

                            entrada:
                                Number(entrada || 0),

                            parcelas:
                                Number(parcelas || 1),

                            observacoes

                        }

                    });

                /* ALTERAR STATUS */

                await tx.veiculo.update({

                    where: {

                        veiculoid:
                            Number(veiculoId)

                    },

                    data: {

                        status: "VENDIDO"

                    }

                });

                /* FINANCEIRO */

                await tx.financeiro.create({

                    data: {

                        lojaId,

                        descricao:
                            `Venda do veículo ${veiculo.titulo}`,

                        tipo: "ENTRADA",

                        valor:
                            Number(entrada || valorVenda),

                        status: "PAGO"

                    }

                });

                /* PARCELAS */

                if (
                    Number(parcelas) > 1
                ) {

                    const valorRestante =
                        Number(valorVenda) -
                        Number(entrada || 0);

                    const valorParcela =
                        valorRestante /
                        Number(parcelas);

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

                        await tx.contaReceber.create({

                            data: {

                                vendaId:
                                    novaVenda.vendaid,

                                descricao:
                                    `Parcela ${i}/${parcelas}`,

                                valor:
                                    Number(valorParcela),

                                vencimento

                            }

                        });

                    }

                }

                /* COMISSÃO */

                if (
                    vendedor &&
                    vendedor.comissaoPercentual
                ) {

                    const valorComissao =
                        (
                            Number(valorVenda)
                            *
                            Number(
                                vendedor.comissaoPercentual
                            )
                        ) / 100;

                    await tx.comissao.create({

                        data: {

                            vendaId:
                                novaVenda.vendaid,

                            vendedorId:
                                vendedor.usuarioid,

                            percentual:
                                vendedor.comissaoPercentual,

                            valor:
                                valorComissao

                        }

                    });

                }

                return novaVenda;

            });

        return res.json(venda);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Erro ao criar venda"
        });

    }

};

/* ========================= */
/* LISTAR */
/* ========================= */

const listar = async (req, res) => {

    try {

        const lojaId =
            req.usuario.lojaId;

        const vendas =
            await prisma.venda.findMany({

                where: {

                    lojaId

                },

                include: {

                    cliente: true,

                    veiculo: true,

                    vendedor: true,

                    contaRecebers: true,

                    comissao: true

                },

                orderBy: {

                    vendaid: "desc"

                }

            });

        return res.json(vendas);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Erro ao listar vendas"
        });

    }

};

module.exports = {

    criar,

    listar

};