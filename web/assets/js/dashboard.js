const token = localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./pages/login.html";

}

const usuario =
    JSON.parse(localStorage.getItem("usuario"));

document.getElementById("usuarioNome")
    .innerText = usuario.nome;

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");

        localStorage.removeItem("usuario");

        window.location.href =
            "./pages/login.html";

    });

async function carregarDashboard() {

    try {

        const response = await fetch(
            "http://localhost:3001/dashboard",
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        document.getElementById(
            "totalVeiculos"
        ).innerText =
            data.veiculos.total;

        document.getElementById(
            "veiculosVendidos"
        ).innerText =
            data.veiculos.vendidos;

        document.getElementById(
            "totalEntradas"
        ).innerText =
            `R$ ${data.financeiro.entradas}`;

        document.getElementById(
            "saldo"
        ).innerText =
            `R$ ${data.financeiro.saldo}`;

        criarGraficos(data);

    } catch (error) {

        console.log(error);

    }

}

function criarGraficos(data) {

    Chart.defaults.color = "#6B7280";

    Chart.defaults.font.family = "Inter";

    Chart.defaults.plugins.legend.labels.usePointStyle = true;

    /* FINANCEIRO */

    const financeiroCtx =
        document.getElementById(
            "financeiroChart"
        );

    new Chart(financeiroCtx, {

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

                            return "R$ " + value;

                        }

                    }

                }

            }

        }

    });

    /* VEÍCULOS */

    const veiculosCtx =
        document.getElementById(
            "veiculosChart"
        );

    new Chart(veiculosCtx, {

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

}

carregarDashboard();