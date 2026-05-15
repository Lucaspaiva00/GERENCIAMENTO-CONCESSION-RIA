const express = require("express");

const routes = express.Router();

const usuarios = require("./controller/ctusuarios");
const veiculos = require("./controller/ctveiculos");
const financeiro = require("./controller/ctfinanceiro");
const dashboard = require("./controller/ctdashboard");
const vendas = require("./controller/ctvendas");
const historico = require("./controller/cthistorico");
const contasReceber = require("./controller/ctcontasreceber");
const comissao = require("./controller/ctcomissao");
const auth = require("./middlewares/auth");

routes.get("/", (req, res) => {
    return res.json({
        status: "API ONLINE"
    });
});


// ROTAS PUBLICAS

routes.post("/usuarios", usuarios.cadastrar);
routes.post("/login", usuarios.login);


routes.post("/veiculos", auth, veiculos.cadastrar);
routes.get("/veiculos", auth, veiculos.listar);
routes.get("/veiculos/:id", auth, veiculos.detalhar);
routes.put("/veiculos/:id", auth, veiculos.atualizar);
routes.delete("/veiculos/:id", auth, veiculos.deletar);


routes.post("/financeiro", auth, financeiro.cadastrar);
routes.get("/financeiro", auth, financeiro.listar);
routes.get("/financeiro/:id", auth, financeiro.detalhar);
routes.put("/financeiro/:id", auth, financeiro.atualizar);
routes.delete("/financeiro/:id", auth, financeiro.deletar);

routes.post("/vendas", auth, vendas.vender);
routes.get("/vendas", auth, vendas.listar);

routes.get("/dashboard", auth, dashboard.indicadores);

routes.post("/historico", auth, historico.cadastrar);
routes.get("/historico/:veiculoId", auth, historico.listar);
routes.delete("/historico/:id", auth, historico.deletar);

routes.post("/contas-receber", auth, contasReceber.cadastrar);
routes.get("/contas-receber", auth, contasReceber.listar);
routes.put("/contas-receber/:id", auth, contasReceber.receber);

routes.get("/comissoes", auth, comissao.listar);

module.exports = routes;