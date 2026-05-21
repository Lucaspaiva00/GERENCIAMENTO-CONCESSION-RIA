const API = API_BASE_URL;

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "./login.html";
}

const tbody = document.getElementById("tbodyVendedores");
const filtroBusca = document.getElementById("filtroBusca");
const filtroPeriodo = document.getElementById("filtroPeriodo");
const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const btnFiltrar = document.getElementById("btnFiltrar");

let dadosOriginais = [];
let rankingChart = null;

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "./login.html";
});

async function carregarVendedores() {
    try {
        const response = await fetch(`${API}/comissoes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            alert(data.error || "Erro ao carregar comissões");
            return;
        }

        dadosOriginais = normalizarDados(data);

        aplicarFiltros();

    } catch (error) {
        console.log(error);
        alert("Erro ao carregar vendedores");
    }
}

function normalizarDados(lista) {
    return lista.map(item => {
        const vendas = item.vendas || item.vendasDetalhadas || [];

        return {
            vendedorId: item.vendedorId,
            nome: item.nome || item.vendedor?.nome || "-",
            quantidadeVendas: Number(item.quantidadeVendas || vendas.length || 0),
            totalVendido: Number(item.totalVendido || 0),
            totalComissao: Number(item.totalComissao || 0),
            vendas: vendas
        };
    });
}

function aplicarFiltros() {
    let lista = [...dadosOriginais];

    const termo = filtroBusca.value.trim().toLowerCase();

    if (termo) {
        lista = lista.filter(item =>
            item.nome.toLowerCase().includes(termo)
        );
    }

    const periodo = filtroPeriodo.value;

    if (periodo !== "todos") {
        const intervalo = obterIntervalo(periodo);

        lista = lista.map(vendedor => {
            const vendasFiltradas = vendedor.vendas.filter(venda => {
                const dataVenda = new Date(venda.createdAt);

                return dataVenda >= intervalo.inicio &&
                    dataVenda <= intervalo.fim;
            });

            const totalVendido = vendasFiltradas.reduce(
                (acc, venda) => acc + Number(venda.valorVenda || 0),
                0
            );

            const totalComissao = vendasFiltradas.reduce(
                (acc, venda) => acc + Number(venda.comissao?.valor || 0),
                0
            );

            return {
                ...vendedor,
                quantidadeVendas: vendasFiltradas.length,
                totalVendido,
                totalComissao,
                vendas: vendasFiltradas
            };
        });
    }

    lista = lista.filter(item =>
        item.quantidadeVendas > 0 ||
        item.totalVendido > 0 ||
        item.totalComissao > 0
    );

    renderTabela(lista);
    atualizarKPIs(lista);
    criarGrafico(lista);
}

function obterIntervalo(periodo) {
    const agora = new Date();

    let inicio = new Date(0);
    let fim = new Date();

    if (periodo === "hoje") {
        inicio = new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate(),
            0,
            0,
            0
        );

        fim = new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate(),
            23,
            59,
            59
        );
    }

    if (periodo === "7") {
        inicio = new Date();
        inicio.setDate(inicio.getDate() - 7);
        fim = new Date();
    }

    if (periodo === "30") {
        inicio = new Date();
        inicio.setDate(inicio.getDate() - 30);
        fim = new Date();
    }

    if (periodo === "mes") {
        inicio = new Date(
            agora.getFullYear(),
            agora.getMonth(),
            1,
            0,
            0,
            0
        );

        fim = new Date(
            agora.getFullYear(),
            agora.getMonth() + 1,
            0,
            23,
            59,
            59
        );
    }

    if (periodo === "personalizado") {
        inicio = dataInicio.value
            ? new Date(`${dataInicio.value}T00:00:00`)
            : new Date(0);

        fim = dataFim.value
            ? new Date(`${dataFim.value}T23:59:59`)
            : new Date();
    }

    return {
        inicio,
        fim
    };
}

function atualizarKPIs(lista) {
    document.getElementById("kpiVendedores").innerText =
        lista.length;

    const totalVendido = lista.reduce(
        (acc, item) => acc + Number(item.totalVendido || 0),
        0
    );

    const totalComissao = lista.reduce(
        (acc, item) => acc + Number(item.totalComissao || 0),
        0
    );

    const totalVendas = lista.reduce(
        (acc, item) => acc + Number(item.quantidadeVendas || 0),
        0
    );

    const ticketMedio = totalVendas > 0
        ? totalVendido / totalVendas
        : 0;

    document.getElementById("kpiVendido").innerText =
        formatarMoeda(totalVendido);

    document.getElementById("kpiComissao").innerText =
        formatarMoeda(totalComissao);

    document.getElementById("kpiTicketMedio").innerText =
        formatarMoeda(ticketMedio);

    if (lista.length) {
        const melhor = [...lista].sort(
            (a, b) => b.totalVendido - a.totalVendido
        )[0];

        document.getElementById("kpiMelhor").innerText =
            melhor.nome;
    } else {
        document.getElementById("kpiMelhor").innerText = "-";
    }
}

function renderTabela(lista) {
    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 30px;">
                    Nenhum resultado encontrado.
                </td>
            </tr>
        `;
        return;
    }

    const totalGeral = lista.reduce(
        (acc, item) => acc + Number(item.totalVendido || 0),
        0
    );

    lista.forEach(item => {
        const ticketMedio =
            item.quantidadeVendas > 0
                ? item.totalVendido / item.quantidadeVendas
                : 0;

        const participacao =
            totalGeral > 0
                ? (item.totalVendido / totalGeral) * 100
                : 0;

        tbody.innerHTML += `
            <tr>
                <td>
                    <strong>${item.nome}</strong>
                </td>

                <td>
                    ${item.quantidadeVendas}
                </td>

                <td>
                    ${formatarMoeda(item.totalVendido)}
                </td>

                <td>
                    ${formatarMoeda(item.totalComissao)}
                </td>

                <td>
                    ${formatarMoeda(ticketMedio)}
                </td>

                <td>
                    ${participacao.toFixed(1)}%
                </td>
            </tr>
        `;
    });
}

function criarGrafico(lista) {
    const ctx = document.getElementById("rankingChart");

    if (rankingChart) {
        rankingChart.destroy();
    }

    rankingChart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: lista.map(item => item.nome),

            datasets: [{
                label: "Total vendido",
                data: lista.map(item => item.totalVendido),
                backgroundColor: "#2563EB",
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
                },

                tooltip: {
                    callbacks: {
                        label: context => formatarMoeda(context.raw)
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: value => formatarMoeda(value)
                    }
                }
            }
        }
    });
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

btnFiltrar.addEventListener("click", aplicarFiltros);

filtroPeriodo.addEventListener("change", () => {
    const personalizado = filtroPeriodo.value === "personalizado";

    dataInicio.disabled = !personalizado;
    dataFim.disabled = !personalizado;

    if (!personalizado) {
        dataInicio.value = "";
        dataFim.value = "";
    }
});

dataInicio.disabled = true;
dataFim.disabled = true;

carregarVendedores();