document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
    if (usuarioActual.role !== 'admin' && usuarioActual.role !== 'employee') {
        document.getElementById('admin-solicitudes-content').innerHTML = `<div class="alert alert-danger">No tienes permisos para ver esta página.</div>`;
        return;
    }
    cargarSolicitudes();
});

async function cargarSolicitudes() {
    try {
        const respuesta = await fetch('api/solicitudes.php?action=list');
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            pintarSolicitudes(resultado.data);
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
    }
}

function pintarSolicitudes(solicitudes) {
    const tabla = document.getElementById('tabla-solicitudes');
    if (!tabla) return;

    if (solicitudes.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay solicitudes registradas aún.</td></tr>';
        return;
    }

    let html = '';
    solicitudes.forEach(s => {
        const colorEstado = s.estado_solicitud === 'aprobada' ? 'success' : (s.estado_solicitud === 'rechazada' ? 'danger' : 'warning');
        
        html += `
            <tr>
                <td class="fw-bold">${s.gato_nombre}</td>
                <td>${s.nombre_usuario}</td>
                <td class="text-capitalize">${s.tipo_solicitud}</td>
                <td><span class="badge bg-${colorEstado} text-white">${s.estado_solicitud}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="verDetalle(${s.id_solicitud}, '${btoa(s.comentarios_usu)}')">Ver Datos</button>
                </td>
                <td>
                    ${s.estado_solicitud === 'pendiente' ? `
                        <button class="btn btn-sm btn-success" onclick="cambiarEstado(${s.id_solicitud}, 'aprobada')">Aprobar</button>
                        <button class="btn btn-sm btn-danger ms-1" onclick="cambiarEstado(${s.id_solicitud}, 'rechazada')">Rechazar</button>
                    ` : '<span class="text-muted small">Sin acciones</span>'}
                </td>
            </tr>
        `;
    });
    tabla.innerHTML = html;
}

function verDetalle(id, base64Data) {
    const jsonStr = atob(base64Data);
    let html = '';
    
    try {
        const data = JSON.parse(jsonStr);
        html = `
            <p><strong>Nombre completo:</strong> ${data.nombre} ${data.apellidos}</p>
            <p><strong>Localidad:</strong> ${data.localidad}</p>
            <p><strong>Vivienda:</strong> ${data.vivienda}</p>
            <p><strong>Convivientes:</strong> ${data.convivientes}</p>
            <p><strong>Mascotas:</strong> ${data.mascotas}</p>
            <hr>
            <p><strong>Mensaje del solicitante:</strong></p>
            <p class="text-muted italic">"${data.mensaje_libre}"</p>
        `;
    } catch (e) {
        // Por si acaso no es JSON (solicitudes antiguas)
        html = `<p><strong>Comentarios:</strong></p><p>${jsonStr}</p>`;
    }

    document.getElementById('detalle-solicitud-body').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleSolicitud'));
    modal.show();
}

async function cambiarEstado(id, nuevoEstado) {
    if (!confirm(`¿Estás seguro de que quieres marcar esta solicitud como ${nuevoEstado}?`)) return;

    try {
        const respuesta = await fetch('api/solicitudes.php?action=update_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_solicitud: id,
                estado: nuevoEstado
            })
        });
        const resultado = await respuesta.json();
        if (resultado.status === 200) {
            cargarSolicitudes();
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error al actualizar estado:", error);
    }
}
