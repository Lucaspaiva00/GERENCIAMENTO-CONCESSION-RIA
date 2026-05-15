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

            tbodyVendas.innerHTML += `

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
                        R$ ${Number(
                    venda.valorVenda
                ).toLocaleString(
                    "pt-BR"
                )}
                    </td>

                    <td>
                        R$ ${Number(
                    venda.lucro
                ).toLocaleString(
                    "pt-BR"
                )}
                    </td>

                    <td>
                        ${venda.vendedor?.nome || "-"}
                    </td>

                    <td>
                        ${formatarData(
                    venda.createdAt
                )}
                    </td>

                </tr>

            `;

        });

        document.getElementById(
            "totalVendas"
        ).innerText =
            `R$ ${total.toLocaleString(
                "pt-BR"
            )}`;

        document.getElementById(
            "lucroTotal"
        ).innerText =
            `R$ ${lucro.toLocaleString(
                "pt-BR"
            )}`;

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

                            lojaId: 1,

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

                            lojaId: 1,

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

            if (venda.error) {

                alert(venda.error);

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

        }

    }
);

/* FILTRO */

btnFiltrar.onclick =
    async () => {

        const termo =
            busca.value.toLowerCase();

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

            tbodyVendas.innerHTML += `

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
                        R$ ${Number(
                    venda.valorVenda
                ).toLocaleString(
                    "pt-BR"
                )}
                    </td>

                    <td>
                        R$ ${Number(
                    venda.lucro
                ).toLocaleString(
                    "pt-BR"
                )}
                    </td>

                    <td>
                        ${venda.vendedor?.nome || "-"}
                    </td>

                    <td>
                        ${formatarData(
                    venda.createdAt
                )}
                    </td>

                </tr>

            `;

        });

    };

/* FORMATAR DATA */

function formatarData(data) {

    return new Date(data)
        .toLocaleDateString(
            "pt-BR"
        );

}

/* INIT */

listarVendas();

listarVeiculos();

listarVendedores();