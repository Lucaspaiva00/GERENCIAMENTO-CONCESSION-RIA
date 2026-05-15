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

    new Chart(
        document.getElementById(
            "financeiroChart"
        ),
        {
            type: "bar",

            data: {

                labels: [
                    "Entradas",
                    "Saídas",
                    "Saldo"
                ],

                datasets: [{
                    data: [
                        data.financeiro.entradas,
                        data.financeiro.saidas,
                        data.financeiro.saldo
                    ]
                }]

            }

        }
    );

    new Chart(
        document.getElementById(
            "veiculosChart"
        ),
        {
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
                    ]
                }]

            }

        }
    );

}

carregarDashboard();