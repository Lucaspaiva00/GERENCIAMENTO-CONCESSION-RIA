import type { Request, Response } from "express";
import prisma from "../database/prisma";

class CtLojas {

    async listar(req: Request, res: Response) {
        try {

            const lojas = await prisma.loja.findMany({
                orderBy: {
                    lojaid: "asc"
                },
                include: {
                    _count: {
                        select: {
                            usuarios: true,
                            clientes: true,
                            veiculos: true,
                            vendas: true,
                            financeiro: true
                        }
                    }
                }
            });

            return res.status(200).json(lojas);

        } catch (error) {

            console.error("Erro ao listar lojas:", error);

            return res.status(500).json({
                error: "Erro ao listar lojas"
            });

        }
    }

    async detalhar(req: Request, res: Response) {
        try {

            const { id } = req.params;

            const loja = await prisma.loja.findUnique({
                where: {
                    lojaid: Number(id)
                },
                include: {
                    usuarios: true,
                    clientes: true,
                    veiculos: true,
                    vendas: true,
                    financeiro: true
                }
            });

            if (!loja) {
                return res.status(404).json({
                    error: "Loja não encontrada"
                });
            }

            return res.status(200).json(loja);

        } catch (error) {

            console.error("Erro ao detalhar loja:", error);

            return res.status(500).json({
                error: "Erro ao detalhar loja"
            });

        }
    }
}

export default new CtLojas();