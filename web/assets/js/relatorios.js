// assets/js/financeiro.js

const API =
    API_BASE_URL;

const token =
    localStorage.getItem("token");

if (!token) {

    window.location.href =
        "../pages/login.html";

}

let movimentacoes = [];

let financeiroChart;
let tipoChart;

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");

        localStorage.removeItem("usuario");

        window.location.href =
            "../pages/login.html";

    });

async function carregarFinanceiro() {

    try {

        const response =
            await fetch(`${API}/financeiro`, {

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }

            });

        const data =
            await response.json();

        movimentacoes = data;

        renderTabela(data);

        renderKPIs(data);

        renderGraficos(data);

    } catch (error) {

        console.log(error);

    }

}

function renderTabela(lista) {

    const tbody =
        document.getElementById(
            "financeiroTable"
        );

    tbody.innerHTML = "";

    lista.forEach(item => {

        tbody.innerHTML += `

            <tr>

                <td>
                    ${item.descricao}
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

                <td>
                    R$ ${Number(item.valor)
                .toLocaleString("pt-BR")}
                </td>

                <td>

                    <span class="
                        badge
                        ${item.status === "PAGO"
                ? "badge-success"
                : "badge-warning"}
                    ">

                        ${item.status}

                    </span>

                </td>

                <td>

                    ${item.vencimento
                ? new Date(item.vencimento)
                    .toLocaleDateString("pt-BR")
                : "-"}

                </td>

                <td>

                    ${new Date(item.createdAt)
                .toLocaleDateString("pt-BR")}

                </td>

            </tr>

        `;

    });

}

function renderKPIs(lista) {

    let entradas = 0;
    let saidas = 0;

    lista.forEach(item => {

        if (item.tipo === "ENTRADA") {

            entradas += Number(item.valor);

        } else {

            saidas += Number(item.valor);

        }

    });

    const saldo =
        entradas - saidas;

    document.getElementById(
        "totalEntradas"
    ).innerText =
        `R$ ${entradas.toLocaleString("pt-BR")}`;

    document.getElementById(
        "totalSaidas"
    ).innerText =
        `R$ ${saidas.toLocaleString("pt-BR")}`;

    document.getElementById(
        "saldoTotal"
    ).innerText =
        `R$ ${saldo.toLocaleString("pt-BR")}`;

}

function renderGraficos(lista) {

    let entradas = 0;
    let saidas = 0;

    lista.forEach(item => {

        if (item.tipo === "ENTRADA") {

            entradas += Number(item.valor);

        } else {

            saidas += Number(item.valor);

        }

    });

    if (financeiroChart) {

        financeiroChart.destroy();

    }

    if (tipoChart) {

        tipoChart.destroy();

    }

    financeiroChart = new Chart(

        document.getElementById(
            "financeiroChart"
        ),

        {

            type: "bar",

            data: {

                labels: [
                    "Entradas",
                    "Saídas"
                ],

                datasets: [{

                    label: "Financeiro",

                    data: [
                        entradas,
                        saidas
                    ],

                    borderRadius: 12,

                    backgroundColor: [
                        "#22C55E",
                        "#EF4444"
                    ]

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        }

    );

    tipoChart = new Chart(

        document.getElementById(
            "tipoChart"
        ),

        {

            type: "doughnut",

            data: {

                labels: [
                    "Entradas",
                    "Saídas"
                ],

                datasets: [{

                    data: [
                        entradas,
                        saidas
                    ],

                    backgroundColor: [
                        "#2563EB",
                        "#EF4444"
                    ]

                }]

            },

            options: {

                responsive: true

            }

        }

    );

}

document.getElementById("formFinanceiro")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        try {

            const body = {

                descricao:
                    document.getElementById(
                        "descricao"
                    ).value,

                tipo:
                    document.getElementById(
                        "tipo"
                    ).value,

                valor:
                    Number(
                        document.getElementById(
                            "valor"
                        ).value
                    ),

                status:
                    document.getElementById(
                        "status"
                    ).value,

                vencimento:
                    document.getElementById(
                        "vencimento"
                    ).value

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

                    body:
                        JSON.stringify(body)

                }
            );

            fecharModal();

            carregarFinanceiro();

            document.getElementById(
                "formFinanceiro"
            ).reset();

        } catch (error) {

            console.log(error);

        }

    });

function abrirModal() {

    document.getElementById(
        "modalFinanceiro"
    ).classList.add("active");

}

function fecharModal() {

    document.getElementById(
        "modalFinanceiro"
    ).classList.remove("active");

}

document.getElementById("buscaInput")
    .addEventListener("input", filtrar);

document.getElementById("tipoFiltro")
    .addEventListener("change", filtrar);

function filtrar() {

    const busca =
        document.getElementById(
            "buscaInput"
        ).value.toLowerCase();

    const tipo =
        document.getElementById(
            "tipoFiltro"
        ).value;

    const filtrado =
        movimentacoes.filter(item => {

            const matchBusca =
                item.descricao
                    .toLowerCase()
                    .includes(busca);

            const matchTipo =
                !tipo ||
                item.tipo === tipo;

            return (
                matchBusca &&
                matchTipo
            );

        });

    renderTabela(filtrado);

}

carregarFinanceiro();