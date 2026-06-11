document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
    if (usuarioActual.role === 'guest') {
        window.location.href = 'index.html';
        return;
    }

    cargarDatosPerfil();

    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('edit_email').value;
            const telefono = document.getElementById('edit_phone').value;
            const residencia = document.getElementById('edit_residencia').value;

            const data = {
                email: email,
                telefono: telefono,
                residencia: residencia
            };

            try {
                const respuesta = await fetch('api/auth.php?action=update_profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const resultado = await respuesta.json();
                if (resultado.status === 200) {
                    alert("¡Perfil actualizado con éxito!");
                    location.reload();
                } else {
                    alert("Error: " + resultado.message);
                }
            } catch (error) {
                console.error("Error al actualizar perfil:", error);
            }
        });
    }
});

async function cargarDatosPerfil() {
    try {
        const respuesta = await fetch('api/auth.php?action=get_profile');
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            const user = resultado.data;
            document.getElementById('profile-username').innerText = user.nombre_usuario;
            document.getElementById('profile-initial').innerText = user.nombre_usuario[0].toUpperCase();
            document.getElementById('profile-role').innerText = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);

            document.getElementById('edit_email').value = user.correo || '';
            document.getElementById('edit_phone').value = user.telefono || '';
            document.getElementById('edit_residencia').value = user.residencia || '';
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
}
