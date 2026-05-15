const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

            const {
                lojaId,
                descricao,
                tipo,
                valor,
                status,
                vencimento
            } = req.body;

            const movimentacao = await prisma.financeiro.create({
                data: {
                    lojaId,
                    descricao,
                    tipo,
                    valor,
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

            const movimentacoes = await prisma.financeiro.findMany({
                orderBy: {
                    financeiroid: "desc"
                }
            });

            return res.json(movimentacoes);

        } catch (error) {

            return res.status(500).json(error);

        }

    },

    async detalhar(req, res) {

        try {

            const { id } = req.params;

            const movimentacao = await prisma.financeiro.findUnique({
                where: {
                    financeiroid: Number(id)
                }
            });

            return res.json(movimentacao);

        } catch (error) {

            return res.status(500).json(error);

        }

    },

    async atualizar(req, res) {

        try {

            const { id } = req.params;

            const {
                descricao,
                tipo,
                valor,
                status,
                vencimento
            } = req.body;

            const movimentacao = await prisma.financeiro.update({
                where: {
                    financeiroid: Number(id)
                },
                data: {
                    descricao,
                    tipo,
                    valor,
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

            const { id } = req.params;

            await prisma.financeiro.delete({
                where: {
                    financeiroid: Number(id)
                }
            });

            return res.json({
                message: "Movimentação deletada com sucesso"
            });

        } catch (error) {

            return res.status(500).json(error);

        }

    }

};