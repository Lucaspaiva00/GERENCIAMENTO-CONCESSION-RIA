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

/* LOGOUT */

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.clear();

        window.location.href =
            "./login.html";

    });

/* MODAL */

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

/* LISTAR */

async function listarUsuarios() {

    try {

        const response =
            await fetch(
                `${API}/usuarios`
            );

        const usuarios =
            await response.json();

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

            </tr>
            
            `;

        });

        atualizarKPIs(usuarios);

    } catch (error) {

        console.log(error);

    }

}

/* KPIS */

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

/* CADASTRAR */

form.addEventListener("submit",
    async e => {

        e.preventDefault();

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

            const response =
                await fetch(
                    `${API}/usuarios`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(dados)
                    }
                );

            if (!response.ok) {

                alert(
                    "Erro ao cadastrar usuário"
                );

                return;

            }

            modal.classList.remove(
                "active"
            );

            listarUsuarios();

        } catch (error) {

            console.log(error);

        }

    });

listarUsuarios();