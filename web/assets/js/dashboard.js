const token = localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./pages/login.html";

}

const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );

if (usuario && usuario.nome) {

    document.getElementById("usuarioNome")
        .innerText = usuario.nome;

}

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");

        localStorage.removeItem("usuario");

        window.location.href =
            "./pages/login.html";

    });

let financeiroChart = null;
let veiculosChart = null;
let estoqueChart = null;

async function carregarDashboard() {

    try {

        const response =
            await fetch(
                "http://localhost:3001/dashboard",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || data.error) {

            alert(
                data.error ||
                "Erro ao carregar dashboard"
            );

            return;

        }

        document.getElementById(
            "totalVeiculos"
        ).innerText =
            data.veiculos.total;

        document.getElementById(
            "veiculosVendidos"
        ).innerText =
            data.veiculos.vendidos;

        document.getElementById(
            "veiculosConsignados"
        ).innerText =
            data.veiculos.consignados;

        document.getElementById(
            "valorEstoque"
        ).innerText =
            formatarMoeda(
                data.estoque.valorInvestido
            );

        document.getElementById(
            "valorVendaEstoque"
        ).innerText =
            formatarMoeda(
                data.estoque.valorVenda
            );

        document.getElementById(
            "lucroEstoque"
        ).innerText =
            formatarMoeda(
                data.estoque.lucroPrevisto
            );

        document.getElementById(
            "totalEntradas"
        ).innerText =
            formatarMoeda(
                data.financeiro.entradas
            );

        document.getElementById(
            "saldo"
        ).innerText =
            formatarMoeda(
                data.financeiro.saldo
            );

        criarGraficos(data);

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao carregar dashboard"
        );

    }

}

function criarGraficos(data) {

    Chart.defaults.color = "#6B7280";

    Chart.defaults.font.family = "Inter";

    Chart.defaults.plugins.legend.labels.usePointStyle = true;

    if (financeiroChart) {
        financeiroChart.destroy();
    }

    if (veiculosChart) {
        veiculosChart.destroy();
    }

    if (estoqueChart) {
        estoqueChart.destroy();
    }

    const financeiroCtx =
        document.getElementById(
            "financeiroChart"
        );

    financeiroChart = new Chart(financeiroCtx, {

        type: "bar",

        data: {

            labels: [
                "Entradas",
                "Saídas",
                "Saldo"
            ],

            datasets: [{

                label: "Financeiro",

                data: [
                    data.financeiro.entradas,
                    data.financeiro.saidas,
                    data.financeiro.saldo
                ],

                backgroundColor: [
                    "#22C55E",
                    "#EF4444",
                    "#2563EB"
                ],

                borderRadius: 12,

                borderSkipped: false,

                maxBarThickness: 80

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return formatarMoeda(
                                context.raw
                            );
                        }
                    }
                }

            },

            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    ticks: {
                        font: {
                            size: 14,
                            weight: "600"
                        }
                    }

                },

                y: {

                    beginAtZero: true,

                    grid: {
                        color: "#F3F4F6"
                    },

                    ticks: {

                        callback: function (value) {
                            return formatarMoeda(value);
                        }

                    }

                }

            }

        }

    });

    const veiculosCtx =
        document.getElementById(
            "veiculosChart"
        );

    veiculosChart = new Chart(veiculosCtx, {

        type: "doughnut",

        data: {

            labels: [
                "Disponíveis",
                "Vendidos",
                "Manutenção"
            ],

            datasets: [{

                data: [
                    data.veiculos.disponiveis,
                    data.veiculos.vendidos,
                    data.veiculos.manutencao
                ],

                backgroundColor: [
                    "#2563EB",
                    "#22C55E",
                    "#F59E0B"
                ],

                borderWidth: 0,

                hoverOffset: 12

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "72%",

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        padding: 20,

                        font: {
                            size: 13,
                            weight: "600"
                        }

                    }

                }

            }

        }

    });

    const estoqueCtx =
        document.getElementById(
            "estoqueChart"
        );

    estoqueChart = new Chart(estoqueCtx, {

        type: "bar",

        data: {

            labels: [
                "Investido",
                "Venda prevista",
                "Lucro previsto"
            ],

            datasets: [{

                label: "Estoque",

                data: [
                    data.estoque.valorInvestido,
                    data.estoque.valorVenda,
                    data.estoque.lucroPrevisto
                ],

                backgroundColor: [
                    "#F59E0B",
                    "#2563EB",
                    "#22C55E"
                ],

                borderRadius: 12,

                borderSkipped: false,

                maxBarThickness: 90

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return formatarMoeda(
                                context.raw
                            );
                        }
                    }
                }

            },

            scales: {

                x: {
                    grid: {
                        display: false
                    }
                },

                y: {

                    beginAtZero: true,

                    grid: {
                        color: "#F3F4F6"
                    },

                    ticks: {
                        callback: function (value) {
                            return formatarMoeda(value);
                        }
                    }

                }

            }

        }

    });

}

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}

carregarDashboard();