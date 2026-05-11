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

// Inicia la aplicación mostrando el menú y la portada
function iniciarApp() {
    pintarMenu();
    cargarInicio();
}

// Configura los eventos de los formularios de login y registro
function configurarFormularios() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitar que se recargue la página
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

// Función para iniciar sesión
async function login(credenciales) {
    try {
        const respuesta = await fetch(`${API_AUTH}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credenciales)
        });
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            location.reload(); // Recargamos para aplicar cambios
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error en login:", error);
    }
}

// Función para registrar un usuario
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
            // Escondemos el modal usando Bootstrap de forma nativa
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if(modal) modal.hide();
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error en registro:", error);
    }
}

// Pinta los enlaces del menú dependiendo del rol del usuario
function pintarMenu() {
    const navLinks = document.getElementById('nav-links');
    const navAuth = document.getElementById('nav-auth');
    
    // Enlaces públicos
    let htmlLinks = `
        <a class="nav-link" href="#" onclick="cargarInicio()">Inicio</a>
        <a class="nav-link" href="#" onclick="cargarGatos()">Nuestros felinos</a>
    `;

    // Enlaces privados
    if (usuarioActual.role === 'admin' || usuarioActual.role === 'employee') {
        htmlLinks += `<a class="nav-link text-danger fw-bold" href="#">Gestión</a>`;
    } else if (usuarioActual.role === 'volunteer') {
        htmlLinks += `<a class="nav-link text-success" href="#">Mis Acogidas</a>`;
    }

    navLinks.innerHTML = htmlLinks;

    // Botones de login/registro o cerrar sesión
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

// Función para cerrar sesión
async function cerrarSesion() {
    await fetch(`${API_AUTH}?action=logout`);
    location.reload();
}

// Carga la página de inicio (con el carrusel)
function cargarInicio() {
    const contenedor = document.getElementById('main-content');
    contenedor.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <h2>Bienvenidos a Felinamente</h2>
                <p>Nuestra misión es facilitar la visibilidad de los gatos disponibles para adopción.</p>
                <div id="carruselGatos" class="carousel slide" data-bs-ride="carousel">
                  <div class="carousel-inner rounded">
                    <div class="carousel-item active">
                      <img src="img/slider_1.png" class="d-block w-100" alt="Gato 1" style="height: 300px; object-fit: cover;">
                    </div>
                    <div class="carousel-item">
                      <img src="img/slider_2.png" class="d-block w-100" alt="Gato 2" style="height: 300px; object-fit: cover;">
                    </div>
                  </div>
                </div>
            </div>
            <div class="col-md-4 text-center mt-4">
                <img src="img/logo.png" alt="Logo" class="img-fluid rounded-circle" style="max-width: 200px;">
                <button class="btn btn-primary mt-3 w-100" onclick="cargarGatos()">Ver gatos disponibles</button>
            </div>
        </div>
    `;
}

// Muestra la lista de gatos y los filtros
function cargarGatos() {
    const contenedor = document.getElementById('main-content');
    contenedor.innerHTML = `
        <h2 class="mb-4">Nuestros Felinos</h2>
        
        <!-- Formulario de filtros -->
        <div class="card mb-4">
            <div class="card-body row">
                <div class="col-md-4">
                    <label>Filtro VHIF (Sida Felino)</label>
                    <select id="filtro-vhif" class="form-select" onchange="obtenerGatos()">
                        <option value="">Todos</option>
                        <option value="1">Positivo</option>
                        <option value="0">Negativo</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label>Filtro Género</label>
                    <select id="filtro-genero" class="form-select" onchange="obtenerGatos()">
                        <option value="">Todos</option>
                        <option value="male">Macho</option>
                        <option value="female">Hembra</option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- Aquí se cargarán los gatos -->
        <div id="lista-gatos" class="row">
            <div class="text-center"><div class="spinner-border text-primary"></div></div>
        </div>
    `;
    obtenerGatos();
}

// Hace la petición a PHP para obtener los gatos
async function obtenerGatos() {
    const vhif = document.getElementById('filtro-vhif').value;
    const genero = document.getElementById('filtro-genero').value;
    
    // Construimos la URL con los parámetros
    let url = `${API_CATS}?action=list`;
    if (vhif !== "") url += `&vhif=${vhif}`;
    if (genero !== "") url += `&gender=${genero}`;

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();
        pintarGatos(resultado.data);
    } catch (error) {
        console.error("Error al pedir los gatos:", error);
    }
}

// Dibuja las tarjetas de los gatos en el HTML
function pintarGatos(gatos) {
    const contenedor = document.getElementById('lista-gatos');
    
    if (!gatos || gatos.length === 0) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-warning">No hay gatos con estos filtros.</div></div>`;
        return;
    }

    let html = '';
    // Recorremos el array de gatos y creamos el HTML
    gatos.forEach(gato => {
        let textoGenero = gato.gender === 'male' ? 'Macho' : 'Hembra';
        let etiquetaVhif = gato.vhif_positive ? '<span class="badge bg-danger">VHIF+</span>' : '';
        let imagen = gato.image_url || 'https://placehold.co/300x200/EEE/31343C?text=Gato';

        html += `
            <div class="col-md-4 mb-4">
                <div class="card cat-card h-100">
                    <img src="${imagen}" class="card-img-top" alt="${gato.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${gato.name} ${etiquetaVhif}</h5>
                        <p class="card-text">
                            <strong>Edad:</strong> ${gato.age} años<br>
                            <strong>Género:</strong> ${textoGenero}<br>
                            <strong>Color/Raza:</strong> ${gato.breed_color || 'Común'}
                        </p>
                        <button class="btn btn-outline-primary w-100" onclick="verDetallesGato(${gato.id})">Más información</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
}

// Muestra una alerta (se implementará después)
function verDetallesGato(id) {
    alert("Funcionalidad en desarrollo. Gato ID: " + id);
}

