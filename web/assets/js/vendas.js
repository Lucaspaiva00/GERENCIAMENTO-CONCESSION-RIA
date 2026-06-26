const API_URL = API_BASE_URL;

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

const cardsContainer =
    document.getElementById(
        "cardsContainer"
    );

const tableContainer =
    document.getElementById(
        "tableContainer"
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

const filtroPagamento =
    document.getElementById(
        "filtroPagamento"
    );

const dataInicio =
    document.getElementById(
        "dataInicio"
    );

const dataFim =
    document.getElementById(
        "dataFim"
    );

const btnTabela =
    document.getElementById(
        "btnTabela"
    );

const btnCards =
    document.getElementById(
        "btnCards"
    );

let vendasCache = [];
let vendaEditandoId = null;

/* =========================================
   LOGOUT
========================================= */

document.getElementById(
    "logoutBtn"
).onclick = () => {

    localStorage.clear();

    window.location.href =
        "./login.html";

};

/* =========================================
   MODAL
========================================= */

btnNovaVenda.onclick = () => {

    vendaEditandoId = null;

    formVenda.reset();

    document.querySelector(
        ".modal-header h2"
    ).innerText =
        "Nova venda";

    document.querySelector(
        "#formVenda button[type='submit']"
    ).innerHTML =
        `
        <i class="fa-solid fa-floppy-disk"></i>
        Finalizar venda
        `;

    modalVenda.classList.add(
        "active"
    );

};

fecharModal.onclick = () => {

    modalVenda.classList.remove(
        "active"
    );

};

/* =========================================
   VISUALIZAÇÃO
========================================= */

btnTabela.onclick = () => {

    btnTabela.classList.add(
        "active"
    );

    btnCards.classList.remove(
        "active"
    );

    tableContainer.style.display =
        "block";

    cardsContainer.style.display =
        "none";

};

btnCards.onclick = () => {

    btnCards.classList.add(
        "active"
    );

    btnTabela.classList.remove(
        "active"
    );

    tableContainer.style.display =
        "none";

    cardsContainer.style.display =
        "grid";

};

/* =========================================
   TEMPLATE TABELA
========================================= */

function montarLinhaVenda(venda) {

    return `

        <tr>

            <td>
                <strong>
                    ${venda.cliente?.nome || "-"}
                </strong>
                <br>
                <small>
                    ${venda.cliente?.cpf || "-"}
                </small>
            </td>

            <td>
                <strong>
                    ${venda.veiculo?.titulo || "-"}
                </strong>
                <br>
                <small>
                    ${venda.veiculo?.placa || "-"}
                </small>
            </td>

            <td>
                ${formatarMoeda(venda.valorVenda)}
            </td>

            <td>
                ${formatarMoeda(venda.valorCompra)}
            </td>

            <td>
                <span class="badge badge-success">
                    ${formatarMoeda(venda.lucro)}
                </span>
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
                        title="Contrato"
                        onclick="abrirDocumento('contrato', ${venda.vendaid})">

                        <i class="fa-solid fa-file-contract"></i>

                    </button>

                    <button
                        class="btn-action btn-edit"
                        title="Recibo"
                        onclick="abrirDocumento('recibo', ${venda.vendaid})">

                        <i class="fa-solid fa-receipt"></i>

                    </button>

                    <button
                        class="btn-action btn-edit"
                        title="Termo entrega"
                        onclick="abrirDocumento('termo-entrega', ${venda.vendaid})">

                        <i class="fa-solid fa-truck"></i>

                    </button>

                    <button
                        class="btn-action btn-edit"
                        title="Responsabilidade"
                        onclick="abrirDocumento('termo-responsabilidade', ${venda.vendaid})">

                        <i class="fa-solid fa-file-signature"></i>

                    </button>
                    <button
                        class="btn-action btn-delete"
                        title="Excluir venda"
                        onclick="excluirVenda(${venda.vendaid})">

                        <i class="fa-solid fa-trash"></i>

                    </button>
                </div>

            </td>

        </tr>

    `;

}

/* =========================================
   TEMPLATE CARD
========================================= */
function montarCardVenda(venda) {

    const estoqueClass =
        venda.veiculo?.tipoEstoque === "CONSIGNADO"
            ? "badge-consignado"
            : "badge-proprio";

    const estoqueLabel =
        venda.veiculo?.tipoEstoque === "CONSIGNADO"
            ? "Consignado"
            : "Próprio";

    return `

        <div class="venda-card-premium">

            <!-- TOPO -->

            <div class="venda-card-top">

                <div class="venda-cliente-box">

                    <div class="cliente-avatar">

                        ${(
            venda.cliente?.nome || "C"
        ).charAt(0).toUpperCase()}

                    </div>

                    <div>

                        <h2>
                            ${venda.cliente?.nome || "-"}
                        </h2>

                        <p>
                            ${venda.veiculo?.titulo || "-"}
                        </p>

                        <small>
                            ${venda.veiculo?.placa || "-"}
                        </small>

                    </div>

                </div>

                <span class="badge-card ${estoqueClass}">
                    ${estoqueLabel}
                </span>

            </div>

            <!-- GRID INFO -->

            <div class="venda-info-grid-premium">

                <div class="info-card-mini">

                    <span>CPF</span>

                    <strong>
                        ${venda.cliente?.cpf || "-"}
                    </strong>

                </div>

                <div class="info-card-mini">

                    <span>Telefone</span>

                    <strong>
                        ${venda.cliente?.telefone || "-"}
                    </strong>

                </div>

                <div class="info-card-mini">

                    <span>Pagamento</span>

                    <strong>
                        ${venda.formaPagamento || "-"}
                    </strong>

                </div>

                <div class="info-card-mini">

                    <span>Parcelas</span>

                    <strong>
                        ${venda.parcelas || 1}x
                    </strong>

                </div>

                <div class="info-card-mini">

                    <span>Vendedor</span>

                    <strong>
                        ${venda.vendedor?.nome || "-"}
                    </strong>

                </div>

                <div class="info-card-mini">

                    <span>Data</span>

                    <strong>
                        ${formatarData(venda.createdAt)}
                    </strong>

                </div>

            </div>

            <!-- VALORES -->

            <div class="valores-premium-grid">

                <div class="valor-premium venda">

                    <span>
                        Venda
                    </span>

                    <h3>
                        ${formatarMoeda(venda.valorVenda)}
                    </h3>

                </div>

                <div class="valor-premium compra">

                    <span>
                        Compra
                    </span>

                    <h3>
                        ${formatarMoeda(venda.valorCompra)}
                    </h3>

                </div>

                <div class="valor-premium lucro">

                    <span>
                        Lucro
                    </span>

                    <h3>
                        ${formatarMoeda(venda.lucro)}
                    </h3>

                </div>

            </div>

            <!-- EXTRA -->

            <div class="extra-venda-grid">

                <div class="extra-box">

                    <span>Entrada</span>

                    <strong>
                        ${formatarMoeda(venda.entrada)}
                    </strong>

                </div>

                <div class="extra-box">

                    <span>Comissão</span>

                    <strong>

                        ${venda.comissao
            ? formatarMoeda(venda.comissao.valor)
            : "-"}

                    </strong>

                </div>

            </div>
            <div class="documentos-grid" style="margin-bottom:12px;">

                <button
                    class="btn-doc-premium"
                    onclick="editarVenda(${venda.vendaid})">

                    <i class="fa-solid fa-pen"></i>
                    Editar

                </button>

                <button
                    class="btn-doc-premium"
                    style="background:linear-gradient(135deg,#dc2626,#ef4444)"
                    onclick="excluirVenda(${venda.vendaid})">

                    <i class="fa-solid fa-trash"></i>
                    Excluir

                </button>

            </div>
            <!-- DOCUMENTOS -->

            <div class="documentos-grid">

                <button
                    class="btn-doc-premium"

                    onclick="abrirDocumento(
                        'contrato',
                        ${venda.vendaid}
                    )">

                    <i class="fa-solid fa-file-contract"></i>

                    Contrato

                </button>

                <button
                    class="btn-doc-premium"

                    onclick="abrirDocumento(
                        'recibo',
                        ${venda.vendaid}
                    )">

                    <i class="fa-solid fa-receipt"></i>

                    Recibo

                </button>

                <button
                    class="btn-doc-premium"

                    onclick="abrirDocumento(
                        'termo-responsabilidade',
                        ${venda.vendaid}
                    )">

                    <i class="fa-solid fa-file-shield"></i>

                    Responsabilidade

                </button>

                <button
                    class="btn-doc-premium"

                    onclick="abrirDocumento(
                        'termo-entrega',
                        ${venda.vendaid}
                    )">

                    <i class="fa-solid fa-file-circle-check"></i>

                    Entrega

                </button>

            </div>

        </div>

    `;

}
/* =========================================
   LISTAR VENDAS
========================================= */

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

        vendasCache = vendas;

        renderizarVendas(vendas);

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao listar vendas"
        );

    }

}

