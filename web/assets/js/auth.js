const form = document.getElementById("loginForm");

const errorMessage =
    document.getElementById("errorMessage");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    errorMessage.style.display = "none";

    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;

    try {

        const response = await fetch(
            "http://localhost:3001/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    senha
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            errorMessage.style.display = "block";

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "usuario",
            JSON.stringify(data.usuario)
        );

        window.location.href =
            "../index.html";

    } catch (error) {

        console.log(error);

        errorMessage.style.display = "block";

    }

});