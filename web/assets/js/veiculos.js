const token = localStorage.getItem("token");

if (!token) {

    window.location.href =
        "../pages/login.html";

}

const tbody =
    document.getElementById("tbodyVeiculos");

const modal =
    document.getElementById("modalVeiculo");

const btnNovo =
    document.getElementById("btnNovoVeiculo");

const fecharModal =
    document.getElementById("fecharModal");

const form =
    document.getElementById("formVeiculo");

const previewImagem =
    document.getElementById("previewImagem");

btnNovo.addEventListener("click", () => {

    form.reset();

    document.getElementById(
        "veiculoid"
    ).value = "";

    previewImagem.style.display = "none";

    modal.style.display = "flex";

});

fecharModal.addEventListener("click", () => {

    modal.style.display = "none";

});

document.querySelector(
    'input[name="imagem"]'
).addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    previewImagem.src =
        URL.createObjectURL(file);

    previewImagem.style.display = "block";

});

async function carregarVeiculos() {

    try {

        const busca =
            document.getElementById("busca").value;

        const status =
            document.getElementById("status").value;

        const tipoEstoque =
            document.getElementById(
                "tipoEstoque"
            ).value;

        const response = await fetch(
            `http://localhost:3001/veiculos?busca=${busca}&status=${status}&tipoEstoque=${tipoEstoque}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        tbody.innerHTML = "";

        data.forEach((veiculo) => {

            let badgeStatus = "";

            if (
                veiculo.status === "DISPONIVEL"
            ) {

                badgeStatus =
                    `<span class="badge badge-success">
                        Disponível
                    </span>`;

            }

            if (
                veiculo.status === "VENDIDO"
            ) {

                badgeStatus =
                    `<span class="badge badge-danger">
                        Vendido
                    </span>`;

            }

            if (
                veiculo.status === "MANUTENCAO"
            ) {

                badgeStatus =
                    `<span class="badge badge-warning">
                        Manutenção
                    </span>`;

            }

            tbody.innerHTML += `
            
                <tr>

                    <td>

                        <img
                            src="http://localhost:3001/uploads/${veiculo.imagem}"
                            class="vehicle-image"
                        >

                    </td>

                    <td>

                        ${veiculo.titulo}

                    </td>

                    <td>

                        ${veiculo.placa || "-"}

                    </td>

                    <td>

                        R$ ${Number(
                veiculo.valorVenda
            ).toLocaleString("pt-BR")}

                    </td>

                    <td>

                        ${badgeStatus}

                    </td>

                    <td>

                        ${veiculo.tipoEstoque}

                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="btn-action btn-edit"
                                onclick="editarVeiculo(${veiculo.veiculoid})"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                class="btn-action btn-delete"
                                onclick="deletarVeiculo(${veiculo.veiculoid})"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </td>

                </tr>
            
            `;

        });

    } catch (error) {

        console.log(error);

    }

}

async function editarVeiculo(id) {

    try {

        const response = await fetch(
            `http://localhost:3001/veiculos/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const veiculo = await response.json();

        document.getElementById(
            "veiculoid"
        ).value =
            veiculo.veiculoid;

        form.titulo.value =
            veiculo.titulo;

        form.marca.value =
            veiculo.marca;

        form.modelo.value =
            veiculo.modelo;

        form.ano.value =
            veiculo.ano;

        form.placa.value =
            veiculo.placa;

        form.km.value =
            veiculo.km;

        form.valorCompra.value =
            veiculo.valorCompra;

        form.valorVenda.value =
            veiculo.valorVenda;

        form.tipo.value =
            veiculo.tipo;

        form.tipoEstoque.value =
            veiculo.tipoEstoque;

        if (veiculo.imagem) {

            previewImagem.src =
                `http://localhost:3001/uploads/${veiculo.imagem}`;

            previewImagem.style.display =
                "block";

        }

        modal.style.display = "flex";

    } catch (error) {

        console.log(error);

    }

}

async function deletarVeiculo(id) {

    const confirmar =
        confirm(
            "Deseja realmente deletar este veículo?"
        );

    if (!confirmar) return;

    try {

        await fetch(
            `http://localhost:3001/veiculos/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        carregarVeiculos();

    } catch (error) {

        console.log(error);

    }

}

document.getElementById("btnFiltrar")
    .addEventListener("click", carregarVeiculos);

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const formData = new FormData(form);

        formData.append("lojaId", 1);

        const veiculoid =
            document.getElementById(
                "veiculoid"
            ).value;

        let url =
            "http://localhost:3001/veiculos";

        let method = "POST";

        if (veiculoid) {

            url =
                `http://localhost:3001/veiculos/${veiculoid}`;

            method = "PUT";

        }

        const response = await fetch(
            url,
            {
                method,

                headers: {
                    Authorization:
                        `Bearer ${token}`
                },

                body: formData
            }
        );

        if (response.ok) {

            modal.style.display = "none";

            form.reset();

            carregarVeiculos();

        }

    } catch (error) {

        console.log(error);

    }

});

carregarVeiculos();