const prisma = require("../database/prisma");

module.exports = {

    async indicadores(req, res) {

        try {

            const totalVeiculos = await prisma.veiculo.count();

            const disponiveis = await prisma.veiculo.count({
                where: {
                    status: "DISPONIVEL"
                }
            });

            const vendidos = await prisma.veiculo.count({
                where: {
                    status: "VENDIDO"
                }
            });

            const manutencao = await prisma.veiculo.count({
                where: {
                    status: "MANUTENCAO"
                }
            });

            const entradas = await prisma.financeiro.aggregate({
                _sum: {
                    valor: true
                },
                where: {
                    tipo: "ENTRADA"
                }
            });

            const saidas = await prisma.financeiro.aggregate({
                _sum: {
                    valor: true
                },
                where: {
                    tipo: "SAIDA"
                }
            });

            const pendentes = await prisma.financeiro.count({
                where: {
                    status: "PENDENTE"
                }
            });

            const totalEntradas = entradas._sum.valor || 0;

            const totalSaidas = saidas._sum.valor || 0;

            const saldo = totalEntradas - totalSaidas;

            return res.json({

                veiculos: {
                    total: totalVeiculos,
                    disponiveis: disponiveis,
                    vendidos: vendidos,
                    manutencao: manutencao
                },

                financeiro: {
                    entradas: totalEntradas,
                    saidas: totalSaidas,
                    saldo: saldo,
                    pendentes: pendentes
                }

            });

        } catch (error) {

            return res.status(500).json(error);

        }

    }

};