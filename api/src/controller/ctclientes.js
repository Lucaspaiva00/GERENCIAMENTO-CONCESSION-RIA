const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

            const {
                nome,
                telefone
            } = req.body;

            const cliente =
                await prisma.cliente.create({

                    data: {

                        lojaId: 1,

                        nome,

                        telefone

                    }

                });

            return res.json(cliente);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async listar(req, res) {

        try {

            const clientes =
                await prisma.cliente.findMany({

                    include: {
                        vendas: true
                    },

                    orderBy: {
                        clienteid: "desc"
                    }

                });

            return res.json(clientes);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};