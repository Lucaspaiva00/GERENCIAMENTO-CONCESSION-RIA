const API_URL = "http://localhost:3001";

const token =
    localStorage.getItem("token");

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

/* LOGOUT */

document.getElementById(
    "logoutBtn"
).onclick = () => {

    localStorage.clear();

    window.location.href =
        "./login.html";

};

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

/* TEMPLATE */

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
                ${venda.formaPagamento || "-"}
            </td>

            <td>
                ${formatarMoeda(venda.entrada)}
            </td>

            <td>
                ${venda.parcelas || 1}x
            </td>

            <td>
                ${venda.comissao
            ? formatarMoeda(
                venda.comissao.valor
            )
            : "-"
        }
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
                        onclick="abrirDocumento('contrato', ${venda.vendaid})">

                        <i class="fa-solid fa-file-contract"></i>

                    </button>

                    <button
                        class="btn-action btn-edit"
                        onclick="abrirDocumento('recibo', ${venda.vendaid})">

                        <i class="fa-solid fa-receipt"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}

/* LISTAR */

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

/* VEICULOS */

async function listarVeiculos() {

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
        .filter(v =>
            v.status === "DISPONIVEL"
        )
        .forEach(veiculo => {

            selectVeiculos.innerHTML += `

                <option value="${veiculo.veiculoid}">

                    ${veiculo.titulo}
                    -
                    ${formatarMoeda(
                veiculo.valorVenda
            )}

                </option>

            `;

        });

}

/* VENDEDORES */

async function listarVendedores() {

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

}

/* NOVA VENDA */

formVenda.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            const formData =
                new FormData(formVenda);

            /* CLIENTE */

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
                                ),

                            cpf:
                                formData.get(
                                    "cpf"
                                ),

                            cidade:
                                formData.get(
                                    "cidade"
                                )

                        })

                    }
                );

            const cliente =
                await clienteResponse.json();

            /* VENDA */

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

                            formaPagamento:
                                formData.get(
                                    "formaPagamento"
                                ),

                            entrada:
                                Number(
                                    formData.get(
                                        "entrada"
                                    ) || 0
                                ),

                            parcelas:
                                Number(
                                    formData.get(
                                        "parcelas"
                                    ) || 1
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

document.getElementById(
    "btnFiltrar"
).onclick = async () => {

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
                cliente.includes(termo)
                ||
                veiculo.includes(termo)
            );

        });

    tbodyVendas.innerHTML = "";

    filtradas.forEach(venda => {

        tbodyVendas.innerHTML +=
            montarLinhaVenda(venda);

    });

};

/* DOCUMENTOS */

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
            window.URL.createObjectURL(
                blob
            );

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