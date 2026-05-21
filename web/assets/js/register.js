const form =
    document.getElementById(
        "formRegister"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const inputTelefoneLoja =
    document.getElementById(
        "telefoneLoja"
    );

function mascaraTelefone(valor) {

    const numeros =
        valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length === 0) {
        return "";
    }

    if (numeros.length <= 2) {
        return `(${numeros}`;
    }

    if (numeros.length <= 6) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

if (inputTelefoneLoja) {

    inputTelefoneLoja.addEventListener(
        "input",
        (e) => {

            const cursor =
                e.target.selectionStart;

            const antes =
                e.target.value.length;

            e.target.value =
                mascaraTelefone(
                    e.target.value
                );

            const depois =
                e.target.value.length;

            const diff =
                depois - antes;

            e.target.setSelectionRange(
                cursor + diff,
                cursor + diff
            );

        }
    );

}

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        errorMessage.style.display =
            "none";

        const formData =
            new FormData(form);

        const data =
            Object.fromEntries(
                formData.entries()
            );

        if (data.telefoneLoja) {
            data.telefoneLoja =
                data.telefoneLoja.replace(
                    /\D/g,
                    ""
                );
        }

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/auth/register`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify(data)

                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                errorMessage.style.display =
                    "block";

                errorMessage.innerText =
                    result.error ||
                    "Erro ao criar conta";

                return;

            }

            alert(
                "Conta criada com sucesso!"
            );

            window.location.href =
                "./login.html";

        } catch (error) {

            console.log(error);

            errorMessage.style.display =
                "block";

            errorMessage.innerText =
                "Erro ao criar conta";

        }

    }
);