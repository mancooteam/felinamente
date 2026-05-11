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

    // Links base (siempre visibles)
    navLinks.innerHTML = `
        <a class="nav-link" href="index.html">Inicio</a>
        <a class="nav-link" href="gatos.html">Nuestros felinos</a>
    `;

    if (usuarioActual.role === 'guest') {
        navAuth.innerHTML = `
            <button class="btn-outline-minimal btn-sm me-2" data-bs-toggle="modal" data-bs-target="#registerModal">Registrarse</button>
            <button class="btn-minimal btn-sm" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
        `;
    } else {
        navAuth.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-link nav-link dropdown-toggle d-flex align-items-center border-0 p-0" type="button" id="userDropdown" data-bs-toggle="dropdown">
                    <span class="me-2 d-none d-sm-inline text-dark">Hola, <strong>${usuarioActual.username}</strong></span>
                    <div class="rounded-circle text-white d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.8rem; background-color: var(--color-green);">
                        ${usuarioActual.username[0].toUpperCase()}
                    </div>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style="border-radius: 8px;">
                    <li><h6 class="dropdown-header small text-uppercase">Mi Cuenta</h6></li>
                    <li><a class="dropdown-item py-2" href="perfil.html">Mi Perfil</a></li>
                    <li><a class="dropdown-item py-2" href="mis-solicitudes.html">Mis Solicitudes</a></li>
                    
                    ${(usuarioActual.role === 'admin' || usuarioActual.role === 'employee') ? `
                        <li><hr class="dropdown-divider"></li>
                        <li><h6 class="dropdown-header small text-uppercase text-accent">Administración</h6></li>
                        <li><a class="dropdown-item py-2 fw-bold" href="gestion.html">Panel de Gestión</a></li>
                        <li><a class="dropdown-item py-2" href="solicitudes.html">Gestión de Solicitudes</a></li>
                    ` : ''}
                    
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item py-2 text-danger" id="btn-logout">Cerrar Sesión</button></li>
                </ul>
            </div>
        `;
        
        // Listener para el botón de logout (sin onclick)
        setTimeout(() => {
            const btnLogout = document.getElementById('btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', cerrarSesion);
            }
        }, 100);
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
