const prisma = require("../database/prisma");

module.exports = {

    async indicadores(req, res) {

        try {

            const lojaId =
                req.usuario.lojaId;

            /* VEÍCULOS */

            const totalVeiculos =
                await prisma.veiculo.count({

                    where: {
                        lojaId
                    }

                });

            const vendidos =
                await prisma.veiculo.count({

                    where: {

                        lojaId,

                        status: "VENDIDO"

                    }

                });

            const consignados =
                await prisma.veiculo.count({

                    where: {

                        lojaId,

                        tipoEstoque:
                            "CONSIGNADO"

                    }

                });

            const disponiveis =
                await prisma.veiculo.count({

                    where: {

                        lojaId,

                        status:
                            "DISPONIVEL"

                    }

                });

            const manutencao =
                await prisma.veiculo.count({

                    where: {

                        lojaId,

                        status:
                            "MANUTENCAO"

                    }

                });

            /* FINANCEIRO */

            const entradas =
                await prisma.financeiro.aggregate({

                    where: {

                        lojaId,

                        tipo: "ENTRADA"

                    },

                    _sum: {

                        valor: true

                    }

                });

            const saidas =
                await prisma.financeiro.aggregate({

                    where: {

                        lojaId,

                        tipo: "SAIDA"

                    },

                    _sum: {

                        valor: true

                    }

                });

            const totalEntradas =
                entradas._sum.valor || 0;

            const totalSaidas =
                saidas._sum.valor || 0;

            const saldo =
                totalEntradas - totalSaidas;

            return res.json({

                veiculos: {

                    total:
                        totalVeiculos,

                    vendidos,

                    consignados,

                    disponiveis,

                    manutencao

                },

                financeiro: {

                    entradas:
                        totalEntradas,

                    saidas:
                        totalSaidas,

                    saldo

                }

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};