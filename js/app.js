// Variables globales
const API_AUTH = 'api/auth.php';
const API_CATS = 'api/cats.php';
let usuarioActual = { role: 'guest' }; // Por defecto es invitado

// Cuando el documento cargue, comprobamos la sesión
document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
    iniciarApp();
    configurarFormularios();
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

// Inicia la aplicación mostrando el menú y la vista correcta según la URL
function iniciarApp() {
    pintarMenu();
    
    // Leer los parámetros de la URL para saber qué página mostrar
    const params = new URLSearchParams(window.location.search);
    if (params.has('gato')) {
        verDetallesGato(params.get('gato'));
    } else if (params.has('view')) {
        const view = params.get('view');
        if (view === 'gatos') {
            cargarGatos();
        } else if (view === 'gestion' && (usuarioActual.role === 'admin' || usuarioActual.role === 'employee')) {
            cargarPanelGestion();
        } else {
            cargarInicio();
        }
    } else {
        cargarInicio();
    }
}

// Configura los eventos de los formularios de login, registro y gatos
function configurarFormularios() {
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

    const formGato = document.getElementById('formGato');
    if (formGato) {
        formGato.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formGato);
            const data = Object.fromEntries(formData.entries());
            data.vhif_positive = formData.get('vhif_positive') ? 1 : 0;
            await guardarGato(data);
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

// Pintar Interfaz
function pintarMenu() {
    const navLinks = document.getElementById('nav-links');
    const navAuth = document.getElementById('nav-auth');
    
    let htmlLinks = `
        <a class="nav-link" href="?view=inicio">Inicio</a>
        <a class="nav-link" href="?view=gatos">Nuestros felinos</a>
    `;

    if (usuarioActual.role === 'admin' || usuarioActual.role === 'employee') {
        htmlLinks += `<a class="nav-link text-danger fw-bold" href="?view=gestion">Gestión</a>`;
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

function cargarInicio() {
    const contenedor = document.getElementById('main-content');
    contenedor.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <h2>Bienvenidos a Felinamente</h2>
                <p>Nuestra misión es facilitar la visibilidad de los gatos disponibles para adopción.</p>
                <div id="carruselGatos" class="carousel slide" data-bs-ride="carousel">
                  <div class="carousel-inner rounded shadow-sm">
                    <div class="carousel-item active">
                      <img src="img/slider_1.png" class="d-block w-100" alt="Gato 1" style="height: 350px; object-fit: cover;">
                    </div>
                    <div class="carousel-item">
                      <img src="img/slider_2.png" class="d-block w-100" alt="Gato 2" style="height: 350px; object-fit: cover;">
                    </div>
                  </div>
                </div>
            </div>
            <div class="col-md-4 text-center mt-4">
                <img src="img/logo.png" alt="Logo" class="img-fluid rounded-circle shadow" style="max-width: 220px;">
                <a href="?view=gatos" class="btn btn-primary mt-4 w-100 py-2 fw-bold">Ver gatos disponibles</a>
            </div>
        </div>
    `;
}

// Gestión de Gatos (Público)
function cargarGatos() {
    const contenedor = document.getElementById('main-content');
    contenedor.innerHTML = `
        <h2 class="mb-4">Nuestros Felinos</h2>
        <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body row">
                <div class="col-md-6 mb-2">
                    <label class="form-label fw-bold">VHIF (Sida Felino)</label>
                    <select id="filtro-vhif" class="form-select" onchange="obtenerGatos()">
                        <option value="">Todos</option>
                        <option value="1">Positivo</option>
                        <option value="0">Negativo</option>
                    </select>
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label fw-bold">Género</label>
                    <select id="filtro-genero" class="form-select" onchange="obtenerGatos()">
                        <option value="">Todos</option>
                        <option value="macho">Macho</option>
                        <option value="hembra">Hembra</option>
                    </select>
                </div>
            </div>
        </div>
        <div id="lista-gatos" class="row">
            <div class="text-center py-5"><div class="spinner-border text-warning"></div></div>
        </div>
    `;
    obtenerGatos();
}

async function obtenerGatos() {
    const vhif = document.getElementById('filtro-vhif').value;
    const genero = document.getElementById('filtro-genero').value;
    let url = `${API_CATS}?action=list`;
    if (vhif !== "") url += `&vhif=${vhif}`;
    if (genero !== "") url += `&gender=${genero}`;

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            pintarGatos(resultado.data);
        } else {
            console.error("Error del servidor:", resultado.message);
            alert("Error del servidor: " + resultado.message);
            document.getElementById('lista-gatos').innerHTML = `<div class="alert alert-danger">Error: ${resultado.message}</div>`;
        }
    } catch (error) {
        console.error("Error al pedir los gatos:", error);
    }
}

function pintarGatos(gatos) {
    const contenedor = document.getElementById('lista-gatos');
    if (!gatos || gatos.length === 0) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-info">No hay gatitos con esos filtros ahora mismo.</div></div>`;
        return;
    }

    let html = '';
    gatos.forEach(gato => {
        let textoGenero = gato.sexo === 'macho' ? 'Macho' : 'Hembra';
        let etiquetaVhif = gato.vhif ? '<span class="badge bg-danger ms-2">VHIF+</span>' : '';
        let imagen = gato.imagen_principal || 'https://placehold.co/300x200/EEE/31343C?text=Gato';

        html += `
            <div class="col-md-4 mb-4">
                <div class="card cat-card h-100 border-0 shadow-sm">
                    <img src="${imagen}" class="card-img-top" alt="${gato.nombre}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${gato.nombre} ${etiquetaVhif}</h5>
                        <p class="card-text text-muted">
                            <strong>Género:</strong> ${textoGenero}<br>
                            <strong>Nacimiento:</strong> ${gato.fecha_nacimiento || 'Desconocido'}
                        </p>
                        <a href="?gato=${gato.id_gato}" class="btn btn-outline-primary w-100">Ver detalles</a>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}

// Vista de Detalles del Gato
async function verDetallesGato(id) {
    const contenedor = document.getElementById('main-content');
    contenedor.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;

    try {
        const respuesta = await fetch(`${API_CATS}?action=get&id=${id}`);
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            const gato = resultado.data;
            let textoGenero = gato.sexo === 'macho' ? 'Macho' : 'Hembra';
            let etiquetaVhif = gato.vhif ? '<span class="badge bg-danger">VHIF Positivo</span>' : '<span class="badge bg-success">VHIF Negativo</span>';
            let imagen = gato.imagen_principal || 'https://placehold.co/400x400/EEE/31343C?text=Gato';

            let botonesAccion = '';
            if (usuarioActual.role === 'guest') {
                botonesAccion = `<div class="alert alert-warning mt-4">Inicia sesión o regístrate para solicitar la adopción o acogida de este felino.</div>`;
            } else {
                botonesAccion = `
                    <div class="d-grid gap-2 d-md-flex mt-4">
                        <button class="btn btn-success me-md-2" onclick="alert('Funcionalidad de adoptar próximamente')">🐾 Solicitar Adopción</button>
                        <button class="btn btn-info text-white" onclick="alert('Funcionalidad de acoger próximamente')">🏠 Solicitar Acogida</button>
                    </div>
                `;
            }

            contenedor.innerHTML = `
                <a href="?view=gatos" class="btn btn-outline-secondary mb-4">← Volver al listado</a>
                <div class="card border-0 shadow-sm">
                    <div class="row g-0">
                        <div class="col-md-5">
                            <img src="${imagen}" class="img-fluid rounded-start h-100" alt="${gato.nombre}" style="object-fit: cover; min-height: 400px; max-height: 500px;">
                        </div>
                        <div class="col-md-7">
                            <div class="card-body p-4">
                                <h2 class="card-title fw-bold mb-3">${gato.nombre}</h2>
                                
                                <ul class="list-group list-group-flush mb-4">
                                    <li class="list-group-item px-0"><strong>Estado:</strong> <span class="badge bg-primary text-uppercase">${gato.estado}</span></li>
                                    <li class="list-group-item px-0"><strong>Sexo:</strong> ${textoGenero}</li>
                                    <li class="list-group-item px-0"><strong>Nacimiento:</strong> ${gato.fecha_nacimiento || 'Desconocido'}</li>
                                    <li class="list-group-item px-0"><strong>Condición:</strong> ${etiquetaVhif}</li>
                                </ul>

                                <h5 class="fw-bold">Sobre ${gato.nombre}:</h5>
                                <p class="card-text">${gato.descripcion || 'Sin descripción disponible.'}</p>
                                
                                <h5 class="fw-bold mt-3 text-danger">Notas Médicas:</h5>
                                <p class="card-text">${gato.notas_medicas || 'No hay notas médicas registradas.'}</p>
                                
                                ${botonesAccion}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            alert("Error al cargar los detalles: " + resultado.message);
            cargarGatos();
        }
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        alert("Error de conexión al obtener el gato.");
        cargarGatos();
    }
}

// Panel de Gestión (Privado)
async function cargarPanelGestion() {
    const contenedor = document.getElementById('main-content');
    contenedor.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Panel de Gestión</h2>
            <button class="btn btn-success fw-bold" data-bs-toggle="modal" data-bs-target="#modalGato">
                + Nuevo Felino
            </button>
        </div>
        <div class="table-responsive bg-white p-3 rounded shadow-sm">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Miniatura</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-gestion-gatos">
                    <tr><td colspan="4" class="text-center">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        const respuesta = await fetch(`${API_CATS}?action=list`);
        const resultado = await respuesta.json();
        const gatos = resultado.data;
        const tablaBody = document.getElementById('tabla-gestion-gatos');
        let html = '';

        gatos.forEach(gato => {
            html += `
                <tr>
                    <td><img src="${gato.imagen_principal || 'https://placehold.co/50'}" width="50" height="50" class="rounded" style="object-fit: cover;"></td>
                    <td><strong>${gato.nombre}</strong></td>
                    <td><span class="badge bg-secondary">${gato.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info text-white" onclick="alert('Editando...')">Editar</button>
                        ${usuarioActual.role === 'admin' ? `<button class="btn btn-sm btn-danger" onclick="eliminarGato(${gato.id_gato})">Eliminar</button>` : ''}
                    </td>
                </tr>
            `;
        });
        tablaBody.innerHTML = html;
    } catch (error) {
        console.error("Error en panel de gestión:", error);
    }
}

async function guardarGato(datos) {
    try {
        const respuesta = await fetch(`${API_CATS}?action=add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json();
        if (resultado.status === 201) {
            alert("¡Gatito añadido con éxito!");
            bootstrap.Modal.getInstance(document.getElementById('modalGato')).hide();
            cargarPanelGestion();
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

async function eliminarGato(id) {
    if (!confirm("¿Seguro que quieres eliminar este registro?")) return;
    try {
        const respuesta = await fetch(`${API_CATS}?action=delete&id=${id}`);
        const resultado = await respuesta.json();
        if (resultado.status === 200) {
            cargarPanelGestion();
        } else {
            alert("Error al eliminar");
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}
