// api/routes.js

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
const documentos = require("./controller/ctdocumentos");

const auth = require("./middlewares/auth");

/* =========================================
   MULTER
========================================= */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            path.resolve(
                __dirname,
                "..",
                "uploads"
            )
        );

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

/* =========================================
   API
========================================= */

routes.get("/", (req, res) => {

    return res.json({
        status: "API ONLINE"
    });

});

/* =========================================
   ROTAS PÚBLICAS
========================================= */

/* REGISTER */

routes.post(
    "/auth/register",
    usuarios.register
);

/* LOGIN */

routes.post(
    "/usuarios/login",
    usuarios.login
);

/* =========================================
   USUÁRIOS
========================================= */

routes.post(
    "/usuarios",
    auth,
    usuarios.cadastrar
);

routes.get(
    "/usuarios",
    auth,
    usuarios.listar
);

routes.get(
    "/usuarios/:id",
    auth,
    usuarios.detalhar
);

routes.put(
    "/usuarios/:id",
    auth,
    usuarios.atualizar
);

routes.delete(
    "/usuarios/:id",
    auth,
    usuarios.deletar
);

/* =========================================
   VEÍCULOS
========================================= */

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

routes.get(
    "/veiculos/busca/:placa",
    auth,
    veiculos.buscarPorPlaca
);

routes.get(
    "/veiculos/cards",
    auth,
    veiculos.listar
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

/* =========================================
   FINANCEIRO
========================================= */

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

/* =========================================
   VENDAS
========================================= */

/* =========================================
   VENDAS
========================================= */

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

/* NOVO - DETALHAR VENDA */

routes.get(
    "/vendas/:id",
    auth,
    vendas.detalhar
);

/* NOVO - CANCELAR VENDA */

routes.delete(
    "/vendas/:id",
    auth,
    vendas.cancelar
);

/* =========================================
   DASHBOARD
========================================= */

routes.get(
    "/dashboard",
    auth,
    dashboard.indicadores
);

/* =========================================
   HISTÓRICO
========================================= */

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

/* =========================================
   CONTAS A RECEBER
========================================= */

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

/* =========================================
   CLIENTES
========================================= */

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

routes.get(
    "/clientes/:id",
    auth,
    clientes.detalhar
);

routes.put(
    "/clientes/:id",
    auth,
    clientes.atualizar
);

routes.delete(
    "/clientes/:id",
    auth,
    clientes.deletar
);
/* =========================================
   DOCUMENTOS
========================================= */

routes.get(
    "/documentos/contrato/:vendaId",
    auth,
    documentos.contratoCompraVenda
);

routes.get(
    "/documentos/recibo/:vendaId",
    auth,
    documentos.reciboPagamento
);

routes.get(
    "/documentos/termo-entrega/:vendaId",
    auth,
    documentos.termoEntrega
);

routes.get(
    "/documentos/termo-responsabilidade/:vendaId",
    auth,
    documentos.termoResponsabilidade
);

routes.get(
    "/documentos/relatorio-interno/:vendaId",
    auth,
    documentos.relatorioInternoVenda
);

routes.get(
    "/comissoes",
    auth,
    comissao.listar
);


module.exports = routes;