const API_URL =
    API_BASE_URL;

const token =
    localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./login.html";

}

const tbodyClientes =
    document.getElementById(
        "tbodyClientes"
    );

const modalCliente =
    document.getElementById(
        "modalCliente"
    );

const btnNovoCliente =
    document.getElementById(
        "btnNovoCliente"
    );

const fecharModal =
    document.getElementById(
        "fecharModal"
    );

const formCliente =
    document.getElementById(
        "formCliente"
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

btnNovoCliente.onclick = () => {

    modalCliente.classList.add(
        "active"
    );

};

fecharModal.onclick = () => {

    modalCliente.classList.remove(
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

/* LISTAR CLIENTES */

async function listarClientes() {

    try {

        const response =
            await fetch(
                `${API_URL}/clientes`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const clientes =
            await response.json();

        tbodyClientes.innerHTML = "";

        let ativos = 0;

        clientes.forEach(cliente => {

            if (
                cliente.vendas.length > 0
            ) {
                ativos++;
            }

            tbodyClientes.innerHTML += `

                <tr>

                    <td>
                        ${cliente.nome}
                    </td>

                    <td>
                        ${cliente.telefone || "-"}
                    </td>

                    <td>
                        ${cliente.cpf || "-"}
                    </td>

                    <td>
                        ${cliente.cidade || "-"}
                    </td>

                    <td>

                        <span class="badge badge-success">

                            ${cliente.vendas.length} compras

                        </span>

                    </td>

                    <td>
                        ${formatarData(
                cliente.createdAt
            )}
                    </td>

                </tr>

            `;

        });

        document.getElementById(
            "totalClientes"
        ).innerText =
            clientes.length;

        document.getElementById(
            "clientesAtivos"
        ).innerText =
            ativos;

    } catch (error) {

        console.log(error);

    }

}

/* CADASTRAR */

formCliente.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            const formData =
                new FormData(
                    formCliente
                );

            const response =
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
                                formData.get("nome"),

                            telefone:
                                formData.get("telefone"),

                            telefone2:
                                formData.get("telefone2"),

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
                                formData.get("estado")

                        })

                    }
                );

            await response.json();

            alert(
                "Cliente cadastrado"
            );

            formCliente.reset();

            modalCliente.classList.remove(
                "active"
            );

            listarClientes();

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
                `${API_URL}/clientes`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const clientes =
            await response.json();

        const filtrados =
            clientes.filter(cliente => {

                return (

                    cliente.nome
                        ?.toLowerCase()
                        .includes(termo)

                    ||

                    cliente.telefone
                        ?.toLowerCase()
                        .includes(termo)

                    ||

                    cliente.cpf
                        ?.toLowerCase()
                        .includes(termo)

                );

            });

        tbodyClientes.innerHTML = "";

        filtrados.forEach(cliente => {

            tbodyClientes.innerHTML += `

                <tr>

                    <td>
                        ${cliente.nome}
                    </td>

                    <td>
                        ${cliente.telefone || "-"}
                    </td>

                    <td>
                        ${cliente.cpf || "-"}
                    </td>

                    <td>
                        ${cliente.cidade || "-"}
                    </td>

                    <td>

                        <span class="badge badge-success">

                            ${cliente.vendas.length} compras

                        </span>

                    </td>

                    <td>
                        ${formatarData(
                cliente.createdAt
            )}
                    </td>

                </tr>

            `;

        });

    };

/* DATA */

function formatarData(data) {

    return new Date(data)
        .toLocaleDateString(
            "pt-BR"
        );

}

/* INIT */

listarClientes();