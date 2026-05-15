const express = require("express");

const routes = express.Router();

const multer = require("multer");

const path = require("path");

const usuarios = require("./controller/ctusuarios");
const veiculos = require("./controller/ctveiculos");
const financeiro = require("./controller/ctfinanceiro");
const dashboard = require("./controller/ctdashboard");
const vendas = require("./controller/ctvendas");
const historico = require("./controller/cthistorico");
const contasReceber = require("./controller/ctcontasreceber");
const comissao = require("./controller/ctcomissao");
const clientes = require("./controller/ctclientes");

const auth = require("./middlewares/auth");

/* MULTER */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, path.resolve(
            __dirname,
            "..",
            "uploads"
        ));

    },

    filename: (req, file, cb) => {

        const nomeArquivo =
            Date.now() +
            "-" +
            file.originalname;

        cb(null, nomeArquivo);

    }

});

const upload = multer({
    storage
});

/* API */

routes.get("/", (req, res) => {

    return res.json({
        status: "API ONLINE"
    });

});

/* ROTAS PÚBLICAS */

routes.post(
    "/usuarios",
    usuarios.cadastrar
);

routes.post(
    "/login",
    usuarios.login
);

/* VEÍCULOS */

routes.post(
    "/veiculos",
    auth,
    upload.single("imagem"),
    veiculos.cadastrar
);

routes.get(
    "/veiculos",
    auth,
    veiculos.listar
);

routes.get(
    "/veiculos/:id",
    auth,
    veiculos.detalhar
);

routes.put(
    "/veiculos/:id",
    auth,
    upload.single("imagem"),
    veiculos.atualizar
);

routes.delete(
    "/veiculos/:id",
    auth,
    veiculos.deletar
);

/* FINANCEIRO */

routes.post(
    "/financeiro",
    auth,
    financeiro.cadastrar
);

routes.get(
    "/financeiro",
    auth,
    financeiro.listar
);

routes.get(
    "/financeiro/:id",
    auth,
    financeiro.detalhar
);

routes.put(
    "/financeiro/:id",
    auth,
    financeiro.atualizar
);

routes.delete(
    "/financeiro/:id",
    auth,
    financeiro.deletar
);

/* VENDAS */

routes.post(
    "/vendas",
    auth,
    vendas.criar
);

routes.get(
    "/vendas",
    auth,
    vendas.listar
);

/* DASHBOARD */

routes.get(
    "/dashboard",
    auth,
    dashboard.indicadores
);

/* HISTÓRICO */

routes.post(
    "/historico",
    auth,
    historico.cadastrar
);

routes.get(
    "/historico/:veiculoId",
    auth,
    historico.listar
);

routes.delete(
    "/historico/:id",
    auth,
    historico.deletar
);

/* CONTAS A RECEBER */

routes.post(
    "/contas-receber",
    auth,
    contasReceber.cadastrar
);

routes.get(
    "/contas-receber",
    auth,
    contasReceber.listar
);

routes.put(
    "/contas-receber/:id",
    auth,
    contasReceber.receber
);

/* COMISSÕES */

routes.get(
    "/comissoes",
    auth,
    comissao.listar
);

routes.post(
    "/clientes",
    auth,
    clientes.cadastrar
);

routes.get(
    "/clientes",
    auth,
    clientes.listar
);

module.exports = routes;