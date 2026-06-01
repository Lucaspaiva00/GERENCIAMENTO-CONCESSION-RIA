import type { Request, Response } from "express";
import prisma from "../database/prisma";

class CtLojas {
    async listar(req: Request, res: Response) {
        const lojas = await prisma.loja.findMany({
            include: {
                usuarios: true,
                clientes: true,
                veiculos: true,
                vendas: true
            }
        });

        return res.json(lojas);
    }
}

export default new CtLojas();