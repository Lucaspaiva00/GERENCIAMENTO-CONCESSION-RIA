const API = "http://localhost:3001";

const token = localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./login.html";

}

const tbody =
    document.getElementById("tbodyVeiculos");

const modal =
    document.getElementById("modalVeiculo");

const form =
    document.getElementById("formVeiculo");

const preview =
    document.getElementById("previewImagem");

const modalHistorico =
    document.getElementById("modalHistorico");

const historicoLista =
    document.getElementById("historicoLista");

/* LOGOUT */

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.clear();

        window.location.href =
            "./login.html";

    });

/* MODAL */

document.getElementById("btnNovoVeiculo")
    .addEventListener("click", () => {

        form.reset();

        preview.style.display =
            "none";

        document.getElementById(
            "veiculoid"
        ).value = "";

        modal.classList.add("active");

    });

document.getElementById("fecharModal")
    .addEventListener("click", () => {

        modal.classList.remove("active");

    });

document.getElementById("fecharHistorico")
    .addEventListener("click", () => {

        modalHistorico.classList.remove("active");

    });

/* PREVIEW */

form.imagem.addEventListener("change", e => {

    const file =
        e.target.files[0];

    if (!file) return;

    preview.src =
        URL.createObjectURL(file);

    preview.style.display =
        "block";

});

/* LISTAR */

async function listarVeiculos() {

    try {

        const response = await fetch(
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

        renderTabela(data);

        atualizarKPIs(data);

    } catch (error) {

        console.log(error);

    }

}

/* KPIS */

function atualizarKPIs(data) {

    document.getElementById(
        "kpiTotal"
    ).innerText = data.length;

    document.getElementById(
        "kpiDisponivel"
    ).innerText =
        data.filter(v =>
            v.status === "DISPONIVEL"
        ).length;

    document.getElementById(
        "kpiConsignado"
    ).innerText =
        data.filter(v =>
            v.tipoEstoque === "CONSIGNADO"
        ).length;

    document.getElementById(
        "kpiVendidos"
    ).innerText =
        data.filter(v =>
            v.status === "VENDIDO"
        ).length;

}

/* RENDER */

function renderTabela(lista) {

    tbody.innerHTML = "";

    lista.forEach(veiculo => {

        tbody.innerHTML += `
        
        <tr>

            <td>

                <img
                    src="${veiculo.imagem
                ? API + "/uploads/" + veiculo.imagem
                : "https://placehold.co/100x70"}"
                    class="vehicle-image">

            </td>

            <td>

                <strong>
                    ${veiculo.titulo}
                </strong>

                <br>

                <small>
                    ${veiculo.marca} • ${veiculo.modelo}
                </small>

            </td>

            <td>
                ${veiculo.placa || "-"}
            </td>

            <td>
                R$ ${Number(
                    veiculo.valorCompra
                ).toLocaleString("pt-BR")}
            </td>

            <td>
                R$ ${Number(
                    veiculo.valorVenda
                ).toLocaleString("pt-BR")}
            </td>

            <td>

                <span class="badge ${badgeStatus(veiculo.status)}">

                    ${veiculo.status}

                </span>

            </td>

            <td>

                <span class="badge ${badgeEstoque(veiculo.tipoEstoque)}">

                    ${veiculo.tipoEstoque}

                </span>

            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="btn-action btn-edit"
                        onclick="verHistorico(${veiculo.veiculoid})">

                        <i class="fa-solid fa-clock-rotate-left"></i>

                    </button>

                    <button
                        class="btn-action btn-delete"
                        onclick="deletarVeiculo(${veiculo.veiculoid})">

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

    return "badge-warning";

}

function badgeEstoque(tipo) {

    if (tipo === "CONSIGNADO")
        return "badge-warning";

    return "badge-success";

}

/* CADASTRAR */

form.addEventListener("submit", async e => {

    e.preventDefault();

    const formData =
        new FormData(form);

    try {

        const response = await fetch(
            `${API}/veiculos`,
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                },

                body: formData
            }
        );

        const veiculo =
            await response.json();

        /* HISTÓRICO */

        const descricao =
            form.historicoDescricao.value;

        const valor =
            form.historicoValor.value;

        if (descricao) {

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
                            veiculo.veiculoid,

                        descricao,

                        valor:
                            Number(valor || 0)

                    })
                }
            );

        }

        modal.classList.remove("active");

        listarVeiculos();

    } catch (error) {

        console.log(error);

    }

});

/* HISTÓRICO */

async function verHistorico(id) {

    try {

        const response = await fetch(
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

        historicoLista.innerHTML = "";

        if (!data.length) {

            historicoLista.innerHTML = `
            
            <div class="empty-state">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <p>
                    Nenhum histórico encontrado
                </p>

            </div>
            
            `;

        }

        data.forEach(item => {

            historicoLista.innerHTML += `
            
            <div class="historico-card">

                <div class="historico-topo">

                    <span class="historico-data">

                        ${new Date(item.createdAt)
                    .toLocaleDateString("pt-BR")}

                    </span>

                    <span class="historico-valor">

                        R$ ${Number(
                        item.valor || 0
                    ).toLocaleString("pt-BR")}

                    </span>

                </div>

                <p>

                    ${item.descricao}

                </p>

            </div>
            
            `;

        });

        modalHistorico.classList.add(
            "active"
        );

    } catch (error) {

        console.log(error);

    }

}

/* DELETE */

async function deletarVeiculo(id) {

    const confirmar =
        confirm(
            "Deseja deletar este veículo?"
        );

    if (!confirmar) return;

    try {

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

        listarVeiculos();

    } catch (error) {

        console.log(error);

    }

}

/* FILTRO */

document.getElementById("btnFiltrar")
    .addEventListener("click", async () => {

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

        const response = await fetch(
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

            const matchBusca =
                v.titulo.toLowerCase()
                    .includes(busca);

            const matchStatus =
                !status ||
                v.status === status;

            const matchEstoque =
                !estoque ||
                v.tipoEstoque === estoque;

            return (
                matchBusca &&
                matchStatus &&
                matchEstoque
            );

        });

        renderTabela(data);

    });

listarVeiculos();