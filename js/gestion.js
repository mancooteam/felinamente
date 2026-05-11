document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion(); // Garantiza que tenemos el rol antes de pintar
    if (usuarioActual.role !== 'admin' && usuarioActual.role !== 'employee') {
        document.getElementById('gestion-content').innerHTML = `<div class="alert alert-danger">No tienes permisos para ver esta página.</div>`;
        return;
    }
    cargarPanelGestion();
    cargarEstadisticas();
});

async function cargarEstadisticas() {
    try {
        const respuesta = await fetch('api/solicitudes.php?action=pending_count');
        const resultado = await respuesta.json();
        if (resultado.status === 200) {
            document.getElementById('pending-requests-count').innerText = resultado.data.count;
        }
    } catch (error) {
        console.error("Error cargando estadísticas:", error);
    }
}

async function cargarPanelGestion() {
    const tablaBody = document.getElementById('tabla-gestion-gatos');
    if (!tablaBody) return;

    try {
        const respuesta = await fetch(`${API_CATS}?action=list`);
        const resultado = await respuesta.json();
        const gatos = resultado.data;
        let html = '';

        gatos.forEach(gato => {
            html += `
                <tr>
                    <td><img src="${gato.imagen_principal || 'https://placehold.co/50'}" width="50" height="50" class="rounded" style="object-fit: cover;"></td>
                    <td><strong>${gato.nombre}</strong></td>
                    <td><span class="badge bg-secondary">${gato.estado}</span></td>
                    <td>
                        <a href="editar-gato.html?id=${gato.id_gato}" class="btn btn-sm btn-info text-white">Editar</a>
                        ${usuarioActual.role === 'admin' ? `<button class="btn btn-sm btn-danger btn-eliminar" data-id="${gato.id_gato}">Eliminar</button>` : ''}
                    </td>
                </tr>
            `;
        });
        tablaBody.innerHTML = html;

        // Delegación de eventos para eliminar
        tablaBody.removeEventListener('click', manejarClickTabla);
        tablaBody.addEventListener('click', manejarClickTabla);
    } catch (error) {
        console.error("Error en panel de gestión:", error);
    }
}

function manejarClickTabla(e) {
    if (e.target.classList.contains('btn-eliminar')) {
        eliminarGato(e.target.dataset.id);
    }
}

async function guardarGato(formData) {
    try {
        const respuesta = await fetch(`${API_CATS}?action=add`, {
            method: 'POST',
            body: formData // Fetch sets the correct multipart boundary automatically
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

// Configurar formulario del modal de gestión
document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
    const formGato = document.getElementById('formGato');
    if (formGato) {
        formGato.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formGato);
            // vhif is a checkbox, we append it manually as 1 or 0
            const vhif = formGato.querySelector('#vhif_check').checked ? 1 : 0;
            formData.set('vhif_positive', vhif);
            
            await guardarGato(formData);
        });
    }
});
