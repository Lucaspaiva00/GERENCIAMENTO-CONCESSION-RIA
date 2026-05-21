import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TipoUsuario } from "@prisma/client";
import prisma from "../database/prisma";

export default {
    async register(req: Request, res: Response) {
        try {
            const { nomeLoja, telefoneLoja, nome, email, senha } = req.body;

            const usuarioExiste = await prisma.usuario.findUnique({
                where: { email }
            });

            if (usuarioExiste) {
                return res.status(400).json({
                    error: "E-mail já cadastrado"
                });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const loja = await prisma.loja.create({
                data: {
                    nome: nomeLoja,
                    telefone: telefoneLoja
                }
            });

            const usuario = await prisma.usuario.create({
                data: {
                    lojaId: loja.lojaid,
                    nome,
                    email,
                    senha: senhaHash,
                    tipo: TipoUsuario.ADMIN
                }
            });

            return res.json({
                message: "Conta criada com sucesso",
                usuario
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;

            const usuario = await prisma.usuario.findUnique({
                where: { email }
            });

            if (!usuario) {
                return res.status(400).json({
                    error: "Usuário não encontrado"
                });
            }

            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

            if (!senhaCorreta) {
                return res.status(400).json({
                    error: "Senha inválida"
                });
            }

            const token = jwt.sign(
                {
                    usuarioid: usuario.usuarioid,
                    lojaId: usuario.lojaId,
                    tipo: usuario.tipo
                },
                process.env.JWT_SECRET as string,
                { expiresIn: "7d" }
            );

            return res.json({
                token,
                usuario: {
                    usuarioid: usuario.usuarioid,
                    lojaId: usuario.lojaId,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo,
                    comissaoPercentual: usuario.comissaoPercentual
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async cadastrar(req: Request, res: Response) {
        try {
            const { nome, email, senha, tipo, comissaoPercentual } = req.body;

            const usuarioExiste = await prisma.usuario.findUnique({
                where: { email }
            });

            if (usuarioExiste) {
                return res.status(400).json({
                    error: "E-mail já cadastrado"
                });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const usuario = await prisma.usuario.create({
                data: {
                    lojaId: req.usuario.lojaId,
                    nome,
                    email,
                    senha: senhaHash,
                    tipo,
                    comissaoPercentual: Number(comissaoPercentual || 0)
                }
            });

            return res.json(usuario);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async listar(req: Request, res: Response) {
        try {
            const usuarios = await prisma.usuario.findMany({
                where: { lojaId: req.usuario.lojaId },
                orderBy: { usuarioid: "desc" }
            });

            return res.json(usuarios);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async detalhar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const usuario = await prisma.usuario.findFirst({
                where: {
                    usuarioid: Number(id),
                    lojaId: req.usuario.lojaId
                }
            });

            if (!usuario) {
                return res.status(404).json({
                    error: "Usuário não encontrado"
                });
            }

            return res.json(usuario);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { nome, email, tipo, comissaoPercentual } = req.body;

            const usuarioExiste = await prisma.usuario.findFirst({
                where: {
                    usuarioid: Number(id),
                    lojaId: req.usuario.lojaId
                }
            });

            if (!usuarioExiste) {
                return res.status(404).json({
                    error: "Usuário não encontrado"
                });
            }

            const usuario = await prisma.usuario.update({
                where: { usuarioid: Number(id) },
                data: {
                    nome,
                    email,
                    tipo,
                    comissaoPercentual: Number(comissaoPercentual || 0)
                }
            });

            return res.json(usuario);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const usuarioExiste = await prisma.usuario.findFirst({
                where: {
                    usuarioid: Number(id),
                    lojaId: req.usuario.lojaId
                }
            });

            if (!usuarioExiste) {
                return res.status(404).json({
                    error: "Usuário não encontrado"
                });
            }

            await prisma.usuario.delete({
                where: { usuarioid: Number(id) }
            });

            return res.json({
                message: "Usuário deletado com sucesso"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
};
