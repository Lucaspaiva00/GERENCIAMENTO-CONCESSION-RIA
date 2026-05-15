const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

            console.log(req.body);

            const imagem =
                req.file
                    ? req.file.filename
                    : null;

            const {
                titulo,
                marca,
                modelo,
                ano,
                placa,
                chassi,
                cor,
                km,
                valorCompra,
                valorVenda,
                tipo,
                tipoEstoque,
                observacoes
            } = req.body;

            const veiculo =
                await prisma.veiculo.create({

                    data: {

                        lojaId: req.usuario.lojaId,

                        titulo,

                        marca,

                        modelo,

                        ano:
                            ano
                                ? Number(ano)
                                : null,

                        placa,

                        chassi,

                        cor,

                        km:
                            km
                                ? Number(km)
                                : null,

                        valorCompra:
                            valorCompra
                                ? Number(valorCompra)
                                : 0,

                        valorVenda:
                            valorVenda
                                ? Number(valorVenda)
                                : 0,

                        imagem,

                        tipo,

                        tipoEstoque,

                        observacoes

                    }

                });

            return res.json(veiculo);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async listar(req, res) {

        try {

            const {
                busca,
                status,
                tipoEstoque,
                tipo
            } = req.query;

            const filtros = {

                lojaId: req.usuario.lojaId

            };

            if (busca) {

                filtros.OR = [

                    {
                        titulo: {
                            contains: busca
                        }
                    },

                    {
                        placa: {
                            contains: busca
                        }
                    }

                ];

            }

            if (status) {

                filtros.status = status;

            }

            if (tipoEstoque) {

                filtros.tipoEstoque =
                    tipoEstoque;

            }

            if (tipo) {

                filtros.tipo = tipo;

            }

            const veiculos =
                await prisma.veiculo.findMany({

                    where: filtros,

                    orderBy: {
                        veiculoid: "desc"
                    }

                });

            return res.json(veiculos);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async detalhar(req, res) {

        try {

            const { id } = req.params;

            const veiculo =
                await prisma.veiculo.findFirst({

                    where: {

                        veiculoid:
                            Number(id),

                        lojaId: req.usuario.lojaId

                    }

                });

            return res.json(veiculo);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async atualizar(req, res) {

        try {

            const { id } = req.params;

            const imagem =
                req.file
                    ? req.file.filename
                    : undefined;

            const {
                titulo,
                marca,
                modelo,
                ano,
                placa,
                chassi,
                cor,
                km,
                valorCompra,
                valorVenda,
                tipo,
                tipoEstoque,
                status,
                observacoes
            } = req.body;

            const data = {

                titulo,

                marca,

                modelo,

                ano:
                    ano
                        ? Number(ano)
                        : null,

                placa,

                chassi,

                cor,

                km:
                    km
                        ? Number(km)
                        : null,

                valorCompra:
                    valorCompra
                        ? Number(valorCompra)
                        : 0,

                valorVenda:
                    valorVenda
                        ? Number(valorVenda)
                        : 0,

                tipo,

                tipoEstoque,

                status,

                observacoes

            };

            if (imagem) {

                data.imagem = imagem;

            }

            const veiculo =
                await prisma.veiculo.update({

                    where: {

                        veiculoid:
                            Number(id)

                    },

                    data

                });

            return res.json(veiculo);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async deletar(req, res) {

        try {

            const { id } = req.params;

            await prisma.veiculo.delete({

                where: {

                    veiculoid:
                        Number(id)

                }

            });

            return res.json({

                message:
                    "Veículo deletado com sucesso"

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};