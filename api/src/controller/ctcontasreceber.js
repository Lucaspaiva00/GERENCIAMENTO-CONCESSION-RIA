const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

            const {
                vendaId,
                descricao,
                valor,
                vencimento
            } = req.body;

            const conta = await prisma.contaReceber.create({
                data: {
                    vendaId: Number(vendaId),
                    descricao,
                    valor: Number(valor),
                    vencimento: new Date(vencimento)
                }
            });

            return res.json(conta);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async listar(req, res) {

        try {

            const contas = await prisma.contaReceber.findMany({

                include: {
                    venda: {
                        include: {
                            cliente: true,
                            veiculo: true
                        }
                    }
                },

                orderBy: {
                    vencimento: "asc"
                }

            });

            return res.json(contas);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async receber(req, res) {

        try {

            const { id } = req.params;

            const conta = await prisma.contaReceber.update({
                where: {
                    contareceberid: Number(id)
                },
                data: {
                    status: "PAGO"
                }
            });

            return res.json({
                message: "Parcela recebida com sucesso",
                conta
            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};