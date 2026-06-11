// Archivo: auth.js

const API_AUTH = 'api/auth.php';
const API_CATS = 'api/cats.php';
let usuarioActual = { role: 'guest' };

// Al cargar el documento arrancamos la app
document.addEventListener('DOMContentLoaded', () => {
    comprobarSesion();
    crearMenu();
    configurarFormularios();
});

// Comprobar si hay sesión guardada en el navegador
function comprobarSesion() {
    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
        try {
            usuarioActual = JSON.parse(userStr);
        } catch (e) {
            console.error("Error al parsear usuario:", e);
            usuarioActual = { role: 'guest' };
        }
    } else {
        usuarioActual = { role: 'guest' };
    }
}

// Pintar el menú dinámicamente según el rol
function crearMenu() {
    // Incorporar el logo en la barra de navegación dinámicamente
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
        navbarBrand.innerHTML = `
            <img src="./img/logo.png" alt="Logo Felinamente" style="height: 35px; width: auto; margin-right: 10px;" class="d-inline-block align-top">
            Felinamente.
        `;
        navbarBrand.classList.add('d-flex', 'align-items-center');
    }

    const navLinks = document.getElementById('nav-links');
    const navAuth = document.getElementById('nav-auth');
    if (!navLinks || !navAuth) return;

    // Enlaces para todo el mundo
    navLinks.innerHTML = `
        <a class="nav-link" href="index.html">Inicio</a>
        <a class="nav-link" href="gatos.html">Nuestros felinos</a>
    `;

    if (usuarioActual.role === 'guest') {
        // Menú para invitados
        navAuth.innerHTML = `
            <button class="btn-outline-minimal btn-sm me-2" data-bs-toggle="modal" data-bs-target="#registerModal">Registrarse</button>
            <button class="btn-minimal btn-sm" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
        `;
    } else {
        // Menú para usuarios logueados
        navAuth.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="dropdown me-3">
                    <button class="btn btn-link position-relative p-0 text-dark" type="button" id="notifDropdown" data-bs-toggle="dropdown">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
                          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                        </svg>
                        <span id="notif-badge" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle d-none"></span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-0" style="width: 280px;">
                        <li><h6 class="dropdown-header py-3 bg-light text-uppercase small">Notificaciones</h6></li>
                        <div id="notif-list" style="max-height: 300px; overflow-y: auto;">
                            <li><p class="dropdown-item small text-muted py-3 mb-0 text-center">No tienes notificaciones</p></li>
                        </div>
                    </ul>
                </div>

                <div class="dropdown">
                    <button class="btn btn-link nav-link dropdown-toggle d-flex align-items-center border-0 p-0" type="button" id="userDropdown" data-bs-toggle="dropdown">
                        <span class="me-2 d-none d-sm-inline text-dark">Hola, <strong>${usuarioActual.username}</strong></span>
                        <div class="rounded-circle text-white d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.8rem; background-color: var(--color-green);">
                            ${usuarioActual.username[0].toUpperCase()}
                        </div>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
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
            </div>
        `;

        // Asignar eventos a los botones del menú generado
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) btnLogout.addEventListener('click', cerrarSesion);

        const dropdownEl = document.getElementById('notifDropdown');
        if (dropdownEl) dropdownEl.addEventListener('show.bs.dropdown', marcarNotificacionesLeidas);

        // Cargamos las notificaciones del usuario
        cargarNotificaciones();
    }
}

// Configurar los listeners de los formularios de la página
function configurarFormularios() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            login(data);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            registro(data);
        });
    }
}

// =========================================================================
// FUNCIONES AJAX / FETCH (Aquí es donde editamos el DOM directamente)
// =========================================================================

async function login(credenciales) {
    // 1. EDITAMOS EL DOM ANTES DE ENVIAR (Estilo DAW)
    const btn = document.querySelector('#loginForm button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Cargando...';
    }

    try {
        const respuesta = await fetch(`${API_AUTH}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credenciales)
        });
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            sessionStorage.setItem('usuario', JSON.stringify(resultado.data));
            location.reload();
        } else {
            alert("Error: " + resultado.message);
            // 2. CORREGIMOS EL DOM SI FALLA EL LOGIN
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Login';
            }
        }
    } catch (error) {
        console.error("Error en login:", error);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Login';
        }
    }
}

async function registro(datosUsuario) {
    // 1. EDITAMOS EL DOM ANTES DE ENVIAR
    const btn = document.querySelector('#registerForm button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Registrando...';
    }

    try {
        const respuesta = await fetch(`${API_AUTH}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        const resultado = await respuesta.json();

        if (resultado.status === 201) {
            alert("Te has registrado correctamente. ¡Ya puedes iniciar sesión!");
            const modalEl = document.getElementById('registerModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        } else {
            alert("Error: " + resultado.message);
            // 2. CORREGIMOS EL DOM SI FALLA
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Registrarse';
            }
        }
    } catch (error) {
        console.error("Error en registro:", error);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Registrarse';
        }
    }
}

async function cerrarSesion() {
    sessionStorage.removeItem('usuario');
    await fetch(`${API_AUTH}?action=logout`);
    location.reload();
}

async function cargarNotificaciones() {
    try {
        const res = await fetch(`${API_AUTH}?action=get_notifications`);
        const json = await res.json();

        if (json.status === 200) {
            const list = document.getElementById('notif-list');
            const badge = document.getElementById('notif-badge');
            if (!list) return;

            // Mostrar u ocultar el badge rojo en el DOM
            const noLeidas = json.data.filter(n => !n.leida).length;
            if (noLeidas > 0) {
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }

            // Renderizar la lista de notificaciones en el DOM
            if (json.data.length > 0) {
                list.innerHTML = json.data.map(n => `
                    <li>
                        <a class="dropdown-item py-3 border-bottom ${n.leida ? 'opacity-75' : 'bg-light'}" href="mis-solicitudes.html" style="white-space: normal;">
                            <p class="mb-1 small fw-bold">${n.mensaje}</p>
                            <span class="small text-muted">${formatFecha(n.fecha_creacion)}</span>
                        </a>
                    </li>
                `).join('');
            }
        }
    } catch (e) {
        console.error("Error al cargar notificaciones:", e);
    }
}

async function marcarNotificacionesLeidas() {
    try {
        await fetch(`${API_AUTH}?action=read_notifications`, { method: 'POST' });
        const badge = document.getElementById('notif-badge');
        if (badge) badge.classList.add('d-none');
    } catch (e) {
        console.error("Error al marcar como leídas:", e);
    }
}

function formatFecha(timestamp) {
    if (!timestamp) return 'Desconocida';
    let date;
    if (typeof timestamp === 'number' || !isNaN(Number(timestamp))) {
        const val = Number(timestamp);
        date = new Date(val < 10000000000 ? val * 1000 : val);
    } else {
        date = new Date(String(timestamp).replace(' ', 'T'));
    }
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    return date.toLocaleDateString('es-ES', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}