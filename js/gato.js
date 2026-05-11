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
            if (usuarioActual.role === 'guest') {
                botonesAccion = `<div class="alert mt-5" style="background: transparent; border: 1px solid #eaeaea; color: #666;">Inicia sesión o regístrate para solicitar adopción o acogida.</div>`;
            } else {
                botonesAccion = `
                    <div class="d-flex gap-3 mt-5">
                        <button class="btn-minimal" onclick="enviarSolicitud(${gato.id_gato}, 'adopcion')">Solicitar Adopción</button>
                        <button class="btn-outline-minimal" onclick="enviarSolicitud(${gato.id_gato}, 'acogida')">Solicitar Acogida</button>
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

async function enviarSolicitud(idGato, tipo) {
    const mensaje = prompt(`Por favor, cuéntanos brevemente por qué te gustaría ser ${tipo === 'adopcion' ? 'adoptante' : 'casa de acogida'} para este felino:`);
    
    if (mensaje === null) return; // User cancelled
    if (mensaje.trim() === '') {
        alert("El mensaje no puede estar vacío. Necesitamos conocer tus intenciones.");
        return;
    }

    try {
        const respuesta = await fetch('api/solicitudes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_gato: idGato,
                tipo: tipo,
                mensaje: mensaje
            })
        });
        const resultado = await respuesta.json();
        
        if (resultado.status === 201) {
            alert(`¡Solicitud de ${tipo} enviada con éxito! Nos pondremos en contacto contigo pronto.`);
        } else {
            alert("Error al enviar solicitud: " + resultado.message);
        }
    } catch (error) {
        console.error("Error al enviar solicitud:", error);
        alert("Error de conexión al enviar la solicitud.");
    }
}
