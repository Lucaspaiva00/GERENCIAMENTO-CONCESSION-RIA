const form =
    document.getElementById(
        "formRegister"
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

        const formData =
            new FormData(form);

        const data =
            Object.fromEntries(
                formData.entries()
            );

        try {

            const response =
                await fetch(
                    "http://localhost:3001/auth/register",
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