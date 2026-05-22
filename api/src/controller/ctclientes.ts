import type { Request, Response } from "express";
import prisma from "../database/prisma";

export default {
    async cadastrar(req: Request, res: Response) {
        try {
            const {
                nome,
                telefone,
                telefone2,
                rg,
                cpf,
                cep,
                endereco,
                numero,
                bairro,
                cidade,
                estado
            } = req.body;

            if (!nome) {
                return res.status(400).json({
                    error: "Nome do cliente é obrigatório"
                });
            }

            const cliente = await prisma.cliente.create({
                data: {
                    lojaId: req.usuario.lojaId,
                    nome,
                    telefone,
                    telefone2,
                    rg,
                    cpf,
                    cep,
                    endereco,
                    numero,
                    bairro,
                    cidade,
                    estado
                }
            });

            return res.json(cliente);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao cadastrar cliente"
            });
        }
    },

    async listar(req: Request, res: Response) {
        try {
            const { busca } = req.query;

            const filtros: {
                lojaId: number;
                OR?: Array<Record<string, unknown>>;
            } = {
                lojaId: req.usuario.lojaId
            };

            if (busca) {
                filtros.OR = [
                    { nome: { contains: String(busca) } },
                    { cpf: { contains: String(busca) } },
                    { telefone: { contains: String(busca) } },
                    { telefone2: { contains: String(busca) } },
                    { cidade: { contains: String(busca) } }
                ];
            }

            const clientes = await prisma.cliente.findMany({
                where: filtros,
                include: {
                    vendas: {
                        include: { veiculo: true }
                    }
                },
                orderBy: { clienteid: "desc" }
            });

            return res.json(clientes);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao listar clientes"
            });
        }
    },

    async detalhar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const cliente = await prisma.cliente.findFirst({
                where: {
                    clienteid: Number(id),
                    lojaId: req.usuario.lojaId
                },
                include: {
                    vendas: {
                        include: {
                            veiculo: true,
                            vendedor: true
                        }
                    }
                }
            });

            if (!cliente) {
                return res.status(404).json({
                    error: "Cliente não encontrado"
                });
            }

            return res.json(cliente);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao detalhar cliente"
            });
        }
    },

    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const clienteExiste = await prisma.cliente.findFirst({
                where: {
                    clienteid: Number(id),
                    lojaId: req.usuario.lojaId
                }
            });

            if (!clienteExiste) {
                return res.status(404).json({
                    error: "Cliente não encontrado"
                });
            }

            const {
                nome,
                telefone,
                telefone2,
                rg,
                cpf,
                cep,
                endereco,
                numero,
                bairro,
                cidade,
                estado
            } = req.body;

            const cliente = await prisma.cliente.update({
                where: { clienteid: Number(id) },
                data: {
                    nome,
                    telefone,
                    telefone2,
                    rg,
                    cpf,
                    cep,
                    endereco,
                    numero,
                    bairro,
                    cidade,
                    estado
                }
            });

            return res.json(cliente);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao atualizar cliente"
            });
        }
    },

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const clienteExiste = await prisma.cliente.findFirst({
                where: {
                    clienteid: Number(id),
                    lojaId: req.usuario.lojaId
                }
            });

            if (!clienteExiste) {
                return res.status(404).json({
                    error: "Cliente não encontrado"
                });
            }

            await prisma.cliente.delete({
                where: { clienteid: Number(id) }
            });

            return res.json({
                message: "Cliente deletado com sucesso"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao deletar cliente"
            });
        }
    }
};
