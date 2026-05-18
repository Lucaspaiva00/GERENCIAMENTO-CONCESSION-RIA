const form =
    document.getElementById(
        "loginForm"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        errorMessage.style.display =
            "none";

        const data = {

            email:
                form.email.value,

            senha:
                form.senha.value

        };

        try {

            const response =
                await fetch(
                    "http://localhost:3001/usuarios/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)

                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                errorMessage.style.display =
                    "block";

                errorMessage.innerText =
                    result.error ||
                    "Email ou senha inválidos";

                return;

            }

            localStorage.setItem(
                "token",
                result.token
            );

            localStorage.setItem(
                "usuario",
                JSON.stringify(
                    result.usuario
                )
            );

            window.location.href =
                "../index.html";

        } catch (error) {

            console.log(error);

            errorMessage.style.display =
                "block";

            errorMessage.innerText =
                "Erro ao realizar login";

        }

    }
);