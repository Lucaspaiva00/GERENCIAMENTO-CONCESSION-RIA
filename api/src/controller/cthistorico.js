const prisma = require("../database/prisma");

module.exports = {

    async cadastrar(req, res) {

        try {

            const {
                veiculoId,
                descricao,
                valor
            } = req.body;

            const historico = await prisma.historicoVeiculo.create({
                data: {
                    veiculoId: Number(veiculoId),
                    descricao,
                    valor: valor ? Number(valor) : null
                }
            });

            if (valor && Number(valor) > 0) {

                const veiculo = await prisma.veiculo.findUnique({
                    where: {
                        veiculoid: Number(veiculoId)
                    }
                });

                await prisma.financeiro.create({
                    data: {
                        lojaId: veiculo.lojaId,
                        descricao: `Histórico veículo: ${descricao}`,
                        tipo: "SAIDA",
                        valor: Number(valor),
                        status: "PAGO"
                    }
                });

            }

            return res.json(historico);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async listar(req, res) {

        try {

            const { veiculoId } = req.params;

            const historicos = await prisma.historicoVeiculo.findMany({

                where: {
                    veiculoId: Number(veiculoId)
                },

                orderBy: {
                    historicoid: "desc"
                }

            });

            return res.json(historicos);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async deletar(req, res) {

        try {

            const { id } = req.params;

            await prisma.historicoVeiculo.delete({
                where: {
                    historicoid: Number(id)
                }
            });

            return res.json({
                message: "Histórico deletado com sucesso"
            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};