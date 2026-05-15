const prisma = require("../database/prisma");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

module.exports = {

    async cadastrar(req, res) {

        try {

            const {
                lojaId,
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

            const usuario =
                await prisma.usuario.create({

                    data: {

                        lojaId: Number(lojaId),

                        nome,

                        email,

                        senha: senhaHash

                    }

                });

            return res.json(usuario);

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
                        usuario.lojaId

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
                        usuario.email

                },

                token

            });

        } catch (error) {

            console.log(error);

            return res.status(500).json(error);

        }

    }

};