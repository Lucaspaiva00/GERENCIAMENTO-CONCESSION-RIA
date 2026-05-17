// api/controller/ctusuarios.js

const prisma = require("../database/prisma");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

module.exports = {

    /* =========================================
       REGISTER
    ========================================= */

    async register(req, res) {

        try {

            const {
                nomeLoja,
                telefoneLoja,
                nome,
                email,
                senha
            } = req.body;

            const usuarioExiste =
                await prisma.usuario.findUnique({

                    where: {
                        email
                    }

                });

            if (usuarioExiste) {

                return res.status(400).json({
                    error: "E-mail já cadastrado"
                });

            }

            const senhaHash =
                await bcrypt.hash(senha, 10);

            const loja =
                await prisma.loja.create({

                    data: {

                        nome:
                            nomeLoja,

                        telefone:
                            telefoneLoja

                    }

                });

            const usuario =
                await prisma.usuario.create({

                    data: {

                        lojaId:
                            loja.lojaid,

                        nome,

                        email,

                        senha:
                            senhaHash,

                        tipo:
                            "ADMIN"

                    }

                });

            return res.json({

                message:
                    "Conta criada com sucesso",

                usuario

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    /* =========================================
       LOGIN
    ========================================= */

    async login(req, res) {

        try {

            const {
                email,
                senha
            } = req.body;

            const usuario =
                await prisma.usuario.findUnique({

                    where: {
                        email
                    }

                });

            if (!usuario) {

                return res.status(400).json({
                    error: "Usuário não encontrado"
                });

            }

            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );

            if (!senhaCorreta) {

                return res.status(400).json({
                    error: "Senha inválida"
                });

            }

            const token =
                jwt.sign({

                    usuarioid:
                        usuario.usuarioid,

                    lojaId:
                        usuario.lojaId,

                    tipo:
                        usuario.tipo

                },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "7d"
                    }
                );

            return res.json({

                token,

                usuario: {

                    usuarioid:
                        usuario.usuarioid,

                    lojaId:
                        usuario.lojaId,

                    nome:
                        usuario.nome,

                    email:
                        usuario.email,

                    tipo:
                        usuario.tipo,

                    comissaoPercentual:
                        usuario.comissaoPercentual

                }

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    /* =========================================
       CADASTRAR
    ========================================= */

    async cadastrar(req, res) {

        try {

            const {
                nome,
                email,
                senha,
                tipo,
                comissaoPercentual
            } = req.body;

            const usuarioExiste =
                await prisma.usuario.findUnique({

                    where: {
                        email
                    }

                });

            if (usuarioExiste) {

                return res.status(400).json({
                    error: "E-mail já cadastrado"
                });

            }

            const senhaHash =
                await bcrypt.hash(senha, 10);

            const usuario =
                await prisma.usuario.create({

                    data: {

                        lojaId:
                            req.usuario.lojaId,

                        nome,

                        email,

                        senha:
                            senhaHash,

                        tipo,

                        comissaoPercentual:
                            Number(
                                comissaoPercentual || 0
                            )

                    }

                });

            return res.json(usuario);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    /* =========================================
       LISTAR
    ========================================= */

    async listar(req, res) {

        try {

            const usuarios =
                await prisma.usuario.findMany({

                    where: {

                        lojaId:
                            req.usuario.lojaId

                    },

                    orderBy: {

                        usuarioid:
                            "desc"

                    }

                });

            return res.json(usuarios);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    /* =========================================
       DETALHAR
    ========================================= */

    async detalhar(req, res) {

        try {

            const { id } = req.params;

            const usuario =
                await prisma.usuario.findFirst({

                    where: {

                        usuarioid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

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

    /* =========================================
       ATUALIZAR
    ========================================= */

    async atualizar(req, res) {

        try {

            const { id } = req.params;

            const {
                nome,
                email,
                tipo,
                comissaoPercentual
            } = req.body;

            const usuarioExiste =
                await prisma.usuario.findFirst({

                    where: {

                        usuarioid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!usuarioExiste) {

                return res.status(404).json({
                    error: "Usuário não encontrado"
                });

            }

            const usuario =
                await prisma.usuario.update({

                    where: {

                        usuarioid:
                            Number(id)

                    },

                    data: {

                        nome,

                        email,

                        tipo,

                        comissaoPercentual:
                            Number(
                                comissaoPercentual || 0
                            )

                    }

                });

            return res.json(usuario);

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

    /* =========================================
       DELETAR
    ========================================= */

    async deletar(req, res) {

        try {

            const { id } = req.params;

            const usuarioExiste =
                await prisma.usuario.findFirst({

                    where: {

                        usuarioid:
                            Number(id),

                        lojaId:
                            req.usuario.lojaId

                    }

                });

            if (!usuarioExiste) {

                return res.status(404).json({
                    error: "Usuário não encontrado"
                });

            }

            await prisma.usuario.delete({

                where: {

                    usuarioid:
                        Number(id)

                }

            });

            return res.json({

                message:
                    "Usuário deletado com sucesso"

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};