const API = API_BASE_URL;

const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/dfdinbti3/image/upload";

const CLOUDINARY_UPLOAD_PRESET =
    "concessionaria";

const token =
    localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./login.html";

}

const tbody =
    document.getElementById(
        "tbodyVeiculos"
    );

const modal =
    document.getElementById(
        "modalVeiculo"
    );

const form =
    document.getElementById(
        "formVeiculo"
    );

const preview =
    document.getElementById(
        "previewImagem"
    );

const inputImagem =
    document.getElementById(
        "inputImagem"
    );

const imagemUrl =
    document.getElementById(
        "imagemUrl"
    );

function urlImagemVeiculo(imagem) {

    if (!imagem) {
        return "https://placehold.co/120x80";
    }

    if (
        imagem.startsWith("http://") ||
        imagem.startsWith("https://")
    ) {
        return imagem;
    }

    return `${API}/files/${imagem}`;
}

const modalHistorico =
    document.getElementById(
        "modalHistorico"
    );

const historicoLista =
    document.getElementById(
        "historicoLista"
    );

/* LOGOUT */

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    () => {

        localStorage.clear();

        window.location.href =
            "./login.html";

    }
);

/* MODAL NOVO */

document.getElementById(
    "btnNovoVeiculo"
).addEventListener(
    "click",
    () => {

        form.reset();

        document.getElementById(
            "modalTitulo"
        ).innerText =
            "Novo veículo";

        document.getElementById(
            "veiculoid"
        ).value = "";

        preview.src = "";

        preview.style.display =
            "none";

        if (inputImagem) {
            inputImagem.value = "";
        }

        if (imagemUrl) {
            imagemUrl.value = "";
        }

        if (form.historicoDescricao) {

            form.historicoDescricao.disabled =
                false;

            form.historicoDescricao.placeholder =
                "Ex: troca de óleo, revisão, peças trocadas...";

        }

        if (form.historicoValor) {

            form.historicoValor.disabled =
                false;

        }

        modal.classList.add(
            "active"
        );

    }
);

/* FECHAR */

document.getElementById(
    "fecharModal"
).addEventListener(
    "click",
    () => {

        modal.classList.remove(
            "active"
        );

    }
);

document.getElementById(
    "fecharHistorico"
).addEventListener(
    "click",
    () => {

        modalHistorico.classList.remove(
            "active"
        );

    }
);

/* UPLOAD CLOUDINARY */

inputImagem.addEventListener(
    "change",
    async (e) => {

        const file =
            e.target.files[0];

        if (!file) return;

        preview.src =
            URL.createObjectURL(file);

        preview.style.display =
            "block";

        try {

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "upload_preset",
                CLOUDINARY_UPLOAD_PRESET
            );

            formData.append(
                "folder",
                "concessionaria"
            );

            const responseUpload =
                await fetch(
                    CLOUDINARY_URL,
                    {
                        method: "POST",
                        body: formData
                    }
                ).then((res) =>
                    res.json()
                );

            if (
                !responseUpload.secure_url
            ) {

                alert(
                    responseUpload.error?.message ||
                    "Erro ao enviar imagem"
                );

                return;

            }

            imagemUrl.value =
                responseUpload.secure_url;

            preview.src =
                responseUpload.secure_url;

        } catch (error) {

            console.log(error);

            alert(
                "Erro ao enviar imagem"
            );

        }

    }
);

function dadosVeiculoForm() {

    const payload = {
        titulo: form.titulo.value,
        marca: form.marca.value,
        modelo: form.modelo.value,
        ano: form.ano.value,
        anoModelo: form.anoModelo.value,
        placa: form.placa.value,
        renavam: form.renavam.value,
        chassi: form.chassi.value,
        cor: form.cor.value,
        km: form.km.value,
        possuiManual: form.possuiManual.value,
        possuiChaveReserva:
            form.possuiChaveReserva.value,
        valorCompra: form.valorCompra.value,
        valorVenda: form.valorVenda.value,
        tipo: form.tipo.value,
        tipoEstoque: form.tipoEstoque.value,
        observacoes: form.observacoes.value,
        imagem:
            imagemUrl?.value?.trim() || null
    };

    if (form.status) {
        payload.status = form.status.value;
    }

    return payload;
}

