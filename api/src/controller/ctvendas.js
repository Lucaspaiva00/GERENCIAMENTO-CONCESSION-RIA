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

        /* ========================= */
        /* VEÍCULO */
        /* ========================= */

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

        /* ========================= */
        /* CLIENTE */
        /* ========================= */

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

        /* ========================= */
        /* VENDEDOR */
        /* ========================= */

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

        /* ========================= */
        /* LUCRO */
        /* ========================= */

        const lucro =
            Number(valorVenda) -
            Number(veiculo.valorCompra || 0);

        /* ========================= */
        /* TRANSACTION */
        /* ========================= */

        const venda =
            await prisma.$transaction(async (tx) => {

                /* ========================= */
                /* VENDA */
                /* ========================= */

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
                                Number(
                                    veiculo.valorCompra || 0
                                ),

                            lucro,

                            formaPagamento,

                            entrada:
                                Number(entrada || 0),

                            parcelas:
                                Number(parcelas || 1),

                            observacoes

                        }

                    });

                /* ========================= */
                /* ALTERAR STATUS VEÍCULO */
                /* ========================= */

                await tx.veiculo.update({

                    where: {

                        veiculoid:
                            Number(veiculoId)

                    },

                    data: {

                        status: "VENDIDO"

                    }

                });

                /* ========================= */
                /* FINANCEIRO */
                /* ========================= */

                await tx.financeiro.create({

                    data: {

                        lojaId,

                        descricao:
                            `Venda do veículo ${veiculo.titulo}`,

                        tipo: "ENTRADA",

                        valor:
                            Number(
                                entrada || valorVenda
                            ),

                        status: "PAGO",

                        vencimento:
                            new Date()

                    }

                });

                /* ========================= */
                /* CONTAS A RECEBER */
                /* ========================= */

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
                                    Number(
                                        valorParcela
                                    ),

                                vencimento,

                                status: "PENDENTE"

                            }

                        });

                    }

                }

                /* ========================= */
                /* COMISSÃO */
                /* ========================= */

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

        const {
            busca,
            dataInicio,
            dataFim,
            vendedorId,
            formaPagamento
        } = req.query;

        const filtros = {

            lojaId

        };

        /* ========================= */
        /* FILTRO BUSCA */
        /* ========================= */

        if (busca) {

            filtros.OR = [

                {
                    cliente: {
                        nome: {
                            contains: busca
                        }
                    }
                },

                {
                    veiculo: {
                        titulo: {
                            contains: busca
                        }
                    }
                },

                {
                    cliente: {
                        cpf: {
                            contains: busca
                        }
                    }
                },

                {
                    veiculo: {
                        placa: {
                            contains: busca
                        }
                    }
                }

            ];

        }

        /* ========================= */
        /* FILTRO DATA */
        /* ========================= */

        if (dataInicio || dataFim) {

            filtros.createdAt = {};

            if (dataInicio) {

                filtros.createdAt.gte =
                    new Date(dataInicio);

            }

            if (dataFim) {

                const dataFinal =
                    new Date(dataFim);

                dataFinal.setHours(
                    23,
                    59,
                    59,
                    999
                );

                filtros.createdAt.lte =
                    dataFinal;

            }

        }

        /* ========================= */
        /* FILTRO VENDEDOR */
        /* ========================= */

        if (vendedorId) {

            filtros.vendedorId =
                Number(vendedorId);

        }

        /* ========================= */
        /* FORMA PAGAMENTO */
        /* ========================= */

        if (formaPagamento) {

            filtros.formaPagamento =
                formaPagamento;

        }

        const vendas =
            await prisma.venda.findMany({

                where: filtros,

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

/* ========================= */
/* DETALHAR */
/* ========================= */

const detalhar = async (req, res) => {

    try {

        const lojaId =
            req.usuario.lojaId;

        const { id } =
            req.params;

        const venda =
            await prisma.venda.findFirst({

                where: {

                    vendaid:
                        Number(id),

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

            return res.status(404).json({
                error: "Venda não encontrada"
            });

        }

        return res.json(venda);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Erro ao detalhar venda"
        });

    }

};

/* ========================= */
/* CANCELAR VENDA */
/* ========================= */

const cancelar = async (req, res) => {

    try {

        const lojaId =
            req.usuario.lojaId;

        const { id } =
            req.params;

        const venda =
            await prisma.venda.findFirst({

                where: {

                    vendaid:
                        Number(id),

                    lojaId

                }

            });

        if (!venda) {

            return res.status(404).json({
                error: "Venda não encontrada"
            });

        }

        await prisma.$transaction(async (tx) => {

            /* VEÍCULO VOLTA DISPONÍVEL */

            await tx.veiculo.update({

                where: {

                    veiculoid:
                        venda.veiculoId

                },

                data: {

                    status: "DISPONIVEL"

                }

            });

            /* REMOVE CONTAS */

            await tx.contaReceber.deleteMany({

                where: {

                    vendaId:
                        venda.vendaid

                }

            });

            /* REMOVE COMISSÃO */

            await tx.comissao.deleteMany({

                where: {

                    vendaId:
                        venda.vendaid

                }

            });

            /* REMOVE VENDA */

            await tx.venda.delete({

                where: {

                    vendaid:
                        venda.vendaid

                }

            });

        });

        return res.json({

            message:
                "Venda cancelada com sucesso"

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Erro ao cancelar venda"
        });

    }

};

module.exports = {

    criar,
    listar,
    detalhar,
    cancelar

};