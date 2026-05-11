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
    try {
        const respuesta = await fetch('api/auth.php?action=list');
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            const tabla = document.getElementById('tabla-usuarios');
            tabla.innerHTML = '';
            resultado.data.forEach(user => {
                tabla.innerHTML += `
                    <tr>
                        <td class="px-4">
                            <div class="fw-bold">${user.nombre_usuario}</div>
                            <div class="small text-muted">${user.residencia || 'Sin residencia'}</div>
                        </td>
                        <td>${user.correo}</td>
                        <td><span class="badge bg-light text-dark border">${user.rol.toUpperCase()}</span></td>
                        <td class="text-end px-4">
                            <button class="btn btn-sm btn-dark btn-editar" 
                                data-id="${user.id_usuario}" 
                                data-name="${user.nombre_usuario}" 
                                data-role="${user.rol}">Editar</button>
                            <button class="btn btn-sm btn-outline-danger btn-borrar" data-id="${user.id_usuario}">Borrar</button>
                        </td>
                    </tr>
                `;
            });

            // Re-asignar eventos
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const b = e.target;
                    document.getElementById('edit_user_id').value = b.dataset.id;
                    document.getElementById('edit_user_name').value = b.dataset.name;
                    document.getElementById('edit_user_role').value = b.dataset.role;
                    new bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
                });
            });

            document.querySelectorAll('.btn-borrar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm("¿Estás seguro de eliminar a este usuario? Esta acción es irreversible.")) {
                        const id = e.target.dataset.id;
                        await eliminarUsuario(id);
                    }
                });
            });
        }
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

async function eliminarUsuario(id) {
    try {
        const res = await fetch('api/auth.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: id })
        });
        const json = await res.json();
        if (json.status === 200) {
            alert("Usuario eliminado.");
            cargarUsuarios();
        } else {
            alert("Error: " + json.message);
        }
    } catch (e) { console.error(e); }
}

// Configurar el formulario de edición
const formEditUser = document.getElementById('formEditUser');
if (formEditUser) {
    formEditUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formEditUser);
        const data = Object.fromEntries(formData.entries());

        try {
            const respuesta = await fetch('api/auth.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const resultado = await respuesta.json();
            if (resultado.status === 200) {
                alert("Usuario actualizado.");
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
