const API = "http://localhost:3001";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "./login.html";
}

const tbody = document.getElementById("tbodyVeiculos");
const modal = document.getElementById("modalVeiculo");
const form = document.getElementById("formVeiculo");
const preview = document.getElementById("previewImagem");
const modalHistorico = document.getElementById("modalHistorico");
const historicoLista = document.getElementById("historicoLista");

/* LOGOUT */

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "./login.html";
});

/* MODAL NOVO */

document.getElementById("btnNovoVeiculo").addEventListener("click", () => {
    form.reset();

    document.getElementById("modalTitulo").innerText = "Novo veículo";
    document.getElementById("veiculoid").value = "";

    preview.src = "";
    preview.style.display = "none";

    if (form.historicoDescricao) {
        form.historicoDescricao.disabled = false;
        form.historicoDescricao.placeholder =
            "Ex: troca de óleo, revisão, peças trocadas, observações...";
    }

    if (form.historicoValor) {
        form.historicoValor.disabled = false;
    }

    modal.classList.add("active");
});

/* FECHAR MODAIS */

document.getElementById("fecharModal").addEventListener("click", () => {
    modal.classList.remove("active");
});

document.getElementById("fecharHistorico").addEventListener("click", () => {
    modalHistorico.classList.remove("active");
});

/* PREVIEW IMAGEM */

form.imagem.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});

/* LISTAR VEÍCULOS */

async function listarVeiculos() {
    try {
        const response = await fetch(`${API}/veiculos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            alert(data.error || "Erro ao listar veículos");
            return;
        }

        renderTabela(data);
        atualizarKPIs(data);

    } catch (error) {
        console.log(error);
        alert("Erro ao carregar veículos");
    }
}

/* KPIS */

function atualizarKPIs(data) {
    document.getElementById("kpiTotal").innerText = data.length;

    document.getElementById("kpiDisponivel").innerText =
        data.filter(v => v.status === "DISPONIVEL").length;

    document.getElementById("kpiConsignado").innerText =
        data.filter(v => v.tipoEstoque === "CONSIGNADO").length;

    document.getElementById("kpiVendidos").innerText =
        data.filter(v => v.status === "VENDIDO").length;
}

/* RENDER TABELA */

function renderTabela(lista) {
    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding: 30px;">
                    Nenhum veículo encontrado.
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
                        src="${veiculo.imagem ? API + "/uploads/" + veiculo.imagem : "https://placehold.co/100x70"}"
                        class="vehicle-image">
                </td>

                <td>
                    <strong>${veiculo.titulo || "-"}</strong>
                    <br>
                    <small>${veiculo.marca || "-"} • ${veiculo.modelo || "-"}</small>
                </td>

                <td>
                    ${veiculo.placa || "-"}
                </td>

                <td>
                    ${formatarMoeda(veiculo.valorCompra)}
                </td>

                <td>
                    ${formatarMoeda(veiculo.valorVenda)}
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
    if (status === "DISPONIVEL") return "badge-success";
    if (status === "VENDIDO") return "badge-danger";
    return "badge-warning";
}

function badgeEstoque(tipo) {
    if (tipo === "CONSIGNADO") return "badge-warning";
    return "badge-success";
}

/* EDITAR VEÍCULO */

async function editarVeiculo(id) {
    try {
        const response = await fetch(`${API}/veiculos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const veiculo = await response.json();

        if (!response.ok || veiculo.error) {
            alert(veiculo.error || "Erro ao buscar veículo");
            return;
        }

        document.getElementById("modalTitulo").innerText = "Editar veículo";

        form.veiculoid.value = veiculo.veiculoid;
        form.titulo.value = veiculo.titulo || "";
        form.marca.value = veiculo.marca || "";
        form.modelo.value = veiculo.modelo || "";
        form.ano.value = veiculo.ano || "";
        form.placa.value = veiculo.placa || "";
        form.km.value = veiculo.km || "";
        form.valorCompra.value = veiculo.valorCompra || "";
        form.valorVenda.value = veiculo.valorVenda || "";
        form.tipo.value = veiculo.tipo || "MOTO";
        form.tipoEstoque.value = veiculo.tipoEstoque || "PROPRIO";

        if (form.chassi) {
            form.chassi.value = veiculo.chassi || "";
        }

        if (form.cor) {
            form.cor.value = veiculo.cor || "";
        }

        if (form.status) {
            form.status.value = veiculo.status || "DISPONIVEL";
        }

        if (form.observacoes) {
            form.observacoes.value = veiculo.observacoes || "";
        }

        if (form.historicoDescricao) {
            form.historicoDescricao.value = "";
            form.historicoDescricao.disabled = true;
            form.historicoDescricao.placeholder =
                "Histórico só pode ser adicionado no cadastro inicial ou pelo modal de histórico.";
        }

        if (form.historicoValor) {
            form.historicoValor.value = "";
            form.historicoValor.disabled = true;
        }

        if (veiculo.imagem) {
            preview.src = `${API}/uploads/${veiculo.imagem}`;
            preview.style.display = "block";
        } else {
            preview.src = "";
            preview.style.display = "none";
        }

        modal.classList.add("active");

    } catch (error) {
        console.log(error);
        alert("Erro ao editar veículo");
    }
}

/* SALVAR / ATUALIZAR VEÍCULO */

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const veiculoId = formData.get("veiculoid");

    const url = veiculoId
        ? `${API}/veiculos/${veiculoId}`
        : `${API}/veiculos`;

    const method = veiculoId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            alert(result.error || "Erro ao salvar veículo");
            return;
        }

        const descricao = formData.get("historicoDescricao");
        const valor = formData.get("historicoValor");

        if (!veiculoId && descricao) {
            await fetch(`${API}/historico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    veiculoId: result.veiculoid,
                    descricao,
                    valor: Number(valor || 0)
                })
            });
        }

        alert(
            veiculoId
                ? "Veículo atualizado com sucesso"
                : "Veículo cadastrado com sucesso"
        );

        form.reset();

        document.getElementById("modalTitulo").innerText = "Novo veículo";
        document.getElementById("veiculoid").value = "";

        preview.src = "";
        preview.style.display = "none";

        if (form.historicoDescricao) {
            form.historicoDescricao.disabled = false;
        }

        if (form.historicoValor) {
            form.historicoValor.disabled = false;
        }

        modal.classList.remove("active");

        listarVeiculos();

    } catch (error) {
        console.log(error);
        alert("Erro ao salvar veículo");
    }
});

/* HISTÓRICO */
let veiculoHistoricoAtual = null;

async function verHistorico(id) {
    veiculoHistoricoAtual = id;

    document.getElementById("historicoVeiculoId").value = id;

    await carregarHistorico(id);

    modalHistorico.classList.add("active");
}

async function carregarHistorico(id) {
    try {
        const response = await fetch(`${API}/historico/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            alert(data.error || "Erro ao buscar histórico");
            return;
        }

        historicoLista.innerHTML = "";

        if (!data.length) {
            historicoLista.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <p>Nenhum histórico encontrado</p>
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

                    <p>${item.descricao}</p>
                </div>
            `;
        });

    } catch (error) {
        console.log(error);
        alert("Erro ao abrir histórico");
    }
}
/* DELETAR */

async function deletarVeiculo(id) {
    const confirmar = confirm("Deseja deletar este veículo?");

    if (!confirmar) return;

    try {
        const response = await fetch(`${API}/veiculos/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            alert(result.error || "Erro ao deletar veículo");
            return;
        }

        listarVeiculos();

    } catch (error) {
        console.log(error);
        alert("Erro ao deletar veículo");
    }
}

