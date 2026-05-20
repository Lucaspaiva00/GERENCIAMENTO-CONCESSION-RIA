const prisma = require("../database/prisma");

module.exports = {

    /* =========================================
       CADASTRAR
    ========================================= */

    async cadastrar(req, res) {

        try {

            const {

                descricao,
                tipo,
                valor,
                status,
                vencimento

            } = req.body;

            const movimentacao =
                await prisma.financeiro.create({

                    data: {

                        lojaId:
                            req.usuario.lojaId,

                        descricao,

                        tipo,

                        valor:
                            Number(valor),

                        status,

                        vencimento:
                            vencimento
                                ? new Date(vencimento)
                                : null

                    }

                });

            return res.json(movimentacao);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error:
                    "Erro ao cadastrar movimentação"
            });

        }

    },

    /* =========================================
       LISTAR + FILTROS
    ========================================= */

    async listar(req, res) {

        try {

            const {

                mes,
                ano,
                dataInicio,
                dataFim,
                tipo,
                status,
                busca

            } = req.query;

            const filtros = {

                lojaId:
                    req.usuario.lojaId

            };

            /* =========================================
               FILTRO POR MÊS
            ========================================= */

            if (mes && ano) {

                const inicio =
                    new Date(
                        Number(ano),
                        Number(mes) - 1,
                        1
                    );

                const fim =
                    new Date(
                        Number(ano),
                        Number(mes),
                        0,
                        23,
                        59,
                        59
                    );

                filtros.createdAt = {

                    gte: inicio,

                    lte: fim

                };

            }

            /* =========================================
               FILTRO POR PERÍODO
            ========================================= */

            if (dataInicio && dataFim) {

                filtros.createdAt = {

                    gte:
                        new Date(dataInicio),

                    lte:
                        new Date(
                            `${dataFim}T23:59:59`
                        )

                };

            }

            /* =========================================
               FILTRO TIPO
            ========================================= */

            if (tipo) {

                filtros.tipo = tipo;

            }

            /* =========================================
               FILTRO STATUS
            ========================================= */

            if (status) {

                filtros.status = status;

            }

            /* =========================================
               FILTRO BUSCA
            ========================================= */

            if (busca) {

                filtros.OR = [

                    {

                        descricao: {

                            contains: busca

                        }

                    }

                ];

            }

            const movimentacoes =
                await prisma.financeiro.findMany({

                    where: filtros,

                    orderBy: {

                        financeiroid:
                            "desc"

                    }

                });

            return res.json(movimentacoes);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error:
                    "Erro ao listar movimentações"
            });

        }

    },

    /* =========================================
       DETALHAR
    ========================================= */

    async detalhar(req, res) {

        try {

            const { id } =
                req.params;

            const movimentacao =
                await prisma.financeiro.findFirst({

                    where: {

                        financeiroid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!movimentacao) {

                return res.status(404).json({
                    error:
                        "Movimentação não encontrada"
                });

            }

            return res.json(movimentacao);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error:
                    "Erro ao detalhar movimentação"
            });

        }

    },

    /* =========================================
       ATUALIZAR
    ========================================= */

    async atualizar(req, res) {

        try {

            const { id } =
                req.params;

            const existe =
                await prisma.financeiro.findFirst({

                    where: {

                        financeiroid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!existe) {

                return res.status(404).json({
                    error:
                        "Movimentação não encontrada"
                });

            }

            const {

                descricao,
                tipo,
                valor,
                status,
                vencimento

            } = req.body;

            const movimentacao =
                await prisma.financeiro.update({

                    where: {

                        financeiroid:
                            Number(id)

                    },

                    data: {

                        descricao,

                        tipo,

                        valor:
                            Number(valor),

                        status,

                        vencimento:
                            vencimento
                                ? new Date(vencimento)
                                : null

                    }

                });

            return res.json(movimentacao);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error:
                    "Erro ao atualizar movimentação"
            });

        }

    },

    /* =========================================
       DELETAR
    ========================================= */

    async deletar(req, res) {

        try {

            const { id } =
                req.params;

            const existe =
                await prisma.financeiro.findFirst({

                    where: {

                        financeiroid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!existe) {

                return res.status(404).json({
                    error:
                        "Movimentação não encontrada"
                });

            }

            await prisma.financeiro.delete({

                where: {

                    financeiroid:
                        Number(id)

                }

            });

            return res.json({

                message:
                    "Movimentação deletada com sucesso"

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error:
                    "Erro ao deletar movimentação"
            });

        }

    }

};