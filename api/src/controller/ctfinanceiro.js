const prisma = require("../database/prisma");

module.exports = {

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

                        vencimento

                    }

                });

            return res.json(movimentacao);

        } catch (error) {

            return res.status(500).json(error);

        }

    },

    async listar(req, res) {

        try {

            const movimentacoes =
                await prisma.financeiro.findMany({

                    where: {

                        lojaId:
                            req.usuario.lojaId

                    },

                    orderBy: {

                        financeiroid:
                            "desc"

                    }

                });

            return res.json(movimentacoes);

        } catch (error) {

            return res.status(500).json(error);

        }

    },

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

            return res.json(movimentacao);

        } catch (error) {

            return res.status(500).json(error);

        }

    },

    async atualizar(req, res) {

        try {

            const { id } =
                req.params;

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

                        vencimento

                    }

                });

            return res.json(movimentacao);

        } catch (error) {

            return res.status(500).json(error);

        }

    },

    async deletar(req, res) {

        try {

            const { id } =
                req.params;

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

            return res.status(500).json(error);

        }

    }

};