/* FILTRO */

document.getElementById("btnFiltrar").addEventListener("click", async () => {
    const busca = document.getElementById("busca").value.toLowerCase();
    const status = document.getElementById("status").value;
    const estoque = document.getElementById("tipoEstoque").value;

    try {
        const response = await fetch(`${API}/veiculos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        let data = await response.json();

        if (!response.ok || data.error) {
            alert(data.error || "Erro ao filtrar veículos");
            return;
        }

        data = data.filter(v => {
            const titulo = v.titulo?.toLowerCase() || "";
            const placa = v.placa?.toLowerCase() || "";
            const marca = v.marca?.toLowerCase() || "";
            const modelo = v.modelo?.toLowerCase() || "";

            const matchBusca =
                titulo.includes(busca) ||
                placa.includes(busca) ||
                marca.includes(busca) ||
                modelo.includes(busca);

            const matchStatus =
                !status || v.status === status;

            const matchEstoque =
                !estoque || v.tipoEstoque === estoque;

            return matchBusca && matchStatus && matchEstoque;
        });

        renderTabela(data);

    } catch (error) {
        console.log(error);
        alert("Erro ao filtrar veículos");
    }
});

/* HELPERS */

function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

/* INIT */

listarVeiculos();

const formHistorico = document.getElementById("formHistorico");

formHistorico.addEventListener("submit", async (e) => {
    e.preventDefault();

    const descricao = document.getElementById("novaDescricaoHistorico").value;
    const valor = document.getElementById("novoValorHistorico").value;

    try {
        const response = await fetch(`${API}/historico`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                veiculoId: veiculoHistoricoAtual,
                descricao,
                valor: Number(valor || 0)
            })
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            alert(result.error || "Erro ao cadastrar histórico");
            return;
        }

        document.getElementById("novaDescricaoHistorico").value = "";
        document.getElementById("novoValorHistorico").value = "";

        await carregarHistorico(veiculoHistoricoAtual);

        alert("Histórico cadastrado com sucesso");

    } catch (error) {
        console.log(error);
        alert("Erro ao cadastrar histórico");
    }
});