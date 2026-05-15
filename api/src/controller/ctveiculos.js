const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

            const imagem = req.file ? req.file.filename : null;

            const {
                lojaId,
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

            const veiculo = await prisma.veiculo.create({
                data: {
                    lojaId: Number(lojaId),
                    titulo,
                    marca,
                    modelo,
                    ano: Number(ano),
                    placa,
                    chassi,
                    cor,
                    km: km ? Number(km) : null,
                    valorCompra: Number(valorCompra),
                    valorVenda: Number(valorVenda),
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

                lojaId: Number(req.lojaId)

            };

            if (busca) {

                filtros.OR = [
                    {
                        titulo: {
                            contains: busca
                        }
                    },
                    {
                        marca: {
                            contains: busca
                        }
                    },
                    {
                        modelo: {
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
                filtros.tipoEstoque = tipoEstoque;
            }

            if (tipo) {
                filtros.tipo = tipo;
            }

            const veiculos = await prisma.veiculo.findMany({

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

            const veiculo = await prisma.veiculo.findUnique({
                where: {
                    veiculoid: Number(id)
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

            const imagem = req.file ? req.file.filename : undefined;

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

            const dadosAtualizacao = {
                titulo,
                marca,
                modelo,
                ano: ano ? Number(ano) : undefined,
                placa,
                chassi,
                cor,
                km: km ? Number(km) : null,
                valorCompra: valorCompra ? Number(valorCompra) : undefined,
                valorVenda: valorVenda ? Number(valorVenda) : undefined,
                tipo,
                tipoEstoque,
                status,
                observacoes
            };

            if (imagem) {
                dadosAtualizacao.imagem = imagem;
            }

            const veiculo = await prisma.veiculo.update({
                where: {
                    veiculoid: Number(id)
                },
                data: dadosAtualizacao
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
                    veiculoid: Number(id)
                }
            });

            return res.json({
                message: "Veículo deletado com sucesso"
            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};