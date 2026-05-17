const prisma = require("../database/prisma");
const PDFDocument = require("pdfkit");

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function dataBR(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR");
}

async function buscarVenda(vendaId, lojaId) {
    return await prisma.venda.findFirst({
        where: {
            vendaid: Number(vendaId),
            lojaId
        },
        include: {
            loja: true,
            cliente: true,
            veiculo: {
                include: {
                    historicos: true
                }
            },
            vendedor: true,
            contaRecebers: true,
            comissao: true
        }
    });
}

function criarPdf(res, nomeArquivo) {
    const doc = new PDFDocument({
        size: "A4",
        margin: 50
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `inline; filename="${nomeArquivo}.pdf"`
    );

    doc.pipe(res);

    return doc;
}

function titulo(doc, texto) {
    doc.fontSize(18)
        .font("Helvetica-Bold")
        .text(texto, { align: "center" });

    doc.moveDown(1);
}

function subtitulo(doc, texto) {
    doc.fontSize(13)
        .font("Helvetica-Bold")
        .text(texto);

    doc.moveDown(0.5);
}

function linha(doc, label, valor) {
    doc.fontSize(10)
        .font("Helvetica-Bold")
        .text(`${label}: `, { continued: true });

    doc.font("Helvetica")
        .text(valor || "-");
}

module.exports = {

    async contratoCompraVenda(req, res) {

        try {

            const { vendaId } = req.params;

            const venda = await buscarVenda(
                vendaId,
                req.usuario.lojaId
            );

            if (!venda) {
                return res.status(404).json({
                    error: "Venda não encontrada"
                });
            }

            const doc = criarPdf(
                res,
                `contrato-venda-${venda.vendaid}`
            );

            titulo(doc, "CONTRATO DE COMPRA E VENDA DE VEÍCULO");

            subtitulo(doc, "DADOS DA LOJA");
            linha(doc, "Loja", venda.loja.nome);
            linha(doc, "Telefone", venda.loja.telefone);
            doc.moveDown();

            subtitulo(doc, "DADOS DO COMPRADOR");
            linha(doc, "Nome", venda.cliente.nome);
            linha(doc, "CPF", venda.cliente.cpf);
            linha(doc, "Telefone", venda.cliente.telefone);
            linha(doc, "Cidade", venda.cliente.cidade);
            doc.moveDown();

            subtitulo(doc, "DADOS DO VEÍCULO");
            linha(doc, "Veículo", venda.veiculo.titulo);
            linha(doc, "Marca", venda.veiculo.marca);
            linha(doc, "Modelo", venda.veiculo.modelo);
            linha(doc, "Ano", String(venda.veiculo.ano));
            linha(doc, "Placa", venda.veiculo.placa);
            linha(doc, "Chassi", venda.veiculo.chassi);
            linha(doc, "Cor", venda.veiculo.cor);
            linha(doc, "KM", venda.veiculo.km ? String(venda.veiculo.km) : "-");
            linha(doc, "Tipo de estoque", venda.veiculo.tipoEstoque);
            doc.moveDown();

            subtitulo(doc, "CONDIÇÕES DA VENDA");
            linha(doc, "Valor da venda", moeda(venda.valorVenda));
            linha(doc, "Entrada", moeda(venda.entrada));
            linha(doc, "Parcelas", String(venda.parcelas || 1));
            linha(doc, "Forma de pagamento", venda.formaPagamento);
            linha(doc, "Data da venda", dataBR(venda.createdAt));
            linha(doc, "Vendedor", venda.vendedor ? venda.vendedor.nome : "-");
            doc.moveDown();

            subtitulo(doc, "CLÁUSULAS");
            doc.font("Helvetica")
                .fontSize(10)
                .text(
                    "O comprador declara estar ciente das condições do veículo acima descrito, tendo realizado ou autorizado a conferência visual e mecânica do bem antes da conclusão da compra.",
                    { align: "justify" }
                );

            doc.moveDown();

            doc.text(
                "A loja declara que as informações registradas neste contrato correspondem aos dados cadastrados no sistema no momento da venda.",
                { align: "justify" }
            );

            doc.moveDown(3);

            doc.text("____________________________________", { align: "center" });
            doc.text("Assinatura do comprador", { align: "center" });

            doc.moveDown(2);

            doc.text("____________________________________", { align: "center" });
            doc.text("Assinatura da loja", { align: "center" });

            doc.end();

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao gerar contrato"
            });

        }

    },

    async reciboPagamento(req, res) {

        try {

            const { vendaId } = req.params;

            const venda = await buscarVenda(
                vendaId,
                req.usuario.lojaId
            );

            if (!venda) {
                return res.status(404).json({
                    error: "Venda não encontrada"
                });
            }

            const doc = criarPdf(
                res,
                `recibo-venda-${venda.vendaid}`
            );

            titulo(doc, "RECIBO DE PAGAMENTO");

            doc.fontSize(11)
                .font("Helvetica")
                .text(
                    `Recebemos de ${venda.cliente.nome}, CPF ${venda.cliente.cpf || "-"}, o valor de ${moeda(venda.entrada || venda.valorVenda)}, referente à venda do veículo ${venda.veiculo.titulo}, placa ${venda.veiculo.placa || "-"}, realizada em ${dataBR(venda.createdAt)}.`,
                    { align: "justify" }
                );

            doc.moveDown();

            linha(doc, "Valor total da venda", moeda(venda.valorVenda));
            linha(doc, "Valor recebido", moeda(venda.entrada || venda.valorVenda));
            linha(doc, "Forma de pagamento", venda.formaPagamento);
            linha(doc, "Loja", venda.loja.nome);

            doc.moveDown(4);

            doc.text("____________________________________", { align: "center" });
            doc.text("Assinatura responsável", { align: "center" });

            doc.end();

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao gerar recibo"
            });

        }

    },

    async termoEntrega(req, res) {

        try {

            const { vendaId } = req.params;

            const venda = await buscarVenda(
                vendaId,
                req.usuario.lojaId
            );

            if (!venda) {
                return res.status(404).json({
                    error: "Venda não encontrada"
                });
            }

            const doc = criarPdf(
                res,
                `termo-entrega-${venda.vendaid}`
            );

            titulo(doc, "TERMO DE ENTREGA DO VEÍCULO");

            subtitulo(doc, "VEÍCULO ENTREGUE");
            linha(doc, "Veículo", venda.veiculo.titulo);
            linha(doc, "Marca", venda.veiculo.marca);
            linha(doc, "Modelo", venda.veiculo.modelo);
            linha(doc, "Ano", String(venda.veiculo.ano));
            linha(doc, "Placa", venda.veiculo.placa);
            linha(doc, "KM", venda.veiculo.km ? String(venda.veiculo.km) : "-");
            doc.moveDown();

            doc.font("Helvetica")
                .fontSize(10)
                .text(
                    `Declaro que recebi nesta data o veículo acima descrito, estando ciente das suas condições gerais, acessórios, quilometragem e estado de conservação.`,
                    { align: "justify" }
                );

            doc.moveDown();

            subtitulo(doc, "CHECKLIST DE ENTREGA");
            doc.font("Helvetica").fontSize(10);
            doc.text("(   ) Chave principal");
            doc.text("(   ) Chave reserva");
            doc.text("(   ) Documento do veículo");
            doc.text("(   ) Manual");
            doc.text("(   ) Revisão conferida");
            doc.text("(   ) Pneus conferidos");
            doc.text("(   ) Óleo conferido");
            doc.text("(   ) Transferência orientada");

            doc.moveDown(4);

            doc.text("____________________________________", { align: "center" });
            doc.text("Assinatura do comprador", { align: "center" });

            doc.end();

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao gerar termo de entrega"
            });

        }

    },

    async relatorioInternoVenda(req, res) {

        try {

            const { vendaId } = req.params;

            const venda = await buscarVenda(
                vendaId,
                req.usuario.lojaId
            );

            if (!venda) {
                return res.status(404).json({
                    error: "Venda não encontrada"
                });
            }

            const totalHistorico = venda.veiculo.historicos.reduce(
                (acc, item) => acc + Number(item.valor || 0),
                0
            );

            const lucroReal =
                Number(venda.valorVenda) -
                Number(venda.valorCompra) -
                totalHistorico -
                Number(venda.comissao?.valor || 0);

            const doc = criarPdf(
                res,
                `relatorio-interno-venda-${venda.vendaid}`
            );

            titulo(doc, "RELATÓRIO INTERNO DA VENDA");

            subtitulo(doc, "RESUMO DA VENDA");
            linha(doc, "Cliente", venda.cliente.nome);
            linha(doc, "Veículo", venda.veiculo.titulo);
            linha(doc, "Data", dataBR(venda.createdAt));
            linha(doc, "Vendedor", venda.vendedor ? venda.vendedor.nome : "-");
            doc.moveDown();

            subtitulo(doc, "FINANCEIRO");
            linha(doc, "Valor de compra", moeda(venda.valorCompra));
            linha(doc, "Valor de venda", moeda(venda.valorVenda));
            linha(doc, "Lucro bruto", moeda(venda.lucro));
            linha(doc, "Total histórico/despesas", moeda(totalHistorico));
            linha(doc, "Comissão", moeda(venda.comissao?.valor || 0));
            linha(doc, "Lucro real estimado", moeda(lucroReal));
            doc.moveDown();

            subtitulo(doc, "HISTÓRICO DO VEÍCULO");

            if (!venda.veiculo.historicos.length) {
                doc.font("Helvetica").fontSize(10).text("Nenhum histórico registrado.");
            } else {
                venda.veiculo.historicos.forEach((item) => {
                    doc.font("Helvetica")
                        .fontSize(10)
                        .text(`- ${dataBR(item.createdAt)} | ${item.descricao} | ${moeda(item.valor || 0)}`);
                });
            }

            doc.moveDown();

            subtitulo(doc, "PARCELAS");

            if (!venda.contaRecebers.length) {
                doc.font("Helvetica").fontSize(10).text("Venda sem parcelas cadastradas.");
            } else {
                venda.contaRecebers.forEach((parcela) => {
                    doc.font("Helvetica")
                        .fontSize(10)
                        .text(`- ${parcela.descricao} | ${moeda(parcela.valor)} | Vencimento: ${dataBR(parcela.vencimento)} | Status: ${parcela.status}`);
                });
            }

            doc.end();

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao gerar relatório interno"
            });

        }

    }

};