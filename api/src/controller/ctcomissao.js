const prisma =
    require("../database/prisma");

module.exports = {

    async listar(req, res) {

        try {

            const vendedores =
                await prisma.usuario.findMany({

                    where: {

                        lojaId:
                            req.usuario.lojaId,

                        tipo:
                            "VENDEDOR"

                    },

                    include: {

                        vendas: true,

                        comissaos: true

                    }

                });

            const resultado =
                vendedores.map(vendedor => {

                    const totalVendido =
                        vendedor.vendas.reduce(
                            (acc, venda) =>
                                acc + Number(venda.valorVenda || 0),
                            0
                        );

                    const totalComissao =
                        vendedor.comissaos.reduce(
                            (acc, item) =>
                                acc + Number(item.valor || 0),
                            0
                        );

                    return {

                        vendedorId:
                            vendedor.usuarioid,

                        nome:
                            vendedor.nome,

                        quantidadeVendas:
                            vendedor.vendas.length,

                        totalVendido,

                        totalComissao

                    };

                });

            return res.json(resultado);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};