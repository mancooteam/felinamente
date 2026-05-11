document.addEventListener('DOMContentLoaded', () => {
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
                <a href="gatos.html" class="btn btn-outline-secondary mb-4">← Volver al listado</a>
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
            window.location.href = 'gatos.html';
        }
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        alert("Error de conexión al obtener el gato.");
        window.location.href = 'gatos.html';
    }
}
