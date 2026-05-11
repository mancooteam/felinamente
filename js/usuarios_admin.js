document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
    if (usuarioActual.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    cargarUsuarios();

    const formEdit = document.getElementById('formEditarUsuario');
    if (formEdit) {
        formEdit.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formEdit);
            const data = Object.fromEntries(formData.entries());

            try {
                const respuesta = await fetch('api/auth.php?action=update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const resultado = await respuesta.json();
                if (resultado.status === 200) {
                    alert("Usuario actualizado correctamente.");
                    bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
                    cargarUsuarios();
                } else {
                    alert("Error: " + resultado.message);
                }
            } catch (error) {
                console.error("Error al actualizar usuario:", error);
            }
        });
    }
});

async function cargarUsuarios() {
    const tabla = document.getElementById('tabla-usuarios');
    try {
        const respuesta = await fetch('api/auth.php?action=list');
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            pintarUsuarios(resultado.data);
        }
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

function pintarUsuarios(usuarios) {
    const tabla = document.getElementById('tabla-usuarios');
    let html = '';
    
    usuarios.forEach(u => {
        html += `
            <tr>
                <td class="px-4">
                    <div class="fw-bold">${u.nombre_usuario}</div>
                    <div class="small text-muted">${u.telefono || 'Sin teléfono'}</div>
                </td>
                <td>${u.correo}</td>
                <td>
                    <span class="badge rounded-pill px-3 py-2 ${getBadgeClass(u.rol)}">
                        ${u.rol}
                    </span>
                </td>
                <td class="px-4 text-end">
                    <button class="btn btn-sm btn-outline-minimal btn-editar-user" 
                        data-id="${u.id_usuario}" 
                        data-name="${u.nombre_usuario}" 
                        data-role="${u.rol}">
                        Configurar
                    </button>
                </td>
            </tr>
        `;
    });
    tabla.innerHTML = html;

    // Delegación de eventos
    tabla.removeEventListener('click', manejarClickTabla);
    tabla.addEventListener('click', manejarClickTabla);
}

function getBadgeClass(rol) {
    switch (rol) {
        case 'admin': return 'bg-dark text-white';
        case 'employee': return 'bg-accent text-white';
        case 'volunteer': return 'bg-success text-white';
        default: return 'bg-light text-dark border';
    }
}

function manejarClickTabla(e) {
    if (e.target.classList.contains('btn-editar-user')) {
        const ds = e.target.dataset;
        document.getElementById('edit_user_id').value = ds.id;
        document.getElementById('edit_user_name').value = ds.name;
        document.getElementById('edit_user_role').value = ds.role;
        
        const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
        modal.show();
    }
}