/* =========================================
   RENDERIZAR
========================================= */

function renderizarVendas(vendas) {

    tbodyVendas.innerHTML = "";

    cardsContainer.innerHTML = "";

    let total = 0;
    let lucro = 0;

    if (!vendas.length) {

        tbodyVendas.innerHTML = `

            <tr>

                <td colspan="12"
                    style="text-align:center; padding:30px;">

                    Nenhuma venda encontrada.

                </td>

            </tr>

        `;

    }

    vendas.forEach(venda => {

        total += Number(
            venda.valorVenda || 0
        );

        lucro += Number(
            venda.lucro || 0
        );

        tbodyVendas.innerHTML +=
            montarLinhaVenda(venda);

        cardsContainer.innerHTML +=
            montarCardVenda(venda);

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

}

/* =========================================
   LISTAR VEÍCULOS
========================================= */

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
            .filter(v =>
                v.status === "DISPONIVEL"
            )
            .forEach(veiculo => {

                selectVeiculos.innerHTML += `

                    <option value="${veiculo.veiculoid}">

                        ${veiculo.titulo}
                        -
                        ${veiculo.placa || "-"}
                        -
                        ${formatarMoeda(
                    veiculo.valorVenda
                )}

                    </option>

                `;

            });

    } catch (error) {

        console.log(error);

    }

}

