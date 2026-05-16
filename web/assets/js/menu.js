const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const sidebar =
    document.querySelector(
        ".sidebar"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );

if (menuToggle) {

    menuToggle.onclick = () => {

        sidebar.classList.toggle(
            "active"
        );

        sidebarOverlay.classList.toggle(
            "active"
        );

    };

}

if (sidebarOverlay) {

    sidebarOverlay.onclick = () => {

        sidebar.classList.remove(
            "active"
        );

        sidebarOverlay.classList.remove(
            "active"
        );

    };

}