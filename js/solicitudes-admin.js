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
            imprimirSolicitudes(resultado.data);
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
    }
}

function imprimirSolicitudes(solicitudes) {
    const tablaPendientes = document.getElementById('tabla-solicitudes');
    const tablaHistorial = document.getElementById('tabla-historial');
    if (!tablaPendientes || !tablaHistorial) return;

    const pendientes = solicitudes.filter(s => s.estado_solicitud === 'pendiente');
    const procesadas = solicitudes.filter(s => s.estado_solicitud !== 'pendiente');

    if (pendientes.length === 0) {
        tablaPendientes.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted small">No hay solicitudes pendientes.</td></tr>';
    } else {
        let htmlP = '';
        pendientes.forEach(s => {
            htmlP += `
                <tr>
                    <td class="fw-bold">${s.gato_nombre}</td>
                    <td>${s.nombre_usuario}</td>
                    <td class="text-capitalize small">${s.tipo_solicitud}</td>
                    <td><span class="badge bg-warning text-white">${s.estado_solicitud}</span></td>
                    <td>
                        <button class="btn btn-sm btn-link text-dark btn-ver-detalle" data-id="${s.id_solicitud}" data-comentarios='${btoa(s.comentarios_usu)}'>Ver Detalles</button>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-success btn-aprobar" data-id="${s.id_solicitud}">Aprobar</button>
                        <button class="btn btn-sm btn-outline-danger ms-1 btn-rechazar" data-id="${s.id_solicitud}">Rechazar</button>
                    </td>
                </tr>
            `;
        });
        tablaPendientes.innerHTML = htmlP;
    }

    if (procesadas.length === 0) {
        tablaHistorial.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted small">El historial está vacío.</td></tr>';
    } else {
        let htmlH = '';
        procesadas.forEach(s => {
            const color = s.estado_solicitud === 'aprobada' ? 'success' : 'danger';
            htmlH += `
                <tr>
                    <td>${s.gato_nombre}</td>
                    <td class="small">${s.nombre_usuario}</td>
                    <td class="text-capitalize small">${s.tipo_solicitud}</td>
                    <td><span class="badge bg-${color} text-white">${s.estado_solicitud}</span></td>
                    <td class="small text-muted">${formatFecha(s.fecha_creacion)}</td>
                    <td>
                        <button class="btn btn-sm btn-link text-muted btn-ver-detalle" data-id="${s.id_solicitud}" data-comentarios='${btoa(s.comentarios_usu)}'>Ver Datos</button>
                    </td>
                </tr>
            `;
        });
        tablaHistorial.innerHTML = htmlH;
    }
    [tablaPendientes, tablaHistorial].forEach(t => {
        t.removeEventListener('click', manejarClickTabla);
        t.addEventListener('click', manejarClickTabla);
    });
}

function manejarClickTabla(e) {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains('btn-ver-detalle')) {
        verDetalle(id, target.dataset.comentarios);
    } else if (target.classList.contains('btn-aprobar')) {
        cambiarEstado(id, 'aprobada');
    } else if (target.classList.contains('btn-rechazar')) {
        cambiarEstado(id, 'rechazada');
    }
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
    }

    document.getElementById('detalle-solicitud-body').innerHTML = html;
    const ventanaModal = document.getElementById('modalDetalleSolicitud');
    const modal = bootstrap.Modal.getOrCreateInstance(ventanaModal);
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
