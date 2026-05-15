const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

            const {
                nome,
                telefone,
                cpf,
                cidade
            } = req.body;

            const cliente =
                await prisma.cliente.create({

                    data: {

                        lojaId:
                            req.usuario.lojaId,

                        nome,

                        telefone,

                        cpf,

                        cidade

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

                    where: {

                        lojaId:
                            req.usuario.lojaId

                    },

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