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
                `recibo-${venda.vendaid}`
            );

            /* =========================
               CABEÇALHO EMPRESA
            ========================= */

            doc
                .font("Helvetica-Bold")
                .fontSize(20)
                .text(
                    venda.loja.nome.toUpperCase(),
                    {
                        align: "center"
                    }
                );

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(
                    venda.cliente.endereco
                        ? `${venda.cliente.endereco}${venda.cliente.numero ? `, ${venda.cliente.numero}` : ""
                        }`
                        : "",
                    {
                        align: "center"
                    }
                );

            doc.text(
                venda.cliente.bairro || "",
                {
                    align: "center"
                }
            );

            doc.text(
                `${venda.cliente.cidade || ""}${venda.cliente.estado
                    ? ` - ${venda.cliente.estado}`
                    : ""
                }`,
                {
                    align: "center"
                }
            );

            doc.text(
                `CEP: ${venda.cliente.cep || "-"
                }   Tel: ${venda.loja.telefone || "-"
                }`,
                {
                    align: "center"
                }
            );

            doc.moveDown(2);

            /* =========================
               TITULO
            ========================= */

            doc
                .font("Helvetica-Bold")
                .fontSize(22)
                .text(
                    "R E C I B O",
                    {
                        align: "center"
                    }
                );

            doc.moveDown();

            /* =========================
               VALOR
            ========================= */

            doc
                .font("Helvetica-Bold")
                .fontSize(18)
                .text(
                    moeda(venda.valorVenda),
                    {
                        align: "left"
                    }
                );

            doc.moveDown();

            /* =========================
               TEXTO PRINCIPAL
            ========================= */

            doc
                .font("Helvetica")
                .fontSize(11)
                .text(
                    `Recebi de ${venda.cliente.nome}, inscrito(a) no CPF/MF ${venda.cliente.cpf || "-"
                    }, a importância de ${moeda(venda.valorVenda)}, referente à aquisição do veículo ${venda.veiculo.marca
                    } ${venda.veiculo.modelo}, Ano ${venda.veiculo.ano}, Cor ${venda.veiculo.cor || "-"
                    }, Renavam ${venda.veiculo.renavam || "-"
                    }, Chassi ${venda.veiculo.chassi || "-"
                    }, tendo sido o pagamento realizado da seguinte forma:`,
                    {
                        align: "justify"
                    }
                );

            doc.moveDown();

            /* =========================
               PAGAMENTO
            ========================= */

            doc
                .font("Helvetica")
                .fontSize(11);

            if (venda.observacoes) {

                const linhas =
                    venda.observacoes
                        .split("\n")
                        .filter(Boolean);

                linhas.forEach(linha => {
                    doc.text(`- ${linha}`);
                });

            } else {

                doc.text(
                    `- ${moeda(venda.entrada || venda.valorVenda)} através de ${venda.formaPagamento || "pagamento informado"
                    }.`
                );

            }

            doc.moveDown(2);

            /* =========================
               DATA
            ========================= */

            doc.text(
                `${venda.cliente.cidade || "Jaguariúna"}, ${dataBR(venda.createdAt)}.`,
                {
                    align: "left"
                }
            );

            doc.moveDown(4);

            /* =========================
               ASSINATURA
            ========================= */

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
    },

    async termoEntrega(req: Request, res: Response) {
        try {

            const { vendaId } = req.params;
            const manual =
                req.query.manual === "true";

            const chaveReserva =
                req.query.chaveReserva === "true";

            const documento =
                req.query.documento !== "false";

            const reciboEntregue =
                req.query.reciboEntregue === "true";

            const recibo5Dias =
                req.query.recibo5Dias === "true";

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
                    `termo-entrega-${venda.vendaid}`
                );

            /* =========================
               CABEÇALHO
            ========================= */
            doc
                .font("Helvetica")
                .fontSize(10);

            doc.text(
                venda.loja.endereco
                    ? `${venda.loja.endereco}${venda.loja.numero ? `, ${venda.loja.numero}` : ""}`
                    : "",
                {
                    align: "center"
                }
            );

            doc.text(
                venda.loja.bairro || "",
                {
                    align: "center"
                }
            );

            doc.text(
                `${venda.loja.cidade || ""}${venda.loja.estado ? ` - ${venda.loja.estado}` : ""}`,
                {
                    align: "center"
                }
            );

            doc.moveDown(2);

            /* =========================
               DADOS VEÍCULO
            ========================= */

            doc
                .font("Helvetica-Bold")
                .fontSize(16)
                .text(
                    "TERMO DE ENTREGA E GARANTIA",
                    {
                        align: "center"
                    }
                );

            doc.moveDown();

            subtitulo(doc, "DADOS DO VEÍCULO");

            linha(doc, "Marca", venda.veiculo.marca);
            linha(doc, "Modelo", venda.veiculo.modelo);
            linha(
                doc,
                "Ano",
                `${venda.veiculo.ano}/${venda.veiculo.anoModelo}`
            );
            linha(doc, "Cor", venda.veiculo.cor);
            linha(doc, "Placa", venda.veiculo.placa);
            linha(doc, "RENAVAM", venda.veiculo.renavam);
            linha(doc, "Chassi", venda.veiculo.chassi);
            linha(doc, "Quilometragem", `${venda.veiculo.km} KM`);

            doc.moveDown();

            /* =========================
               GARANTIA
            ========================= */

            subtitulo(doc, "TERMO DE GARANTIA");

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(
                    "1. O veículo acima descrito possui garantia de motor e câmbio pelo prazo de 90 (noventa) dias a partir da data da venda."
                );

            doc.moveDown(0.5);

            doc.text(
                "2. A garantia não cobre itens de desgaste natural, revisões periódicas, regulagens, freios, embreagem, suspensão, pneus, bateria, lâmpadas ou quaisquer componentes consumíveis."
            );

            doc.moveDown(0.5);

            doc.text(
                "3. A garantia será automaticamente cancelada em casos de mau uso, modificações não autorizadas, utilização inadequada ou manutenção realizada por terceiros sem autorização."
            );

            doc.moveDown();

            /* =========================
               DECLARAÇÃO
            ========================= */

            subtitulo(
                doc,
                "DECLARAÇÃO DE RECEBIMENTO"
            );

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(
                    `Declaro que recebi nesta data o veículo acima descrito, tendo realizado conferência visual, teste de funcionamento e inspeção geral de suas condições. Declaro ainda estar ciente das condições do veículo e das informações recebidas sobre sua utilização e manutenção.`,
                    {
                        align: "justify"
                    }
                );

            doc.moveDown();

            /* =========================
               CHECKLIST
            ========================= */

            subtitulo(doc, "RECEBI NESTE ATO");

            doc.text(
                `( ${chaveReserva ? "X" : " "} ) Chave reserva`
            );

            doc.text(
                `( ${manual ? "X" : " "} ) Manual do veículo`
            );

            doc.text(
                `( ${documento ? "X" : " "} ) CRLV / Documento`
            );

            doc.text(
                `( ${reciboEntregue ? "X" : " "} ) Recibo de compra e venda preenchido`
            );

            doc.text(
                `( ${recibo5Dias ? "X" : " "} ) Recibo será entregue em até 5 dias`
            );

            doc.moveDown();

            linha(
                doc,
                "Data da entrega",
                dataBR(venda.createdAt)
            );

            doc.moveDown(4);

            /* =========================
               ASSINATURAS
            ========================= */

            doc.text(
                "________________________________________",
                {
                    align: "center"
                }
            );

            doc.text(
                venda.cliente.nome,
                {
                    align: "center"
                }
            );

            doc.text(
                "Cliente",
                {
                    align: "center"
                }
            );

            doc.moveDown(4);

            doc.text(
                "________________________________________",
                {
                    align: "center"
                }
            );

            doc.text(
                venda.vendedor
                    ? venda.vendedor.nome
                    : venda.loja.nome,
                {
                    align: "center"
                }
            );

            doc.text(
                "Responsável pela entrega",
                {
                    align: "center"
                }
            );

            doc.end();

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao gerar termo"
            });

        }
    },
    async termoResponsabilidade(req: Request, res: Response) {
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
                    `termo-responsabilidade-${venda.vendaid}`
                );

            /* =========================
               CABEÇALHO
            ========================= */
            doc
                .font("Helvetica-Bold")
                .fontSize(20)
                .text(venda.loja.nome.toUpperCase(), { align: "center" });

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(
                    venda.loja.endereco
                        ? `${venda.loja.endereco}${venda.loja.numero ? `, ${venda.loja.numero}` : ""}`
                        : "Rua Cândido Bueno, 707",
                    { align: "center" }
                );

            doc.text(
                venda.loja.bairro || "Centro",
                { align: "center" }
            );

            doc.text(
                `${venda.loja.cidade || "Jaguariúna"} - ${venda.loja.estado || "SP"}`,
                { align: "center" }
            );

            doc.text(
                `CEP: ${venda.loja.cep || "13910-033"}   Tel: ${venda.loja.telefone || "-"}`,
                { align: "center" }
            );

            doc.moveDown(2);

            /* =========================
               TITULO
            ========================= */

            doc
                .font("Helvetica-Bold")
                .fontSize(18)
                .text(
                    "TERMO DE RESPONSABILIDADE",
                    {
                        align: "center"
                    }
                );

            doc.text(
                "SOBRE MULTAS",
                {
                    align: "center"
                }
            );

            doc.moveDown(2);

            /* =========================
               TEXTO
            ========================= */

            doc
                .font("Helvetica")
                .fontSize(11)
                .text(
                    `Eu, ${venda.cliente.nome}, portador(a) da cédula de identidade RG nº ${venda.cliente.rg || "-"
                    } e do CPF/MF sob o nº ${venda.cliente.cpf || "-"
                    }, residente e domiciliado(a) em ${venda.cliente.endereco || "-"
                    } ${venda.cliente.numero || ""
                    }, bairro ${venda.cliente.bairro || "-"
                    }, cidade de ${venda.cliente.cidade || "-"
                    } - ${venda.cliente.estado || "-"
                    }, CEP ${venda.cliente.cep || "-"
                    }, declaro para os devidos fins civis, administrativos e criminais que, a partir desta data, me responsabilizo por qualquer ato praticado na condução do veículo de marca ${venda.veiculo.marca
                    } ${venda.veiculo.modelo}, Ano ${venda.veiculo.ano}${venda.veiculo.anoModelo
                        ? `/${venda.veiculo.anoModelo}`
                        : ""
                    }, Placa ${venda.veiculo.placa || "-"
                    }, RENAVAM ${venda.veiculo.renavam || "-"
                    }, Cor ${venda.veiculo.cor || "-"
                    }, CHASSI ${venda.veiculo.chassi || "-"
                    }, bem como pela propriedade do mesmo, adquirido de ${venda.loja.nome}.`,
                    {
                        align: "justify"
                    }
                );

            doc.moveDown();

            doc.text(
                "O presente termo isenta o vendedor das responsabilidades inerentes às infrações de trânsito cometidas após a data de assinatura deste documento.",
                {
                    align: "justify"
                }
            );

            doc.moveDown(3);

            doc.text(
                `${venda.cliente.cidade || "Jaguariúna"}, ${dataBR(
                    venda.createdAt
                )}.`,
                {
                    align: "left"
                }
            );

            doc.moveDown(5);

            /* =========================
               ASSINATURA
            ========================= */

            doc.text(
                "________________________________________",
                {
                    align: "center"
                }
            );

            doc.text(
                venda.cliente.nome,
                {
                    align: "center"
                }
            );

            doc.end();

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                error: "Erro ao gerar termo"
            });

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
