const prisma = require("../database/prisma");

module.exports = {

    async listar(req, res) {

        try {

            const comissoes = await prisma.comissao.findMany({

                include: {
                    vendedor: true,
                    venda: {
                        include: {
                            cliente: true,
                            veiculo: true
                        }
                    }
                },

                orderBy: {
                    comissaoid: "desc"
                }

            });

            return res.json(comissoes);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};