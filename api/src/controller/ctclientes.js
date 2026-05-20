const prisma = require("../database/prisma");

module.exports = {

    /* =========================================
       CADASTRAR CLIENTE
    ========================================= */

    async cadastrar(req, res) {

        try {

            const {

                nome,
                telefone,
                telefone2,
                rg,
                cpf,
                cep,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                complemento

            } = req.body;

            if (!nome) {

                return res.status(400).json({
                    error: "Nome do cliente é obrigatório"
                });

            }

            const cliente =
                await prisma.cliente.create({

                    data: {

                        lojaId:
                            req.usuario.lojaId,

                        nome,

                        telefone,

                        telefone2,

                        rg,

                        cpf,

                        cep,

                        endereco,

                        numero,

                        bairro,

                        cidade,

                        estado,

                        complemento

                    }

                });

            return res.json(cliente);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao cadastrar cliente"
            });

        }

    },

    /* =========================================
       LISTAR CLIENTES
    ========================================= */

    async listar(req, res) {

        try {

            const {
                busca
            } = req.query;

            const filtros = {

                lojaId:
                    req.usuario.lojaId

            };

            if (busca) {

                filtros.OR = [

                    {
                        nome: {
                            contains: busca
                        }
                    },

                    {
                        cpf: {
                            contains: busca
                        }
                    },

                    {
                        telefone: {
                            contains: busca
                        }
                    },

                    {
                        telefone2: {
                            contains: busca
                        }
                    },

                    {
                        cidade: {
                            contains: busca
                        }
                    }

                ];

            }

            const clientes =
                await prisma.cliente.findMany({

                    where: filtros,

                    include: {

                        vendas: {

                            include: {

                                veiculo: true

                            }

                        }

                    },

                    orderBy: {

                        clienteid: "desc"

                    }

                });

            return res.json(clientes);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao listar clientes"
            });

        }

    },

    /* =========================================
       DETALHAR CLIENTE
    ========================================= */

    async detalhar(req, res) {

        try {

            const { id } = req.params;

            const cliente =
                await prisma.cliente.findFirst({

                    where: {

                        clienteid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    },

                    include: {

                        vendas: {

                            include: {

                                veiculo: true,

                                vendedor: true

                            }

                        }

                    }

                });

            if (!cliente) {

                return res.status(404).json({
                    error: "Cliente não encontrado"
                });

            }

            return res.json(cliente);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao detalhar cliente"
            });

        }

    },

    /* =========================================
       ATUALIZAR CLIENTE
    ========================================= */

    async atualizar(req, res) {

        try {

            const { id } = req.params;

            const clienteExiste =
                await prisma.cliente.findFirst({

                    where: {

                        clienteid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!clienteExiste) {

                return res.status(404).json({
                    error: "Cliente não encontrado"
                });

            }

            const {

                nome,
                telefone,
                telefone2,
                rg,
                cpf,
                cep,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                complemento

            } = req.body;

            const cliente =
                await prisma.cliente.update({

                    where: {

                        clienteid:
                            Number(id)

                    },

                    data: {

                        nome,

                        telefone,

                        telefone2,

                        rg,

                        cpf,

                        cep,

                        endereco,

                        numero,

                        bairro,

                        cidade,

                        estado,

                        complemento

                    }

                });

            return res.json(cliente);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao atualizar cliente"
            });

        }

    },

    /* =========================================
       DELETAR CLIENTE
    ========================================= */

    async deletar(req, res) {

        try {

            const { id } = req.params;

            const clienteExiste =
                await prisma.cliente.findFirst({

                    where: {

                        clienteid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!clienteExiste) {

                return res.status(404).json({
                    error: "Cliente não encontrado"
                });

            }

            await prisma.cliente.delete({

                where: {

                    clienteid:
                        Number(id)

                }

            });

            return res.json({

                message:
                    "Cliente deletado com sucesso"

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao deletar cliente"
            });

        }

    }

};