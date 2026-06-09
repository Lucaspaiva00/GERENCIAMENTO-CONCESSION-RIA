import { Router } from "express";
import usuarios from "./controller/ctusuarios";
import veiculos from "./controller/ctveiculos";
import financeiro from "./controller/ctfinanceiro";
import dashboard from "./controller/ctdashboard";
import vendas from "./controller/ctvendas";
import historico from "./controller/cthistorico";
import contasReceber from "./controller/ctcontasreceber";
import comissao from "./controller/ctcomissao";
import clientes from "./controller/ctclientes";
import documentos from "./controller/ctdocumentos";
import auth from "./middlewares/auth";
import lojas from "./controller/ctlojas";

const routes = Router();

routes.get("/", (_req, res) => {
    return res.json({ status: "API ONLINE" });
});

routes.post("/auth/register", usuarios.register);
routes.post("/usuarios/login", usuarios.login);

routes.post("/usuarios", auth, usuarios.cadastrar);
routes.get("/usuarios", auth, usuarios.listar);
routes.get("/usuarios/:id", auth, usuarios.detalhar);
routes.put("/usuarios/:id", auth, usuarios.atualizar);
routes.delete("/usuarios/:id", auth, usuarios.deletar);

routes.post("/veiculos", auth, veiculos.cadastrar);
routes.get("/veiculos", auth, veiculos.listar);
routes.get("/veiculos/busca/:placa", auth, veiculos.buscarPorPlaca);
routes.get("/veiculos/cards", auth, veiculos.listar);
routes.get("/veiculos/:id", auth, veiculos.detalhar);
routes.put("/veiculos/:id", auth, veiculos.atualizar);
routes.delete("/veiculos/:id", auth, veiculos.deletar);
routes.delete("/veiculos/:id", auth, veiculos.deletarAdmin);

routes.post("/financeiro", auth, financeiro.cadastrar);
routes.get("/financeiro", auth, financeiro.listar);
routes.get("/financeiro/:id", auth, financeiro.detalhar);
routes.put("/financeiro/:id", auth, financeiro.atualizar);
routes.delete("/financeiro/:id", auth, financeiro.deletar);

routes.post("/vendas", auth, vendas.criar);
routes.get("/vendas", auth, vendas.listar);
routes.get("/vendas/:id", auth, vendas.detalhar);
routes.delete("/vendas/:id", auth, vendas.cancelar);

routes.delete("/admin/vendas/:id", auth, vendas.cancelarAdmin);
routes.get("/dashboard", auth, dashboard.indicadores);

routes.post("/historico", auth, historico.cadastrar);
routes.get("/historico/:veiculoId", auth, historico.listar);
routes.delete("/historico/:id", auth, historico.deletar);

routes.post("/contas-receber", auth, contasReceber.cadastrar);
routes.get("/contas-receber", auth, contasReceber.listar);
routes.put("/contas-receber/:id", auth, contasReceber.receber);

routes.post("/clientes", auth, clientes.cadastrar);
routes.get("/clientes", auth, clientes.listar);
routes.get("/clientes/:id", auth, clientes.detalhar);
routes.put("/clientes/:id", auth, clientes.atualizar);
routes.delete("/clientes/:id", auth, clientes.deletar);

routes.get("/documentos/contrato/:vendaId", auth, documentos.contratoCompraVenda);
routes.get("/documentos/recibo/:vendaId", auth, documentos.reciboPagamento);
routes.get("/documentos/termo-entrega/:vendaId", auth, documentos.termoEntrega);
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

routes.get("/comissoes", auth, comissao.listar);

routes.get("/lojas", lojas.listar);
routes.get("/lojas/:id", lojas.detalhar);
export default routes;
