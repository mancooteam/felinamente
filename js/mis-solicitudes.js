document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
    if (usuarioActual.role === 'guest') {
        window.location.href = 'index.html';
        return;
    }
    cargarMisSolicitudes();

    const formEdit = document.getElementById('formEditarSolicitud');
    if (formEdit) {
        formEdit.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formEdit);
            const data = Object.fromEntries(formData.entries());

            const mensajeFinal = JSON.stringify({
                nombre: data.nombre,
                apellidos: data.apellidos,
                localidad: data.localidad,
                vivienda: data.vivienda,
                convivientes: data.convivientes,
                mascotas: data.mascotas,
                mensaje_libre: data.mensaje
            });

            try {
                const respuesta = await fetch('api/solicitudes.php?action=update_my_solicitud', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_solicitud: data.id_solicitud,
                        mensaje: mensajeFinal
                    })
                });
                const resultado = await respuesta.json();
                if (resultado.status === 200) {
                    alert(resultado.message);
                    bootstrap.Modal.getInstance(document.getElementById('modalEditarSolicitud')).hide();
                    cargarMisSolicitudes();
                } else {
                    alert("Error: " + resultado.message);
                }
            } catch (error) {
                console.error("Error al actualizar:", error);
            }
        });
    }
});

async function cargarMisSolicitudes() {
    const contenedor = document.getElementById('lista-mis-solicitudes');
    try {
        const respuesta = await fetch('api/solicitudes.php?action=my_list');
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            imprimirSolicitudes(resultado.data);
        }
    } catch (error) {
        console.error("Error al cargar tus solicitudes:", error);
    }
}

function imprimirSolicitudes(solicitudes) {
    const contenedor = document.getElementById('lista-mis-solicitudes');
    if (solicitudes.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center text-muted">Aún no has realizado ninguna solicitud.</div>';
        return;
    }

    let html = '';
    solicitudes.forEach(s => {
        const color = s.estado_solicitud === 'aprobada' ? 'success' : (s.estado_solicitud === 'rechazada' ? 'danger' : 'warning');

        html += `
            <div class="col-md-6 mb-4">
                <div class="card card-editorial border p-4" style="background: white;">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <span class="text-uppercase small fw-bold text-muted">${s.tipo_solicitud}</span>
                            <h3 class="font-serif mb-0">${s.gato_nombre}</h3>
                        </div>
                        <span class="badge bg-${color} text-white text-capitalize">${s.estado_solicitud}</span>
                    </div>
                    
                    <div class="mb-4">
                        ${s.estado_solicitud === 'aprobada' ?
                '<p class="small text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Esta solicitud ya ha sido procesada y no se puede editar.</p>' :
                `<button class="btn btn-sm btn-outline-secondary btn-abrir-editor" 
                                data-id="${s.id_solicitud}" 
                                data-comentarios="${btoa(s.comentarios_usu)}">
                                ${s.estado_solicitud === 'rechazada' ? 'Corregir y volver a enviar' : 'Editar solicitud'}
                            </button>`
            }
                    </div>
                    
                    <p class="text-muted small mb-0">Solicitud ID: #${s.id_solicitud}</p>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
    contenedor.addEventListener('click', manejarClickContenedor);
}

function manejarClickContenedor(e) {
    const target = e.target;
    if (target.classList.contains('btn-abrir-editor')) {
        abrirEditor(target.dataset.id, target.dataset.comentarios);
    }
}

function abrirEditor(id, base64Data) {
    const jsonStr = atob(base64Data);
    try {
        const data = JSON.parse(jsonStr);
        document.getElementById('edit_soli_id').value = id;
        document.getElementById('edit_soli_nombre').value = data.nombre;
        document.getElementById('edit_soli_apellidos').value = data.apellidos;
        document.getElementById('edit_soli_localidad').value = data.localidad;
        document.getElementById('edit_soli_vivienda').value = data.vivienda;
        document.getElementById('edit_soli_convivientes').value = data.convivientes;
        document.getElementById('edit_soli_mascotas').value = data.mascotas;
        document.getElementById('edit_soli_mensaje').value = data.mensaje_libre;

        const modal = new bootstrap.Modal(document.getElementById('modalEditarSolicitud'));
        modal.show();
    } catch (e) {
        alert("Esta solicitud es antigua y no se puede editar en este formato.");
    }
}
