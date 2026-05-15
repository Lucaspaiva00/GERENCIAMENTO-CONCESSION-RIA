const prisma = require("../database/prisma");

module.exports = {

    async vender(req, res) {

        try {

            const {
                lojaId,
                clienteId,
                veiculoId,
                vendedorId,
                valorVenda,
                observacoes
            } = req.body;

            const veiculo = await prisma.veiculo.findUnique({
                where: {
                    veiculoid: Number(veiculoId)
                }
            });

            if (!veiculo) {
                return res.status(404).json({
                    error: "Veículo não encontrado"
                });
            }

            if (veiculo.status === "VENDIDO") {
                return res.status(400).json({
                    error: "Veículo já vendido"
                });
            }

            const lucro =
                Number(valorVenda) - Number(veiculo.valorCompra);

            const venda = await prisma.venda.create({
                data: {
                    lojaId: Number(lojaId),
                    clienteId: Number(clienteId),
                    veiculoId: Number(veiculoId),
                    vendedorId: vendedorId
                        ? Number(vendedorId)
                        : null,
                    valorVenda: Number(valorVenda),
                    valorCompra: Number(veiculo.valorCompra),
                    lucro,
                    observacoes
                }
            });

            await prisma.veiculo.update({
                where: {
                    veiculoid: Number(veiculoId)
                },
                data: {
                    status: "VENDIDO"
                }
            });

            await prisma.financeiro.create({
                data: {
                    lojaId: Number(lojaId),
                    descricao: `Venda do veículo ${veiculo.titulo}`,
                    tipo: "ENTRADA",
                    valor: Number(valorVenda),
                    status: "PAGO"
                }
            });

            // COMISSÃO AUTOMÁTICA

            if (vendedorId) {

                const vendedor = await prisma.usuario.findUnique({
                    where: {
                        usuarioid: Number(vendedorId)
                    }
                });

                if (
                    vendedor &&
                    vendedor.comissaoPercentual > 0
                ) {

                    const valorComissao =
                        (Number(valorVenda) *
                            vendedor.comissaoPercentual) / 100;

                    await prisma.comissao.create({
                        data: {
                            vendaId: venda.vendaid,
                            vendedorId: vendedor.usuarioid,
                            percentual:
                                vendedor.comissaoPercentual,
                            valor: valorComissao
                        }
                    });

                }

            }

            return res.json({
                message: "Venda realizada com sucesso",
                venda
            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    async listar(req, res) {

        try {

            const vendas = await prisma.venda.findMany({

                include: {
                    cliente: true,
                    veiculo: true,
                    vendedor: true,
                    comissao: true
                },

                orderBy: {
                    vendaid: "desc"
                }

            });

            return res.json(vendas);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};