/* =========================================
   LISTAR VENDEDORES
========================================= */

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

/* =========================================
   NOVA VENDA
========================================= */

formVenda.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            const formData =
                new FormData(formVenda);
            if (vendaEditandoId) {

                const response =
                    await fetch(
                        `${API_URL}/vendas/${vendaEditandoId}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                Authorization:
                                    `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                nome: formData.get("clienteNome"),
                                telefone: formData.get("clienteTelefone"),
                                telefone2: formData.get("clienteTelefone2"),
                                rg: formData.get("rg"),
                                cpf: formData.get("cpf"),
                                cep: formData.get("cep"),
                                endereco: formData.get("endereco"),
                                numero: formData.get("numero"),
                                bairro: formData.get("bairro"),
                                cidade: formData.get("cidade"),
                                estado: formData.get("estado"),

                                vendedorId: formData.get("vendedorId")
                                    ? Number(formData.get("vendedorId"))
                                    : null,

                                valorVenda: Number(formData.get("valorVenda")),
                                formaPagamento: formData.get("formaPagamento"),
                                entrada: Number(formData.get("entrada") || 0),
                                parcelas: Number(formData.get("parcelas") || 1),
                                observacoes: formData.get("observacoes")
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Erro ao atualizar venda"
                    );

                    return;

                }

                alert(
                    "Venda atualizada com sucesso"
                );

                vendaEditandoId = null;

                modalVenda.classList.remove(
                    "active"
                );

                listarVendas();

                return;
            }
            /* CLIENTE */

            const clienteResponse =
                await fetch(
                    `${API_URL}/clientes`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            nome:
                                formData.get("clienteNome"),

                            telefone:
                                formData.get("clienteTelefone"),

                            telefone2:
                                formData.get("clienteTelefone2"),

                            rg:
                                formData.get("rg"),

                            cpf:
                                formData.get("cpf"),

                            cep:
                                formData.get("cep"),

                            endereco:
                                formData.get("endereco"),

                            numero:
                                formData.get("numero"),

                            bairro:
                                formData.get("bairro"),

                            cidade:
                                formData.get("cidade"),

                            estado:
                                formData.get("estado"),

                            vendedorId:
                                formData.get("vendedorId")
                                    ? Number(formData.get("vendedorId"))
                                    : null,

                            valorVenda:
                                Number(formData.get("valorVenda")),

                            formaPagamento:
                                formData.get("formaPagamento"),

                            entrada:
                                Number(formData.get("entrada") || 0),

                            parcelas:
                                Number(formData.get("parcelas") || 1),

                            observacoes:
                                formData.get("observacoes")

                        })

                    }
                );

            const cliente =
                await clienteResponse.json();

            if (
                cliente.error
            ) {

                alert(
                    cliente.error
                );

                return;

            }

            /* VENDA */

            const vendaResponse =
                await fetch(
                    `${API_URL}/vendas`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",

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

            alert(
                "Erro ao finalizar venda"
            );

        }

    }
);