/* LISTAR */

async function listarVeiculos() {

    try {

        const response =
            await fetch(
                `${API}/veiculos`,
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
                "Erro ao listar veículos"
            );

            return;

        }

        renderTabela(data);

        atualizarKPIs(data);

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao carregar veículos"
        );

    }

}

/* KPIS */

function atualizarKPIs(data) {

    document.getElementById(
        "kpiTotal"
    ).innerText =
        data.length;

    document.getElementById(
        "kpiDisponivel"
    ).innerText =
        data.filter(
            v =>
                v.status ===
                "DISPONIVEL"
        ).length;

    document.getElementById(
        "kpiConsignado"
    ).innerText =
        data.filter(
            v =>
                v.tipoEstoque ===
                "CONSIGNADO"
        ).length;

    document.getElementById(
        "kpiVendidos"
    ).innerText =
        data.filter(
            v =>
                v.status ===
                "VENDIDO"
        ).length;

}

/* TABELA */

function renderTabela(lista) {

    tbody.innerHTML = "";

    if (!lista.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="9" style="text-align:center;padding:30px;">

                    Nenhum veículo encontrado

                </td>

            </tr>

        `;

        return;

    }

    lista.forEach(veiculo => {

        tbody.innerHTML += `

            <tr>

                <td>

                    <img
                        src="${urlImagemVeiculo(veiculo.imagem)}"
                        class="vehicle-image">

                </td>

                <td>

                    <strong>
                        ${veiculo.titulo || "-"}
                    </strong>

                    <br>

                    <small>

                        ${veiculo.marca || "-"}
                        •
                        ${veiculo.modelo || "-"}

                    </small>

                    <br>

                    <small>

                        RENAVAM:
                        ${veiculo.renavam || "-"}

                    </small>

                </td>

                <td>

                    ${veiculo.ano || "-"}
                    /
                    ${veiculo.anoModelo || "-"}

                </td>

                <td>

                    ${veiculo.placa || "-"}

                    <br>

                    <small>
                        ${veiculo.cor || "-"}
                    </small>

                </td>

                <td>

                    ${veiculo.km
                ? veiculo.km.toLocaleString("pt-BR")
                : "-"}

                </td>

                <td>

                    ${formatarMoeda(
                    veiculo.valorCompra
                )}

                </td>

                <td>

                    ${formatarMoeda(
                    veiculo.valorVenda
                )}

                </td>

                <td>

                    <span class="badge ${badgeStatus(veiculo.status)}">

                        ${veiculo.status}

                    </span>

                    <br><br>

                    <span class="badge ${badgeEstoque(veiculo.tipoEstoque)}">

                        ${veiculo.tipoEstoque}

                    </span>

                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="btn-action btn-edit"
                            onclick="editarVeiculo(${veiculo.veiculoid})"
                            title="Editar">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            class="btn-action btn-edit"
                            onclick="verHistorico(${veiculo.veiculoid})"
                            title="Histórico">

                            <i class="fa-solid fa-clock-rotate-left"></i>

                        </button>

                        <button
                            class="btn-action btn-delete"
                            onclick="deletarVeiculo(${veiculo.veiculoid})"
                            title="Excluir">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

}

/* BADGES */

function badgeStatus(status) {

    if (status === "DISPONIVEL")
        return "badge-success";

    if (status === "VENDIDO")
        return "badge-danger";

    if (status === "RESERVADO")
        return "badge-warning";

    return "badge-warning";

}

function badgeEstoque(tipo) {

    if (tipo === "CONSIGNADO")
        return "badge-warning";

    return "badge-success";

}

/* EDITAR */

async function editarVeiculo(id) {

    try {

        const response =
            await fetch(
                `${API}/veiculos/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const veiculo =
            await response.json();

        if (!response.ok || veiculo.error) {

            alert(
                veiculo.error ||
                "Erro ao buscar veículo"
            );

            return;

        }

        document.getElementById(
            "modalTitulo"
        ).innerText =
            "Editar veículo";

        form.veiculoid.value =
            veiculo.veiculoid || "";

        form.titulo.value =
            veiculo.titulo || "";

        form.marca.value =
            veiculo.marca || "";

        form.modelo.value =
            veiculo.modelo || "";

        form.ano.value =
            veiculo.ano || "";

        form.anoModelo.value =
            veiculo.anoModelo || "";

        form.placa.value =
            veiculo.placa || "";

        form.renavam.value =
            veiculo.renavam || "";

        form.chassi.value =
            veiculo.chassi || "";

        form.cor.value =
            veiculo.cor || "";

        form.km.value =
            veiculo.km || "";

        form.valorCompra.value =
            veiculo.valorCompra || "";

        form.valorVenda.value =
            veiculo.valorVenda || "";

        form.tipo.value =
            veiculo.tipo || "CARRO";

        form.tipoEstoque.value =
            veiculo.tipoEstoque || "PROPRIO";

        form.status.value =
            veiculo.status || "DISPONIVEL";

        form.possuiManual.value =
            veiculo.possuiManual
                ? "true"
                : "false";

        form.possuiChaveReserva.value =
            veiculo.possuiChaveReserva
                ? "true"
                : "false";

        form.observacoes.value =
            veiculo.observacoes || "";

        if (form.historicoDescricao) {

            form.historicoDescricao.value =
                "";

            form.historicoDescricao.disabled =
                true;

            form.historicoDescricao.placeholder =
                "Histórico deve ser adicionado pelo modal.";

        }

        if (form.historicoValor) {

            form.historicoValor.value =
                "";

            form.historicoValor.disabled =
                true;

        }

        if (inputImagem) {
            inputImagem.value = "";
        }

        if (veiculo.imagem) {

            imagemUrl.value =
                veiculo.imagem;

            preview.src =
                urlImagemVeiculo(
                    veiculo.imagem
                );

            preview.style.display =
                "block";

        } else {

            imagemUrl.value = "";

            preview.src = "";

            preview.style.display =
                "none";

        }

        modal.classList.add(
            "active"
        );

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao editar veículo"
        );

    }

}

/* SALVAR */

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const veiculoId =
            form.veiculoid.value;

        const url =
            veiculoId
                ? `${API}/veiculos/${veiculoId}`
                : `${API}/veiculos`;

        const method =
            veiculoId
                ? "PUT"
                : "POST";

        const payload =
            dadosVeiculoForm();

        try {

            const response =
                await fetch(url, {

                    method,

                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify(
                        payload
                    )

                });

            const result =
                await response.json();

            if (!response.ok || result.error) {

                alert(
                    result.error ||
                    "Erro ao salvar veículo"
                );

                return;

            }

            const descricao =
                form.historicoDescricao?.value;

            const valor =
                form.historicoValor?.value;

            if (!veiculoId && descricao) {

                await fetch(
                    `${API}/historico`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            veiculoId:
                                result.veiculoid,

                            descricao,

                            valor:
                                Number(valor || 0)

                        })

                    }
                );

            }

            alert(
                veiculoId
                    ? "Veículo atualizado com sucesso"
                    : "Veículo cadastrado com sucesso"
            );

            form.reset();

            if (inputImagem) {
                inputImagem.value = "";
            }

            if (imagemUrl) {
                imagemUrl.value = "";
            }

            preview.src = "";

            preview.style.display =
                "none";

            modal.classList.remove(
                "active"
            );

            listarVeiculos();

        } catch (error) {

            console.log(error);

            alert(
                "Erro ao salvar veículo"
            );

        }

    }
);

/* HISTÓRICO */

let veiculoHistoricoAtual =
    null;

async function verHistorico(id) {

    veiculoHistoricoAtual =
        id;

    document.getElementById(
        "historicoVeiculoId"
    ).value = id;

    await carregarHistorico(id);

    modalHistorico.classList.add(
        "active"
    );

}

async function carregarHistorico(id) {

    try {

        const response =
            await fetch(
                `${API}/historico/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        historicoLista.innerHTML =
            "";

        if (!data.length) {

            historicoLista.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-clock-rotate-left"></i>

                    <p>
                        Nenhum histórico encontrado
                    </p>

                </div>

            `;

            return;

        }

        data.forEach(item => {

            historicoLista.innerHTML += `

                <div class="historico-card">

                    <div class="historico-topo">

                        <span class="historico-data">

                            ${formatarData(item.createdAt)}

                        </span>

                        <span class="historico-valor">

                            ${formatarMoeda(item.valor || 0)}

                        </span>

                    </div>

                    <p>
                        ${item.descricao}
                    </p>

                </div>

            `;

        });

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao abrir histórico"
        );

    }

}

/* FORM HISTÓRICO */

const formHistorico =
    document.getElementById(
        "formHistorico"
    );

formHistorico.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const descricao =
            document.getElementById(
                "novaDescricaoHistorico"
            ).value;

        const valor =
            document.getElementById(
                "novoValorHistorico"
            ).value;

        try {

            const response =
                await fetch(
                    `${API}/historico`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            veiculoId:
                                veiculoHistoricoAtual,

                            descricao,

                            valor:
                                Number(valor || 0)

                        })

                    }
                );

            const result =
                await response.json();

            if (!response.ok || result.error) {

                alert(
                    result.error ||
                    "Erro ao cadastrar histórico"
                );

                return;

            }

            document.getElementById(
                "novaDescricaoHistorico"
            ).value = "";

            document.getElementById(
                "novoValorHistorico"
            ).value = "";

            await carregarHistorico(
                veiculoHistoricoAtual
            );

            alert(
                "Histórico cadastrado com sucesso"
            );

        } catch (error) {

            console.log(error);

            alert(
                "Erro ao cadastrar histórico"
            );

        }

    }
);

/* DELETAR */

async function deletarVeiculo(id) {

    const confirmar =
        confirm(
            "Deseja deletar este veículo?"
        );

    if (!confirmar) return;

    try {

        const response =
            await fetch(
                `${API}/veiculos/${id}`,
                {

                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }

                }
            );

        const result =
            await response.json();

        if (!response.ok || result.error) {

            alert(
                result.error ||
                "Erro ao deletar veículo"
            );

            return;

        }

        listarVeiculos();

    } catch (error) {

        console.log(error);

        alert(
            "Erro ao deletar veículo"
        );

    }

}

/* FILTRO */

document.getElementById(
    "btnFiltrar"
).addEventListener(
    "click",
    async () => {

        const busca =
            document.getElementById(
                "busca"
            ).value.toLowerCase();

        const status =
            document.getElementById(
                "status"
            ).value;

        const estoque =
            document.getElementById(
                "tipoEstoque"
            ).value;

        try {

            const response =
                await fetch(
                    `${API}/veiculos`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            let data =
                await response.json();

            data = data.filter(v => {

                const titulo =
                    v.titulo?.toLowerCase() || "";

                const placa =
                    v.placa?.toLowerCase() || "";

                const marca =
                    v.marca?.toLowerCase() || "";

                const modelo =
                    v.modelo?.toLowerCase() || "";

                const renavam =
                    v.renavam?.toLowerCase() || "";

                const chassi =
                    v.chassi?.toLowerCase() || "";

                const matchBusca =

                    titulo.includes(busca)
                    ||
                    placa.includes(busca)
                    ||
                    marca.includes(busca)
                    ||
                    modelo.includes(busca)
                    ||
                    renavam.includes(busca)
                    ||
                    chassi.includes(busca);

                const matchStatus =
                    !status ||
                    v.status === status;

                const matchEstoque =
                    !estoque ||
                    v.tipoEstoque === estoque;

                return (
                    matchBusca
                    &&
                    matchStatus
                    &&
                    matchEstoque
                );

            });

            renderTabela(data);

        } catch (error) {

            console.log(error);

            alert(
                "Erro ao filtrar veículos"
            );

        }

    }
);

/* HELPERS */

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

/* INIT */

listarVeiculos();