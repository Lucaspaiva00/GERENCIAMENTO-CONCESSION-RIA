const API =
    "http://localhost:3001";

const token =
    localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./login.html";

}

const tbody =
    document.getElementById(
        "tbodyVendedores"
    );

/* LOGOUT */

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.clear();

        window.location.href =
            "./login.html";

    });

/* CARREGAR */

async function carregarVendedores() {

    try {

        const response =
            await fetch(
                `${API}/comissoes`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        renderTabela(data);

        atualizarKPIs(data);

        criarGrafico(data);

    } catch (error) {

        console.log(error);

    }

}

/* KPIS */

function atualizarKPIs(lista) {

    document.getElementById(
        "kpiVendedores"
    ).innerText =
        lista.length;

    const totalVendido =
        lista.reduce((acc, item) =>
            acc + Number(item.totalVendido || 0), 0);

    const totalComissao =
        lista.reduce((acc, item) =>
            acc + Number(item.totalComissao || 0), 0);

    document.getElementById(
        "kpiVendido"
    ).innerText =
        totalVendido.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    document.getElementById(
        "kpiComissao"
    ).innerText =
        totalComissao.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    if (lista.length) {

        const melhor =
            [...lista].sort(
                (a, b) =>
                    b.totalVendido -
                    a.totalVendido
            )[0];

        document.getElementById(
            "kpiMelhor"
        ).innerText =
            melhor.nome;

    }

}

/* TABELA */

function renderTabela(lista) {

    tbody.innerHTML = "";

    lista.forEach(item => {

        const ticketMedio =
            item.quantidadeVendas > 0
                ? item.totalVendido /
                item.quantidadeVendas
                : 0;

        tbody.innerHTML += `
        
        <tr>

            <td>

                <strong>
                    ${item.nome}
                </strong>

            </td>

            <td>

                ${item.quantidadeVendas}

            </td>

            <td>

                ${Number(item.totalVendido)
                .toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                )}

            </td>

            <td>

                ${Number(item.totalComissao)
                .toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                )}

            </td>

            <td>

                ${Number(ticketMedio)
                .toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                )}

            </td>

        </tr>

        `;

    });

}

/* GRÁFICO */

function criarGrafico(lista) {

    const ctx =
        document.getElementById(
            "rankingChart"
        );

    new Chart(ctx, {

        type: "bar",

        data: {

            labels:
                lista.map(
                    item => item.nome
                ),

            datasets: [{

                label:
                    "Total vendido",

                data:
                    lista.map(
                        item =>
                            item.totalVendido
                    ),

                backgroundColor:
                    "#2563EB",

                borderRadius: 12,

                borderSkipped: false,

                maxBarThickness: 60

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        callback: value =>
                            "R$ " + value

                    }

                }

            }

        }

    });

}

carregarVendedores();