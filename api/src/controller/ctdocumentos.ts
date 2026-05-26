import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import PDFDocument from "pdfkit";
import prisma from "../database/prisma";

const vendaInclude = {
    loja: true,
    cliente: true,
    veiculo: { include: { historicos: true } },
    vendedor: true,
    contaRecebers: true,
    comissao: true
} satisfies Prisma.VendaInclude;

type VendaCompleta = Prisma.VendaGetPayload<{ include: typeof vendaInclude }>;

function moeda(valor: number | null | undefined): string {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function dataBR(data: Date | string | null | undefined): string {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
}

async function buscarVenda(
    vendaId: string,
    lojaId: number
): Promise<VendaCompleta | null> {
    return prisma.venda.findFirst({
        where: {
            vendaid: Number(vendaId),
            lojaId
        },
        include: vendaInclude
    });
}

function criarPdf(res: Response, nomeArquivo: string): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `inline; filename="${nomeArquivo}.pdf"`
    );

    doc.pipe(res);
    return doc;
}

function titulo(doc: PDFKit.PDFDocument, texto: string): void {
    doc.fontSize(18).font("Helvetica-Bold").text(texto, { align: "center" });
    doc.moveDown(1);
}

function subtitulo(doc: PDFKit.PDFDocument, texto: string): void {
    doc.fontSize(13).font("Helvetica-Bold").text(texto);
    doc.moveDown(0.5);
}

function linha(
    doc: PDFKit.PDFDocument,
    label: string,
    valor: string | number | null | undefined
): void {
    doc.fontSize(10)
        .font("Helvetica-Bold")
        .text(`${label}: `, { continued: true });
    doc.font("Helvetica").text(String(valor ?? "-"));
}

