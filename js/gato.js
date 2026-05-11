document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion(); // Esperar a saber quién es el usuario
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        verDetallesGato(params.get('id'));
    } else {
        document.getElementById('cat-detail-container').innerHTML = `<div class="alert alert-danger">No se especificó ningún gato.</div>`;
    }
});

async function verDetallesGato(id) {
    const contenedor = document.getElementById('cat-detail-container');
    if (!contenedor) return;

    contenedor.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;

    try {
        const respuesta = await fetch(`${API_CATS}?action=get&id=${id}`);
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            const gato = resultado.data;
            let textoGenero = gato.sexo === 'macho' ? 'Macho' : 'Hembra';
            let etiquetaVhif = gato.vhif ? '<span class="badge-orange">VHIF Positivo</span>' : '<span class="badge-green">VHIF Negativo</span>';
            let imagen = gato.imagen_principal || 'https://placehold.co/600x600/fcfbf9/333333?text=Sin+imagen';

            let botonesAccion = '';
            if (gato.estado === 'reservado') {
                botonesAccion = `
                    <div class="alert mt-5 py-4 text-center" style="background: rgba(217, 108, 74, 0.1); border: 1px solid var(--color-orange); color: var(--color-orange);">
                        <h4 class="font-serif mb-2">¡Ya ha encontrado un hogar!</h4>
                        <p class="mb-0">Este felino ya ha sido adoptado y disfruta de su nueva familia.</p>
                    </div>
                `;
            } else if (usuarioActual.role === 'guest') {
                botonesAccion = `<div class="alert mt-5" style="background: transparent; border: 1px solid #eaeaea; color: #666;">Inicia sesión o regístrate para solicitar adopción o acogida.</div>`;
            } else {
                botonesAccion = `
                    <div class="d-flex gap-3 mt-5">
                        <button class="btn-minimal" id="btn-adopcion" data-id="${gato.id_gato}">Solicitar Adopción</button>
                        <button class="btn-outline-minimal" id="btn-acogida" data-id="${gato.id_gato}">Solicitar Acogida</button>
                    </div>
                `;
            }

            contenedor.innerHTML = `
                <div class="mb-4">
                    <a href="gatos.html" class="link-editorial">← Volver al listado</a>
                </div>
                <div class="card card-editorial mb-5">
                    <div class="row g-0 align-items-center">
                        <div class="col-md-6 mb-4 mb-md-0">
                            <img src="${imagen}" class="img-fluid" alt="${gato.nombre}" style="width: 100%; height: 500px; object-fit: cover; border-radius: 4px;">
                        </div>
                        <div class="col-md-6 ps-md-5">
                            <div class="card-body p-0">
                                <h1 class="font-serif mb-4" style="font-size: 3rem; letter-spacing: -1px;">${gato.nombre}</h1>
                                
                                <div class="d-flex flex-wrap gap-2 mb-4">
                                    <span class="badge-green text-uppercase">${gato.estado}</span>
                                    ${etiquetaVhif}
                                </div>
                                
                                <div class="mb-4" style="font-size: 1.05rem; color: #555;">
                                    <p class="mb-2"><strong>Sexo:</strong> ${textoGenero}</p>
                                    <p class="mb-0"><strong>Nacimiento:</strong> ${gato.fecha_nacimiento || 'Desconocido'}</p>
                                </div>

                                <div class="mb-4 pt-4 border-top" style="border-color: #eaeaea !important;">
                                    <h5 class="font-serif mb-3">Sobre ${gato.nombre}</h5>
                                    <p style="color: #666; line-height: 1.7;">${gato.descripcion || 'Sin descripción disponible.'}</p>
                                </div>
                                
                                <div class="mb-4">
                                    <h5 class="font-serif mb-2 text-accent">Notas Médicas</h5>
                                    <p style="color: #666; line-height: 1.7;">${gato.notas_medicas || 'No hay notas médicas registradas.'}</p>
                                </div>
                                
                                ${botonesAccion}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Asignar eventos después de inyectar el HTML
            const btnAdopcion = document.getElementById('btn-adopcion');
            const btnAcogida = document.getElementById('btn-acogida');
            
            if (btnAdopcion) {
                btnAdopcion.addEventListener('click', () => {
                    enviarSolicitud(btnAdopcion.dataset.id, 'adopcion');
                });
            }
            if (btnAcogida) {
                btnAcogida.addEventListener('click', () => {
                    enviarSolicitud(btnAcogida.dataset.id, 'acogida');
                });
            }

        } else {
            alert("Error al cargar los detalles: " + resultado.message);
            window.location.href = 'gatos.html';
        }
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        alert("Error de conexión al obtener el gato.");
        window.location.href = 'gatos.html';
    }
}

function enviarSolicitud(idGato, tipo) {
    window.location.href = `solicitud.html?id=${idGato}&tipo=${tipo}`;
}
