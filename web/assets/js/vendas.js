// assets/js/vendas.js

const API_URL = "http://localhost:3001";

const token =
    localStorage.getItem("token");

const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );

if (!token) {

    window.location.href =
        "./login.html";

}

const tbodyVendas =
    document.getElementById(
        "tbodyVendas"
    );

const modalVenda =
    document.getElementById(
        "modalVenda"
    );

const btnNovaVenda =
    document.getElementById(
        "btnNovaVenda"
    );

const fecharModal =
    document.getElementById(
        "fecharModal"
    );

const formVenda =
    document.getElementById(
        "formVenda"
    );

const selectVeiculos =
    document.getElementById(
        "selectVeiculos"
    );

const selectVendedores =
    document.getElementById(
        "selectVendedores"
    );

const busca =
    document.getElementById(
        "busca"
    );

const btnFiltrar =
    document.getElementById(
        "btnFiltrar"
    );

/* MODAL */

btnNovaVenda.onclick = () => {

    modalVenda.classList.add(
        "active"
    );

};

fecharModal.onclick = () => {

    modalVenda.classList.remove(
        "active"
    );

};

/* LOGOUT */

document.getElementById(
    "logoutBtn"
).onclick = () => {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "usuario"
    );

    window.location.href =
        "./login.html";

};

/* TEMPLATE LINHA */

