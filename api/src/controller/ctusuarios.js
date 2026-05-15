const prisma = require("../database/prisma");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

module.exports = {

    async cadastrar(req, res) {

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

            /* CRIA LOJA */

            const loja =
                await prisma.loja.create({

                    data: {

                        nome: nomeLoja,

                        telefone: telefoneLoja

                    }

                });

            /* HASH SENHA */

            const senhaHash =
                await bcrypt.hash(senha, 10);

            /* CRIA USUÁRIO */

            const usuario =
                await prisma.usuario.create({

                    data: {

                        lojaId: loja.lojaid,

                        nome,

                        email,

                        senha: senhaHash,

                        tipo: "ADMIN"

                    }

                });

            return res.json({

                message: "Conta criada com sucesso",

                usuario: {

                    usuarioid:
                        usuario.usuarioid,

                    nome:
                        usuario.nome,

                    email:
                        usuario.email,

                    lojaId:
                        usuario.lojaId

                }

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    },

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

            const senhaValida =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );

            if (!senhaValida) {

                return res.status(400).json({
                    error: "Senha inválida"
                });

            }

            const token = jwt.sign(

                {

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
                        usuario.tipo

                },

                token

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};