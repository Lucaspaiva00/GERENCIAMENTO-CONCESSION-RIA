const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

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
                }
            });

            return res.json(veiculo);

        } catch (error) {

            return res.status(500).json(error);

        }

    },

    async listar(req, res) {

        try {

            const veiculos = await prisma.veiculo.findMany({
                orderBy: {
                    veiculoid: "desc"
                }
            });

            return res.json(veiculos);

        } catch (error) {

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

            return res.status(500).json(error);

        }

    },

    async atualizar(req, res) {

        try {

            const { id } = req.params;

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

            const veiculo = await prisma.veiculo.update({
                where: {
                    veiculoid: Number(id)
                },
                data: {
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
                }
            });

            return res.json(veiculo);

        } catch (error) {

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

            return res.status(500).json(error);

        }

    }

};