function montarLinhaVenda(venda) {

    return `

        <tr>

            <td>
                ${venda.cliente?.nome || "-"}
            </td>

            <td>
                ${venda.veiculo?.titulo || "-"}
            </td>

            <td>

                ${venda.veiculo?.tipoEstoque === "CONSIGNADO"
            ? `
                    <span class="badge badge-warning">
                        Consignado
                    </span>
                `
            : `
                    <span class="badge badge-success">
                        Próprio
                    </span>
                `
        }

            </td>

            <td>
                ${formatarMoeda(venda.valorVenda)}
            </td>

            <td>
                ${formatarMoeda(venda.lucro)}
            </td>

            <td>
                ${venda.vendedor?.nome || "-"}
            </td>

            <td>
                ${formatarData(venda.createdAt)}
            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="btn-action btn-edit"
                        onclick="abrirDocumento('contrato', ${venda.vendaid})"
                        title="Contrato">

                        <i class="fa-solid fa-file-contract"></i>

                    </button>

                    <button
                        class="btn-action btn-edit"
                        onclick="abrirDocumento('recibo', ${venda.vendaid})"
                        title="Recibo">

                        <i class="fa-solid fa-receipt"></i>

                    </button>

                    <button
                        class="btn-action btn-edit"
                        onclick="abrirDocumento('termo-entrega', ${venda.vendaid})"
                        title="Termo de entrega">

                        <i class="fa-solid fa-file-signature"></i>

                    </button>

                    <button
                        class="btn-action btn-edit"
                        onclick="abrirDocumento('relatorio-interno', ${venda.vendaid})"
                        title="Relatório interno">

                        <i class="fa-solid fa-chart-pie"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}

/* LISTAR VENDAS */

async function listarVendas() {

    try {

        const response =
            await fetch(
                `${API_URL}/vendas`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const vendas =
            await response.json();

        tbodyVendas.innerHTML = "";

        let total = 0;
        let lucro = 0;

        vendas.forEach(venda => {

            total += Number(
                venda.valorVenda || 0
            );

            lucro += Number(
                venda.lucro || 0
            );

            tbodyVendas.innerHTML +=
                montarLinhaVenda(venda);

        });

        document.getElementById(
            "totalVendas"
        ).innerText =
            formatarMoeda(total);

        document.getElementById(
            "lucroTotal"
        ).innerText =
            formatarMoeda(lucro);

        document.getElementById(
            "quantidadeVendas"
        ).innerText =
            vendas.length;

    } catch (error) {

        console.log(error);

    }

}

/* LISTAR VEÍCULOS */

async function listarVeiculos() {

    try {

        const response =
            await fetch(
                `${API_URL}/veiculos`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const veiculos =
            await response.json();

        selectVeiculos.innerHTML = `

            <option value="">
                Selecione um veículo
            </option>

        `;

        veiculos
            .filter(
                veiculo =>
                    veiculo.status ===
                    "DISPONIVEL"
            )
            .forEach(veiculo => {

                selectVeiculos.innerHTML += `

                    <option value="${veiculo.veiculoid}">

                        ${veiculo.titulo}
                        -
                        ${veiculo.placa || "Sem placa"}

                    </option>

                `;

            });

    } catch (error) {

        console.log(error);

    }

}

/* LISTAR VENDEDORES */

async function listarVendedores() {

    try {

        const response =
            await fetch(
                `${API_URL}/usuarios`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const vendedores =
            await response.json();

        selectVendedores.innerHTML = `

            <option value="">
                Sem vendedor
            </option>

        `;

        if (!Array.isArray(vendedores)) {

            return;

        }

        vendedores.forEach(vendedor => {

            selectVendedores.innerHTML += `

                <option value="${vendedor.usuarioid}">

                    ${vendedor.nome}

                </option>

            `;

        });

    } catch (error) {

        console.log(error);

    }

}

/* NOVA VENDA */

formVenda.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            const formData =
                new FormData(formVenda);

            /* CRIAR CLIENTE */

            const clienteResponse =
                await fetch(
                    `${API_URL}/clientes`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            nome:
                                formData.get(
                                    "clienteNome"
                                ),

                            telefone:
                                formData.get(
                                    "clienteTelefone"
                                )

                        })

                    }
                );

            const cliente =
                await clienteResponse.json();

            if (!clienteResponse.ok || cliente.error) {

                alert(
                    cliente.error ||
                    "Erro ao cadastrar cliente"
                );

                return;

            }

            /* CRIAR VENDA */

            const vendaResponse =
                await fetch(
                    `${API_URL}/vendas`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            clienteId:
                                cliente.clienteid,

                            veiculoId:
                                Number(
                                    formData.get(
                                        "veiculoId"
                                    )
                                ),

                            vendedorId:
                                formData.get(
                                    "vendedorId"
                                )
                                    ? Number(
                                        formData.get(
                                            "vendedorId"
                                        )
                                    )
                                    : null,

                            valorVenda:
                                Number(
                                    formData.get(
                                        "valorVenda"
                                    )
                                ),

                            observacoes:
                                formData.get(
                                    "observacoes"
                                )

                        })

                    }
                );

            const venda =
                await vendaResponse.json();

            if (!vendaResponse.ok || venda.error) {

                alert(
                    venda.error ||
                    "Erro ao realizar venda"
                );

                return;

            }

            alert(
                "Venda realizada com sucesso"
            );

            formVenda.reset();

            modalVenda.classList.remove(
                "active"
            );

            listarVendas();

            listarVeiculos();

        } catch (error) {

            console.log(error);

            alert(
                "Erro ao realizar venda"
            );

        }

    }
);

/* FILTRO */

btnFiltrar.onclick =
    async () => {

        const termo =
            busca.value.toLowerCase();

        try {

            const response =
                await fetch(
                    `${API_URL}/vendas`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const vendas =
                await response.json();

            const filtradas =
                vendas.filter(venda => {

                    const cliente =
                        venda.cliente?.nome
                            ?.toLowerCase() || "";

                    const veiculo =
                        venda.veiculo?.titulo
                            ?.toLowerCase() || "";

                    return (
                        cliente.includes(
                            termo
                        )
                        ||
                        veiculo.includes(
                            termo
                        )
                    );

                });

            tbodyVendas.innerHTML = "";

            filtradas.forEach(venda => {

                tbodyVendas.innerHTML +=
                    montarLinhaVenda(venda);

            });

        } catch (error) {

            console.log(error);

        }

    };

/* ABRIR DOCUMENTO */

async function abrirDocumento(tipo, vendaId) {

    try {

        const response =
            await fetch(
                `${API_URL}/documentos/${tipo}/${vendaId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            alert(
                "Erro ao gerar documento"
            );

            return;

        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        window.open(
            url,
            "_blank"
        );

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao abrir documento"
        );

    }

}

/* HELPERS */

function formatarData(data) {

    return new Date(data)
        .toLocaleDateString(
            "pt-BR"
        );

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

/* INIT */

listarVendas();

listarVeiculos();

listarVendedores();