/* =========================================
   FILTRAR
========================================= */

document.getElementById(
    "btnFiltrar"
).onclick = () => {

    const termo =
        busca.value.toLowerCase();

    const pagamento =
        filtroPagamento.value;

    const inicio =
        dataInicio.value;

    const fim =
        dataFim.value;

    const filtradas =
        vendasCache.filter(venda => {

            const cliente =
                venda.cliente?.nome
                    ?.toLowerCase() || "";

            const cpf =
                venda.cliente?.cpf
                    ?.toLowerCase() || "";

            const veiculo =
                venda.veiculo?.titulo
                    ?.toLowerCase() || "";

            const placa =
                venda.veiculo?.placa
                    ?.toLowerCase() || "";

            const matchBusca =

                cliente.includes(termo)
                ||
                cpf.includes(termo)
                ||
                veiculo.includes(termo)
                ||
                placa.includes(termo);

            const matchPagamento =
                !pagamento
                ||
                venda.formaPagamento === pagamento;

            let matchData = true;

            if (inicio && fim) {

                const vendaData =
                    new Date(
                        venda.createdAt
                    );

                const dataInicial =
                    new Date(inicio);

                const dataFinal =
                    new Date(fim);

                dataFinal.setHours(
                    23,
                    59,
                    59,
                    999
                );

                matchData =
                    vendaData >= dataInicial
                    &&
                    vendaData <= dataFinal;

            }

            return (
                matchBusca
                &&
                matchPagamento
                &&
                matchData
            );

        });

    renderizarVendas(
        filtradas
    );

};

/* =========================================
   DOCUMENTOS
========================================= */
let termoEntregaVendaId = null;

async function abrirDocumento(tipo, vendaId) {

    if (tipo === "termo-entrega") {

        const venda =
            vendasCache.find(
                item => Number(item.vendaid) === Number(vendaId)
            );

        termoEntregaVendaId = vendaId;

        document.getElementById("termoManual").checked =
            venda?.veiculo?.possuiManual || false;

        document.getElementById("termoChaveReserva").checked =
            venda?.veiculo?.possuiChaveReserva || false;

        document.getElementById("termoDocumento").checked = true;

        document.getElementById("termoReciboEntregue").checked = true;

        document.getElementById("termoRecibo5Dias").checked = false;

        document.getElementById("modalTermoEntrega")
            .classList.add("active");

        return;

    }

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

            alert("Erro ao gerar documento");

            return;

        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        window.open(url, "_blank");

    } catch (error) {

        console.log(error);

        alert("Erro ao abrir documento");

    }

}

document.getElementById("fecharModalTermoEntrega")
    .onclick = () => {

        document.getElementById("modalTermoEntrega")
            .classList.remove("active");

        termoEntregaVendaId = null;

    };

document.getElementById("termoRecibo5Dias")
    .addEventListener("change", function () {

        if (this.checked) {
            document.getElementById("termoReciboEntregue").checked = false;
        }

    });

document.getElementById("termoReciboEntregue")
    .addEventListener("change", function () {

        if (this.checked) {
            document.getElementById("termoRecibo5Dias").checked = false;
        }

    });

