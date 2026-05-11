// Variables globales
const API_AUTH = 'api/auth.php';
const API_CATS = 'api/cats.php';
let usuarioActual = { role: 'guest' }; // Por defecto es invitado

// Cuando el documento cargue, comprobamos la sesión y pintamos el menú
document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
    pintarMenu();
    configurarFormulariosAuth();
});

// Comprueba si el usuario tiene una sesión activa en PHP
async function comprobarSesion() {
    try {
        const respuesta = await fetch(`${API_AUTH}?action=status`);
        const datos = await respuesta.json();
        if (datos.status === 200) {
            usuarioActual = datos.data;
        }
    } catch (error) {
        console.error("Error al comprobar la sesión:", error);
    }
}

// Pintar Navbar dinámicamente según sesión
function pintarMenu() {
    const navLinks = document.getElementById('nav-links');
    const navAuth = document.getElementById('nav-auth');
    if (!navLinks || !navAuth) return;

    let htmlLinks = `
        <a class="nav-link" href="index.html">Inicio</a>
        <a class="nav-link" href="gatos.html">Nuestros felinos</a>
    `;

    if (usuarioActual.role === 'admin' || usuarioActual.role === 'employee') {
        htmlLinks += `<a class="nav-link text-danger fw-bold" href="gestion.html">Gestión</a>`;
    }

    navLinks.innerHTML = htmlLinks;

    if (usuarioActual.role === 'guest') {
        navAuth.innerHTML = `
            <button class="btn btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#registerModal">Registrarse</button>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
        `;
    } else {
        navAuth.innerHTML = `
            <span class="navbar-text me-3">Hola, ${usuarioActual.username}</span>
            <button class="btn btn-outline-danger" onclick="cerrarSesion()">Cerrar Sesión</button>
        `;
    }
}

// Configura los eventos de los formularios de login y registro
function configurarFormulariosAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            await login(data);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            await registro(data);
        });
    }
}

// Funciones de Autenticación
async function login(credenciales) {
    try {
        const respuesta = await fetch(`${API_AUTH}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credenciales)
        });
        const resultado = await respuesta.json();
        if (resultado.status === 200) {
            location.reload();
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error en login:", error);
    }
}

async function registro(datosUsuario) {
    try {
        const respuesta = await fetch(`${API_AUTH}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        const resultado = await respuesta.json();
        if (resultado.status === 201) {
            alert("Te has registrado correctamente. ¡Ya puedes iniciar sesión!");
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if(modal) modal.hide();
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error en registro:", error);
    }
}

async function cerrarSesion() {
    await fetch(`${API_AUTH}?action=logout`);
    location.reload();
}
