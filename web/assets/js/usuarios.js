const API =
    "http://localhost:3001";

const token =
    localStorage.getItem("token");

if (!token) {

    window.location.href =
        "./login.html";

}

const tbody =
    document.getElementById(
        "tbodyUsuarios"
    );

const modal =
    document.getElementById(
        "modalUsuario"
    );

const form =
    document.getElementById(
        "formUsuario"
    );

/* =========================================
   LOGOUT
========================================= */

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.clear();

        window.location.href =
            "./login.html";

    });

/* =========================================
   MODAL
========================================= */

document.getElementById("btnNovoUsuario")
    .addEventListener("click", () => {

        form.reset();

        modal.classList.add(
            "active"
        );

    });

document.getElementById("fecharModal")
    .addEventListener("click", () => {

        modal.classList.remove(
            "active"
        );

    });

/* =========================================
   LISTAR USUÁRIOS
========================================= */

async function listarUsuarios() {

    try {

        const response =
            await fetch(
                `${API}/usuarios`,
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );

        const usuarios =
            await response.json();

        console.log(usuarios);

        tbody.innerHTML = "";

        usuarios.forEach(usuario => {

            tbody.innerHTML += `
            
            <tr>

                <td>

                    <strong>
                        ${usuario.nome}
                    </strong>

                </td>

                <td>

                    ${usuario.email}

                </td>

                <td>

                    <span class="badge ${usuario.tipo === "ADMIN"
                    ? "badge-warning"
                    : "badge-success"}">

                        ${usuario.tipo}

                    </span>

                </td>

                <td>

                    ${usuario.comissaoPercentual || 0}%

                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="btn-action btn-edit"
                            onclick="editarUsuario(${usuario.usuarioid})">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            class="btn-action btn-delete"
                            onclick="deletarUsuario(${usuario.usuarioid})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>
            
            `;

        });

        atualizarKPIs(usuarios);

    } catch (error) {

        console.log(error);

    }

}

/* =========================================
   KPIS
========================================= */

function atualizarKPIs(lista) {

    document.getElementById(
        "kpiUsuarios"
    ).innerText =
        lista.length;

    document.getElementById(
        "kpiAdmins"
    ).innerText =
        lista.filter(
            u => u.tipo === "ADMIN"
        ).length;

    document.getElementById(
        "kpiVendedores"
    ).innerText =
        lista.filter(
            u => u.tipo === "VENDEDOR"
        ).length;

}

/* =========================================
   CADASTRAR / EDITAR
========================================= */

form.addEventListener("submit",
    async e => {

        e.preventDefault();

        const usuarioid =
            form.usuarioid.value;

        const dados = {

            nome:
                form.nome.value,

            email:
                form.email.value,

            senha:
                form.senha.value,

            tipo:
                form.tipo.value,

            comissaoPercentual:
                Number(
                    form.comissaoPercentual.value || 0
                )

        };

        try {

            let response;

            /* EDITAR */

            if (usuarioid) {

                response =
                    await fetch(
                        `${API}/usuarios/${usuarioid}`,
                        {
                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(dados)

                        }
                    );

            }

            /* CADASTRAR */

            else {

                response =
                    await fetch(
                        `${API}/usuarios`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(dados)

                        }
                    );

            }

            const resultado =
                await response.json();

            console.log(resultado);

            if (!response.ok) {

                alert(
                    resultado.error ||
                    "Erro ao salvar usuário"
                );

                return;

            }

            alert(
                usuarioid
                    ? "Usuário atualizado com sucesso"
                    : "Usuário cadastrado com sucesso"
            );

            modal.classList.remove(
                "active"
            );

            form.reset();

            listarUsuarios();

        } catch (error) {

            console.log(error);

            alert(
                "Erro interno"
            );

        }

    });

/* =========================================
   EDITAR
========================================= */

async function editarUsuario(id) {

    try {

        const response =
            await fetch(
                `${API}/usuarios/${id}`,
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );

        const usuario =
            await response.json();

        console.log(usuario);

        form.usuarioid.value =
            usuario.usuarioid;

        form.nome.value =
            usuario.nome;

        form.email.value =
            usuario.email;

        form.tipo.value =
            usuario.tipo;

        form.comissaoPercentual.value =
            usuario.comissaoPercentual || 0;

        form.senha.value = "";

        modal.classList.add(
            "active"
        );

    } catch (error) {

        console.log(error);

    }

}

/* =========================================
   DELETAR
========================================= */

async function deletarUsuario(id) {

    const confirmar =
        confirm(
            "Deseja deletar este usuário?"
        );

    if (!confirmar) return;

    try {

        const response =
            await fetch(
                `${API}/usuarios/${id}`,
                {
                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );

        const resultado =
            await response.json();

        console.log(resultado);

        listarUsuarios();

    } catch (error) {

        console.log(error);

    }

}

/* =========================================
   INIT
========================================= */

listarUsuarios();