document.getElementById("btnGerarTermoEntrega")
    .onclick = async () => {

        if (!termoEntregaVendaId) return;

        const manual =
            document.getElementById("termoManual").checked;

        const chaveReserva =
            document.getElementById("termoChaveReserva").checked;

        const documento =
            document.getElementById("termoDocumento").checked;

        const reciboEntregue =
            document.getElementById("termoReciboEntregue").checked;

        const recibo5Dias =
            document.getElementById("termoRecibo5Dias").checked;

        const url =
            `${API_URL}/documentos/termo-entrega/${termoEntregaVendaId}` +
            `?manual=${manual}` +
            `&chaveReserva=${chaveReserva}` +
            `&documento=${documento}` +
            `&reciboEntregue=${reciboEntregue}` +
            `&recibo5Dias=${recibo5Dias}`;

        try {

            const response =
                await fetch(
                    url,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (!response.ok) {

                alert("Erro ao gerar termo de entrega");

                return;

            }

            const blob =
                await response.blob();

            const pdfUrl =
                window.URL.createObjectURL(blob);

            window.open(pdfUrl, "_blank");

            document.getElementById("modalTermoEntrega")
                .classList.remove("active");

            termoEntregaVendaId = null;

        } catch (error) {

            console.log(error);

            alert("Erro ao gerar termo de entrega");

        }

    };

/* =========================================
   HELPERS
========================================= */

function formatarData(data) {

    if (!data) return "-";

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

async function editarVenda(vendaId) {

    try {

        const response =
            await fetch(
                `${API_URL}/vendas/${vendaId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const venda =
            await response.json();
        const optionExiste =
            [...selectVeiculos.options]
                .some(
                    o => Number(o.value) === venda.veiculoId
                );

        if (!optionExiste) {

            selectVeiculos.innerHTML += `

        <option
            value="${venda.veiculoId}">

            ${venda.veiculo.titulo}
            -
            ${venda.veiculo.placa || "-"}

        </option>

    `;

        }
        vendaEditandoId =
            venda.vendaid;

        const form =
            formVenda;

        form.clienteNome.value =
            venda.cliente?.nome || "";

        form.clienteTelefone.value =
            venda.cliente?.telefone || "";

        form.clienteTelefone2.value =
            venda.cliente?.telefone2 || "";

        form.rg.value =
            venda.cliente?.rg || "";

        form.cpf.value =
            venda.cliente?.cpf || "";

        form.cidade.value =
            venda.cliente?.cidade || "";

        form.estado.value =
            venda.cliente?.estado || "";

        form.cep.value =
            venda.cliente?.cep || "";

        form.bairro.value =
            venda.cliente?.bairro || "";

        form.numero.value =
            venda.cliente?.numero || "";

        form.endereco.value =
            venda.cliente?.endereco || "";

        form.veiculoId.value =
            venda.veiculoId;

        form.valorVenda.value =
            venda.valorVenda;

        form.entrada.value =
            venda.entrada || 0;

        form.parcelas.value =
            venda.parcelas || 1;

        form.formaPagamento.value =
            venda.formaPagamento || "PIX";

        form.vendedorId.value =
            venda.vendedorId || "";

        form.observacoes.value =
            venda.observacoes || "";

        document.querySelector(
            ".modal-header h2"
        ).innerText =
            "Editar venda";

        document.querySelector(
            "#formVenda button[type='submit']"
        ).innerHTML =
            `
            <i class="fa-solid fa-floppy-disk"></i>
            Salvar alterações
            `;

        modalVenda.classList.add(
            "active"
        );

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao carregar venda"
        );

    }

}

/* =========================================
   EXCLUIR VENDA
========================================= */

async function excluirVenda(vendaId) {

    const confirmar = confirm(
        "Deseja realmente excluir esta venda?\n\nO veículo voltará para o estoque."
    );

    if (!confirmar) return;

    try {

        const response =
            await fetch(
                `${API_URL}/vendas/${vendaId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Erro ao excluir venda"
            );

            return;

        }

        alert(
            "Venda excluída com sucesso"
        );

        listarVendas();
        listarVeiculos();

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao excluir venda"
        );

    }

}

/* =========================================
   INIT
========================================= */

listarVendas();

listarVeiculos();

listarVendedores();