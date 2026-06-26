// assets/js/financeiro.js

const token = localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./login.html";

}

const API =
    API_BASE_URL;

const tabela =
    document.getElementById("financeiroTabela");

const modal =
    document.getElementById("modalFinanceiro");

const form =
    document.getElementById("formFinanceiro");

const btnNova =
    document.getElementById("btnNovaMovimentacao");

const btnFechar =
    document.getElementById("fecharModal");

let movimentacoes = [];

const veiculoFiltro =
    document.getElementById("veiculoFiltro");

/* LOGOUT */

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.clear();

        window.location.href =
            "./login.html";

    });

/* MODAL */

btnNova.onclick = () => {

    modal.classList.add("active");

};

btnFechar.onclick = () => {

    modal.classList.remove("active");

};

window.onclick = (e) => {

    if (e.target === modal) {

        modal.classList.remove("active");

    }

};

/* CARREGAR */
async function carregarFinanceiro() {

    try {

        const params =
            new URLSearchParams();

        if (veiculoFiltro && veiculoFiltro.value) {
            params.append(
                "veiculoId",
                veiculoFiltro.value
            );
        }

        const url =
            params.toString()
                ? `${API}/financeiro?${params.toString()}`
                : `${API}/financeiro`;

        const response = await fetch(
            url,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        movimentacoes =
            await response.json();

        renderizarTabela(
            movimentacoes
        );

        atualizarKPIs();

    } catch (error) {

        console.log(error);

    }

}

async function carregarVeiculosFiltro() {

    try {

        const response =
            await fetch(
                `${API}/veiculos`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const veiculos =
            await response.json();

        veiculoFiltro.innerHTML = `
            <option value="">
                Todos os veículos
            </option>
        `;

        veiculos.forEach(veiculo => {

            veiculoFiltro.innerHTML += `
                <option value="${veiculo.veiculoid}">
                    ${veiculo.titulo} - ${veiculo.placa || "Sem placa"}
                </option>
            `;

        });

    } catch (error) {

        console.log(error);

    }

}
/* KPIS */

function atualizarKPIs() {

    const entradas =
        movimentacoes
            .filter(item =>
                item.tipo === "ENTRADA"
            )
            .reduce((acc, item) =>
                acc + Number(item.valor), 0);

    const saidas =
        movimentacoes
            .filter(item =>
                item.tipo === "SAIDA"
            )
            .reduce((acc, item) =>
                acc + Number(item.valor), 0);

    const saldo =
        entradas - saidas;

    document.getElementById(
        "totalEntradas"
    ).innerText =
        formatarMoeda(entradas);

    document.getElementById(
        "totalSaidas"
    ).innerText =
        formatarMoeda(saidas);

    document.getElementById(
        "saldoAtual"
    ).innerText =
        formatarMoeda(saldo);

}

/* TABELA */

function renderizarTabela(lista) {

    tabela.innerHTML = "";

    if (!lista.length) {

        tabela.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    Nenhuma movimentação encontrada
                </td>
            </tr>
        `;

        return;

    }

    lista.forEach(item => {

        tabela.innerHTML += `

            <tr>

                <td>
                    <strong>
                        ${item.descricao}
                    </strong>
                </td>

                <td>

                    <span class="
                        badge
                        ${item.tipo === "ENTRADA"
                ? "badge-success"
                : "badge-danger"}
                    ">

                        ${item.tipo}

                    </span>

                </td>

                <td class="
                    ${item.tipo === "ENTRADA"
                ? "text-success"
                : "text-danger"}
                ">

                    ${item.tipo === "ENTRADA"
                ? "+"
                : "-"}

                    ${formatarMoeda(item.valor)}

                </td>

                <td>

                    <span class="
                        badge
                        ${retornarBadgeStatus(item.status)}
                    ">

                        ${item.status}

                    </span>

                </td>

                <td>

                    ${formatarData(item.vencimento)}

                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="btn-action btn-delete"
                            onclick="deletarMovimentacao(${item.financeiroid})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

}

/* CADASTRAR */

form.addEventListener("submit",
    async (e) => {

        e.preventDefault();

        try {

            const body = {

                lojaId: 1,

                descricao:
                    document.getElementById("descricao").value,

                tipo:
                    document.getElementById("tipo").value,

                valor:
                    Number(
                        document.getElementById("valor").value
                    ),

                status:
                    document.getElementById("status").value,

                vencimento:
                    document.getElementById("vencimento").value

            };

            await fetch(
                `${API}/financeiro`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify(body)

                }
            );

            form.reset();

            modal.classList.remove("active");

            carregarFinanceiro();

        } catch (error) {

            console.log(error);

        }

    });

/* DELETE */

async function deletarMovimentacao(id) {

    const confirmar =
        confirm(
            "Deseja deletar esta movimentação?"
        );

    if (!confirmar) return;

    try {

        await fetch(
            `${API}/financeiro/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        carregarFinanceiro();

    } catch (error) {

        console.log(error);

    }

}

/* FILTROS */

document.getElementById("filtroBusca")
    .addEventListener("input", aplicarFiltros);

document.getElementById("filtroTipo")
    .addEventListener("change", aplicarFiltros);

document.getElementById("filtroStatus")
    .addEventListener("change", aplicarFiltros);

veiculoFiltro.addEventListener(
    "change",
    () => {
        carregarFinanceiro();
    }
);

function aplicarFiltros() {

    const busca =
        document.getElementById("filtroBusca")
            .value
            .toLowerCase();

    const tipo =
        document.getElementById("filtroTipo")
            .value;

    const status =
        document.getElementById("filtroStatus")
            .value;

    const periodo =
        document.getElementById("filtroPeriodo")
            .value;

    const inicio =
        document.getElementById("dataInicio")
            .value;

    const fim =
        document.getElementById("dataFim")
            .value;

    const hoje =
        new Date();

    const primeiroDiaMes =
        new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
        );

    const ultimoDiaMes =
        new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            0,
            23,
            59,
            59
        );

    const trintaDias =
        new Date();

    trintaDias.setDate(
        trintaDias.getDate() - 30
    );

    const filtrado =
        movimentacoes.filter(item => {

            const descricao =
                item.descricao
                    ?.toLowerCase() || "";

            const placa =
                item.veiculo?.placa
                    ?.toLowerCase() || "";

            const titulo =
                item.veiculo?.titulo
                    ?.toLowerCase() || "";

            const marca =
                item.veiculo?.marca
                    ?.toLowerCase() || "";

            const modelo =
                item.veiculo?.modelo
                    ?.toLowerCase() || "";

            const matchBusca =
                descricao.includes(busca) ||
                placa.includes(busca) ||
                titulo.includes(busca) ||
                marca.includes(busca) ||
                modelo.includes(busca);

            const matchTipo =
                !tipo ||
                item.tipo === tipo;

            const matchStatus =
                !status ||
                item.status === status;

            let matchPeriodo = true;

            const dataMov =
                item.createdAt
                    ? new Date(item.createdAt)
                    : null;

            if (dataMov) {

                if (periodo === "mesAtual") {

                    matchPeriodo =
                        dataMov >= primeiroDiaMes &&
                        dataMov <= ultimoDiaMes;

                }

                else if (periodo === "ultimos30") {

                    matchPeriodo =
                        dataMov >= trintaDias;

                }

                else if (
                    periodo === "personalizado"
                ) {

                    const dataInicio =
                        inicio
                            ? new Date(
                                `${inicio}T00:00:00`
                            )
                            : null;

                    const dataFim =
                        fim
                            ? new Date(
                                `${fim}T23:59:59`
                            )
                            : null;

                    if (
                        dataInicio &&
                        dataMov < dataInicio
                    ) {
                        matchPeriodo = false;
                    }

                    if (
                        dataFim &&
                        dataMov > dataFim
                    ) {
                        matchPeriodo = false;
                    }

                }

            }

            return (
                matchBusca &&
                matchTipo &&
                matchStatus &&
                matchPeriodo
            );

        });

    renderizarTabela(filtrado);

    atualizarKPIsFiltrados(filtrado);

}

function atualizarKPIsFiltrados(lista) {

    const entradas =
        lista
            .filter(item =>
                item.tipo === "ENTRADA"
            )
            .reduce(
                (acc, item) =>
                    acc + Number(item.valor),
                0
            );

    const saidas =
        lista
            .filter(item =>
                item.tipo === "SAIDA"
            )
            .reduce(
                (acc, item) =>
                    acc + Number(item.valor),
                0
            );

    const saldo =
        entradas - saidas;

    document.getElementById(
        "totalEntradas"
    ).innerText =
        formatarMoeda(entradas);

    document.getElementById(
        "totalSaidas"
    ).innerText =
        formatarMoeda(saidas);

    document.getElementById(
        "saldoAtual"
    ).innerText =
        formatarMoeda(saldo);

}

/* HELPERS */

function formatarMoeda(valor) {

    return Number(valor)
        .toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

}

function formatarData(data) {

    if (!data) return "-";

    return new Date(data)
        .toLocaleDateString("pt-BR");

}

function retornarBadgeStatus(status) {

    if (status === "PAGO")
        return "badge-success";

    if (status === "ATRASADO")
        return "badge-danger";

    return "badge-warning";

}

/* INIT */
document
    .getElementById("filtroPeriodo")
    .addEventListener(
        "change",
        () => {

            const personalizado =
                document.getElementById(
                    "filtroPeriodo"
                ).value === "personalizado";

            document.getElementById(
                "dataInicio"
            ).disabled =
                !personalizado;

            document.getElementById(
                "dataFim"
            ).disabled =
                !personalizado;

            aplicarFiltros();

        }
    );

document
    .getElementById("dataInicio")
    .addEventListener(
        "change",
        aplicarFiltros
    );

document
    .getElementById("dataFim")
    .addEventListener(
        "change",
        aplicarFiltros
    );

carregarVeiculosFiltro();
carregarFinanceiro();
