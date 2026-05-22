import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import prisma from "../database/prisma";

function parseBool(value: unknown): boolean {
    return value === "true" || value === true;
}

export default {
    async cadastrar(req: Request, res: Response) {
        try {
            const {
                titulo,
                marca,
                modelo,
                ano,
                anoModelo,
                placa,
                renavam,
                chassi,
                cor,
                km,
                possuiManual,
                possuiChaveReserva,
                valorCompra,
                valorVenda,
                tipo,
                tipoEstoque,
                observacoes,
                imagem
            } = req.body;

            const imagemUrl =
                imagem && String(imagem).trim()
                    ? String(imagem).trim()
                    : null;

            const veiculo = await prisma.veiculo.create({
                data: {
                    lojaId: req.usuario.lojaId,
                    titulo,
                    marca,
                    modelo,
                    ano: Number(ano),
                    anoModelo: anoModelo ? Number(anoModelo) : null,
                    placa,
                    renavam,
                    chassi,
                    cor,
                    km: km ? Number(km) : null,
                    possuiManual: parseBool(possuiManual),
                    possuiChaveReserva: parseBool(possuiChaveReserva),
                    valorCompra: valorCompra ? Number(valorCompra) : 0,
                    valorVenda: valorVenda ? Number(valorVenda) : 0,
                    imagem: imagemUrl,
                    tipo,
                    tipoEstoque,
                    observacoes
                }
            });

            return res.json(veiculo);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao cadastrar veículo"
            });
        }
    },

    async listar(req: Request, res: Response) {
        try {
            const { busca, status, tipoEstoque, tipo } = req.query;

            const filtros: Prisma.VeiculoWhereInput = {
                lojaId: req.usuario.lojaId
            };

            if (busca) {
                filtros.OR = [
                    { titulo: { contains: String(busca) } },
                    { placa: { contains: String(busca) } },
                    { chassi: { contains: String(busca) } },
                    { renavam: { contains: String(busca) } },
                    { modelo: { contains: String(busca) } }
                ];
            }

            if (status) filtros.status = status as Prisma.EnumStatusVeiculoFilter;
            if (tipoEstoque) filtros.tipoEstoque = tipoEstoque as Prisma.EnumTipoEstoqueFilter;
            if (tipo) filtros.tipo = tipo as Prisma.EnumTipoVeiculoFilter;

            const veiculos = await prisma.veiculo.findMany({
                where: filtros,
                include: {
                    historicos: true,
                    vendas: true
                },
                orderBy: { veiculoid: "desc" }
            });

            return res.json(veiculos);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao listar veículos"
            });
        }
    },

    async detalhar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const veiculo = await prisma.veiculo.findFirst({
                where: {
                    veiculoid: Number(id),
                    lojaId: req.usuario.lojaId
                },
                include: {
                    historicos: { orderBy: { historicoid: "desc" } },
                    vendas: {
                        include: {
                            cliente: true,
                            vendedor: true,
                            comissao: true
                        }
                    }
                }
            });

            if (!veiculo) {
                return res.status(404).json({
                    error: "Veículo não encontrado"
                });
            }

            return res.json(veiculo);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao detalhar veículo"
            });
        }
    },

    async buscarPorPlaca(req: Request, res: Response) {
        try {
            const { placa } = req.params;

            const veiculo = await prisma.veiculo.findFirst({
                where: {
                    placa: { contains: placa },
                    lojaId: req.usuario.lojaId
                },
                include: {
                    historicos: true,
                    vendas: {
                        include: {
                            cliente: true,
                            vendedor: true,
                            comissao: true
                        }
                    }
                }
            });

            if (!veiculo) {
                return res.status(404).json({
                    error: "Veículo não encontrado"
                });
            }

            return res.json(veiculo);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao buscar veículo"
            });
        }
    },

    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const veiculoExiste = await prisma.veiculo.findFirst({
                where: {
                    veiculoid: Number(id),
                    lojaId: req.usuario.lojaId
                }
            });

            if (!veiculoExiste) {
                return res.status(404).json({
                    error: "Veículo não encontrado"
                });
            }

            const {
                titulo,
                marca,
                modelo,
                ano,
                anoModelo,
                placa,
                renavam,
                chassi,
                cor,
                km,
                possuiManual,
                possuiChaveReserva,
                valorCompra,
                valorVenda,
                tipo,
                tipoEstoque,
                status,
                observacoes,
                imagem
            } = req.body;

            const data: Prisma.VeiculoUpdateInput = {
                titulo,
                marca,
                modelo,
                ano: Number(ano),
                anoModelo: anoModelo ? Number(anoModelo) : null,
                placa,
                renavam,
                chassi,
                cor,
                km: km ? Number(km) : null,
                possuiManual: parseBool(possuiManual),
                possuiChaveReserva: parseBool(possuiChaveReserva),
                valorCompra: valorCompra ? Number(valorCompra) : 0,
                valorVenda: valorVenda ? Number(valorVenda) : 0,
                tipo,
                tipoEstoque,
                status,
                observacoes
            };

            if (imagem !== undefined) {
                data.imagem =
                    imagem && String(imagem).trim()
                        ? String(imagem).trim()
                        : null;
            }

            const veiculo = await prisma.veiculo.update({
                where: { veiculoid: Number(id) },
                data
            });

            return res.json(veiculo);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao atualizar veículo"
            });
        }
    },

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const veiculoExiste = await prisma.veiculo.findFirst({
                where: {
                    veiculoid: Number(id),
                    lojaId: req.usuario.lojaId
                }
            });

            if (!veiculoExiste) {
                return res.status(404).json({
                    error: "Veículo não encontrado"
                });
            }

            await prisma.veiculo.delete({
                where: { veiculoid: Number(id) }
            });

            return res.json({
                message: "Veículo deletado com sucesso"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Erro ao deletar veículo"
            });
        }
    }
};
