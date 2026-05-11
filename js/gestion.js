document.addEventListener('DOMContentLoaded', () => {
    // Solo admins y empleados pueden ver esto, auth.js ya cargó usuarioActual
    setTimeout(() => {
        if (usuarioActual.role !== 'admin' && usuarioActual.role !== 'employee') {
            document.getElementById('gestion-content').innerHTML = `<div class="alert alert-danger">No tienes permisos para ver esta página.</div>`;
            return;
        }
        cargarPanelGestion();
    }, 500); // Pequeño retardo para asegurar que comprobarSesion() de auth.js terminó
});

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

// Configurar formulario del modal de gestión
document.addEventListener('DOMContentLoaded', () => {
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
});
