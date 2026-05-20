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
                anoModelo,
                placa,
                renavam,
                chassi,
                cor,
                km,
                possuiManual,
                possuiChaveReserva,
                valorCompra,
                valorVenda,
                tipo,
                tipoEstoque,
                observacoes
            } = req.body;

            const veiculo =
                await prisma.veiculo.create({

                    data: {

                        lojaId:
                            req.usuario.lojaId,

                        titulo,

                        marca,

                        modelo,

                        ano:
                            ano
                                ? Number(ano)
                                : null,

                        anoModelo:
                            anoModelo
                                ? Number(anoModelo)
                                : null,

                        placa,

                        renavam,

                        chassi,

                        cor,

                        km:
                            km
                                ? Number(km)
                                : null,

                        possuiManual:
                            possuiManual === "true"
                            ||
                            possuiManual === true,

                        possuiChaveReserva:
                            possuiChaveReserva === "true"
                            ||
                            possuiChaveReserva === true,

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

            return res.status(500).json({
                error: "Erro ao cadastrar veículo"
            });

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

                lojaId:
                    req.usuario.lojaId

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
                    },

                    {
                        chassi: {
                            contains: busca
                        }
                    },

                    {
                        renavam: {
                            contains: busca
                        }
                    },

                    {
                        modelo: {
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

                    include: {

                        historicos: true,

                        vendas: true

                    },

                    orderBy: {
                        veiculoid: "desc"
                    }

                });

            return res.json(veiculos);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao listar veículos"
            });

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

                        lojaId:
                            req.usuario.lojaId

                    },

                    include: {

                        historicos: {

                            orderBy: {
                                historicoid: "desc"
                            }

                        },

                        vendas: {

                            include: {

                                cliente: true,

                                vendedor: true,

                                comissao: true

                            }

                        }

                    }

                });

            if (!veiculo) {

                return res.status(404).json({
                    error: "Veículo não encontrado"
                });

            }

            return res.json(veiculo);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao detalhar veículo"
            });

        }

    },

    async buscarPorPlaca(req, res) {

        try {

            const { placa } = req.params;

            const veiculo =
                await prisma.veiculo.findFirst({

                    where: {

                        placa: {
                            contains: placa
                        },

                        lojaId:
                            req.usuario.lojaId

                    },

                    include: {

                        historicos: true,

                        vendas: {

                            include: {

                                cliente: true,

                                vendedor: true,

                                comissao: true

                            }

                        }

                    }

                });

            if (!veiculo) {

                return res.status(404).json({
                    error: "Veículo não encontrado"
                });

            }

            return res.json(veiculo);

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao buscar veículo"
            });

        }

    },

    async atualizar(req, res) {

        try {

            const { id } = req.params;

            const veiculoExiste =
                await prisma.veiculo.findFirst({

                    where: {

                        veiculoid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!veiculoExiste) {

                return res.status(404).json({
                    error: "Veículo não encontrado"
                });

            }

            const imagem =
                req.file
                    ? req.file.filename
                    : undefined;

            const {
                titulo,
                marca,
                modelo,
                ano,
                anoModelo,
                placa,
                renavam,
                chassi,
                cor,
                km,
                possuiManual,
                possuiChaveReserva,
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

                anoModelo:
                    anoModelo
                        ? Number(anoModelo)
                        : null,

                placa,

                renavam,

                chassi,

                cor,

                km:
                    km
                        ? Number(km)
                        : null,

                possuiManual:
                    possuiManual === "true"
                    ||
                    possuiManual === true,

                possuiChaveReserva:
                    possuiChaveReserva === "true"
                    ||
                    possuiChaveReserva === true,

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

            return res.status(500).json({
                error: "Erro ao atualizar veículo"
            });

        }

    },

    async deletar(req, res) {

        try {

            const { id } = req.params;

            const veiculoExiste =
                await prisma.veiculo.findFirst({

                    where: {

                        veiculoid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!veiculoExiste) {

                return res.status(404).json({
                    error: "Veículo não encontrado"
                });

            }

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

            return res.status(500).json({
                error: "Erro ao deletar veículo"
            });

        }

    }

};