export default {
    async contratoCompraVenda(req: Request, res: Response) {
        try {
            const { vendaId } = req.params;
            const venda = await buscarVenda(vendaId, req.usuario.lojaId);

            if (!venda) {
                return res.status(404).json({ error: "Venda não encontrada" });
            }

            const doc = criarPdf(res, `contrato-venda-${venda.vendaid}`);

            titulo(doc, "CONTRATO DE COMPRA E VENDA");
            subtitulo(doc, "DADOS DA LOJA");
            linha(doc, "Loja", venda.loja.nome);
            linha(doc, "Telefone", venda.loja.telefone);
            doc.moveDown();

            subtitulo(doc, "DADOS DO CLIENTE");
            linha(doc, "Nome", venda.cliente.nome);
            linha(doc, "CPF", venda.cliente.cpf);
            linha(doc, "Telefone", venda.cliente.telefone);
            linha(doc, "Cidade", venda.cliente.cidade);
            doc.moveDown();

            subtitulo(doc, "DADOS DO VEÍCULO");
            linha(doc, "Veículo", venda.veiculo.titulo);
            linha(doc, "Marca", venda.veiculo.marca);
            linha(doc, "Modelo", venda.veiculo.modelo);
            linha(doc, "Ano", venda.veiculo.ano);
            linha(doc, "Placa", venda.veiculo.placa);
            linha(doc, "RENAVAM", venda.veiculo.renavam);
            linha(doc, "Chassi", venda.veiculo.chassi);
            linha(doc, "Cor", venda.veiculo.cor);
            linha(doc, "KM", venda.veiculo.km);
            linha(doc, "Manual", venda.veiculo.possuiManual ? "SIM" : "NÃO");
            linha(
                doc,
                "Chave reserva",
                venda.veiculo.possuiChaveReserva ? "SIM" : "NÃO"
            );
            doc.moveDown();

            subtitulo(doc, "DADOS DA VENDA");
            linha(doc, "Valor compra", moeda(venda.valorCompra));
            linha(doc, "Valor venda", moeda(venda.valorVenda));
            linha(doc, "Entrada", moeda(venda.entrada));
            linha(doc, "Parcelas", venda.parcelas);
            linha(doc, "Forma pagamento", venda.formaPagamento);
            linha(doc, "Vendedor", venda.vendedor ? venda.vendedor.nome : "-");
            linha(doc, "Data venda", dataBR(venda.createdAt));
            doc.moveDown(2);

            doc.fontSize(10)
                .font("Helvetica")
                .text(
                    "O comprador declara estar ciente do estado geral do veículo, tendo realizado conferência visual e mecânica antes da conclusão da compra.",
                    { align: "justify" }
                );

            doc.moveDown(4);
            doc.text("__________________________________", { align: "center" });
            doc.text("Assinatura do comprador", { align: "center" });
            doc.moveDown(3);
            doc.text("__________________________________", { align: "center" });
            doc.text("Assinatura da loja", { align: "center" });
            doc.end();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao gerar contrato" });
        }
    },

    async reciboPagamento(req: Request, res: Response) {
        try {

            const { vendaId } = req.params;

            const venda =
                await buscarVenda(
                    vendaId,
                    req.usuario.lojaId
                );

            if (!venda) {
                return res.status(404).json({
                    error: "Venda não encontrada"
                });
            }

            const doc =
                criarPdf(
                    res,
                    `recibo-${venda.vendaid}`
                );

            /*
            CABEÇALHO
            */

            doc.fontSize(18)
                .font("Helvetica-Bold")
                .text(
                    venda.loja.nome.toUpperCase(),
                    {
                        align: "center"
                    }
                );

            doc.fontSize(10)
                .font("Helvetica")
                .text(
                    `${venda.cliente.endereco || ""}`,
                    {
                        align: "center"
                    }
                );

            doc.text(
                `Telefone: ${venda.loja.telefone || "-"}`,
                {
                    align: "center"
                }
            );

            doc.moveDown();

            /*
            TÍTULO
            */

            doc.fontSize(20)
                .font("Helvetica-Bold")
                .text(
                    "RECIBO",
                    {
                        align: "center"
                    }
                );

            doc.moveDown();

            /*
            VALOR
            */

            doc.fontSize(16)
                .font("Helvetica-Bold")
                .text(
                    moeda(venda.valorVenda),
                    {
                        align: "right"
                    }
                );

            doc.moveDown(2);

            /*
            TEXTO PRINCIPAL
            */

            doc.fontSize(11)
                .font("Helvetica")
                .text(
                    `Recebi de ${venda.cliente.nome}, inscrito(a) no CPF/MF ${venda.cliente.cpf || "-"
                    }, a importância de ${moeda(venda.valorVenda)}, referente à aquisição do veículo ${venda.veiculo.marca
                    } ${venda.veiculo.modelo}, ano ${venda.veiculo.ano}, cor ${venda.veiculo.cor || "-"
                    }, RENAVAM ${venda.veiculo.renavam || "-"
                    }, CHASSI ${venda.veiculo.chassi || "-"
                    }, tendo sido o pagamento realizado da seguinte forma:`,
                    {
                        align: "justify"
                    }
                );

            doc.moveDown();

            /*
            FORMA PAGAMENTO
            */

            doc.font("Helvetica-Bold")
                .text("Forma de pagamento:");

            doc.font("Helvetica")
                .text(
                    venda.observacoes ||
                    venda.formaPagamento ||
                    "-"
                );

            doc.moveDown(2);

            /*
            DATA
            */

            doc.text(
                `Jaguariúna, ${dataBR(
                    venda.createdAt
                )}.`,
                {
                    align: "left"
                }
            );

            doc.moveDown(4);

            /*
            ASSINATURA
            */

            doc.text(
                "_________________________________________",
                {
                    align: "center"
                }
            );

            doc.text(
                venda.loja.nome,
                {
                    align: "center"
                }
            );

            doc.end();

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao gerar recibo"
            });

        }
    }

    async termoEntrega(req: Request, res: Response) {
        try {
            const { vendaId } = req.params;
            const venda = await buscarVenda(vendaId, req.usuario.lojaId);

            if (!venda) {
                return res.status(404).json({ error: "Venda não encontrada" });
            }

            const doc = criarPdf(res, `termo-entrega-${venda.vendaid}`);

            titulo(doc, "TERMO DE ENTREGA");
            linha(doc, "Cliente", venda.cliente.nome);
            linha(doc, "Veículo", venda.veiculo.titulo);
            linha(doc, "Placa", venda.veiculo.placa);
            linha(doc, "Data entrega", dataBR(new Date()));
            doc.moveDown();

            subtitulo(doc, "CHECKLIST");
            doc.font("Helvetica").fontSize(10);
            doc.text(`( ${venda.veiculo.possuiManual ? "X" : " "} ) Manual`);
            doc.text(
                `( ${venda.veiculo.possuiChaveReserva ? "X" : " "} ) Chave reserva`
            );
            doc.text("(   ) Documento");
            doc.text("(   ) Revisão entregue");
            doc.text("(   ) Pneus conferidos");
            doc.text("(   ) Óleo conferido");
            doc.moveDown(5);
            doc.text("__________________________________", { align: "center" });
            doc.text("Assinatura comprador", { align: "center" });
            doc.end();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao gerar termo" });
        }
    },

    async termoResponsabilidade(req: Request, res: Response) {
        try {
            const { vendaId } = req.params;
            const venda = await buscarVenda(vendaId, req.usuario.lojaId);

            if (!venda) {
                return res.status(404).json({ error: "Venda não encontrada" });
            }

            const doc = criarPdf(res, `termo-responsabilidade-${venda.vendaid}`);

            titulo(doc, "TERMO DE RESPONSABILIDADE");
            doc.fontSize(11)
                .font("Helvetica")
                .text(
                    `Eu, ${venda.cliente.nome}, CPF ${venda.cliente.cpf || "-"}, declaro que recebi o veículo ${venda.veiculo.titulo}, placa ${venda.veiculo.placa || "-"}, estando ciente das condições gerais do automóvel.`,
                    { align: "justify" }
                );
            doc.moveDown();
            doc.text(
                "Declaro também que realizei conferência visual e mecânica do veículo antes da retirada.",
                { align: "justify" }
            );
            doc.moveDown(6);
            doc.text("__________________________________", { align: "center" });
            doc.text("Assinatura comprador", { align: "center" });
            doc.end();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao gerar termo" });
        }
    },

    async relatorioInternoVenda(req: Request, res: Response) {
        try {
            const { vendaId } = req.params;
            const venda = await buscarVenda(vendaId, req.usuario.lojaId);

            if (!venda) {
                return res.status(404).json({ error: "Venda não encontrada" });
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

            const doc = criarPdf(res, `relatorio-${venda.vendaid}`);

            titulo(doc, "RELATÓRIO INTERNO");
            linha(doc, "Cliente", venda.cliente.nome);
            linha(doc, "Veículo", venda.veiculo.titulo);
            linha(doc, "Vendedor", venda.vendedor ? venda.vendedor.nome : "-");
            linha(doc, "Valor compra", moeda(venda.valorCompra));
            linha(doc, "Valor venda", moeda(venda.valorVenda));
            linha(doc, "Lucro bruto", moeda(venda.lucro));
            linha(doc, "Comissão", moeda(venda.comissao?.valor || 0));
            linha(doc, "Despesas histórico", moeda(totalHistorico));
            linha(doc, "Lucro real", moeda(lucroReal));
            doc.moveDown();

            subtitulo(doc, "HISTÓRICO VEÍCULO");
            if (!venda.veiculo.historicos.length) {
                doc.font("Helvetica").fontSize(10).text("Nenhum histórico registrado.");
            } else {
                venda.veiculo.historicos.forEach((item) => {
                    doc.font("Helvetica")
                        .fontSize(10)
                        .text(
                            `- ${dataBR(item.createdAt)} | ${item.descricao} | ${moeda(item.valor)}`
                        );
                });
            }

            doc.moveDown();
            subtitulo(doc, "PARCELAS");

            if (!venda.contaRecebers.length) {
                doc.font("Helvetica").fontSize(10).text("Sem parcelas.");
            } else {
                venda.contaRecebers.forEach((parcela) => {
                    doc.font("Helvetica")
                        .fontSize(10)
                        .text(
                            `- ${parcela.descricao} | ${moeda(parcela.valor)} | ${dataBR(parcela.vencimento)} | ${parcela.status}`
                        );
                });
            }

            doc.end();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao gerar relatório" });
        }
    }
};
