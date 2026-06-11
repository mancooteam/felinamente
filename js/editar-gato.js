document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        cargarDatosGato(id);
    } else {
        alert("No se especificó ningún gato para editar.");
        window.location.href = 'gestion.html';
    }

    const formEditar = document.getElementById('formEditarGato');
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('edit_id').value;
            const name = document.getElementById('edit_name').value;
            const status = document.getElementById('edit_status').value;
            const birth_date = document.getElementById('edit_birth').value;
            const gender = document.getElementById('edit_gender').value;
            const description = document.getElementById('edit_desc').value;
            const notas_medicas = document.getElementById('edit_notas').value;
            const vhif_positive = document.getElementById('edit_vhif').checked ? 1 : 0;

            const image_file = document.getElementById('edit_img_file').files[0];
            const gallery_files = document.getElementById('edit_gallery_files').files;

            const formData = new FormData();
            formData.append('id', id);
            formData.append('name', name);
            formData.append('status', status);
            formData.append('birth_date', birth_date);
            formData.append('gender', gender);
            formData.append('description', description);
            formData.append('notas_medicas', notas_medicas);
            formData.append('vhif_positive', vhif_positive);

            if (image_file) {
                formData.append('image_file', image_file);
            }

            if (gallery_files && gallery_files.length > 0) {
                for (let i = 0; i < gallery_files.length; i++) {
                    formData.append('gallery_files[]', gallery_files[i]);
                }
            }

            await actualizarGato(formData);
        });
    }
});

async function cargarDatosGato(id) {
    document.getElementById('formEditarGato').classList.add('d-none');
    document.getElementById('loading-edit').classList.remove('d-none');

    try {
        const respuesta = await fetch(`${API_CATS}?action=get&id=${id}`);
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            const gato = resultado.data;
            document.getElementById('edit_id').value = gato.id_gato;
            document.getElementById('edit_name').value = gato.nombre;
            document.getElementById('edit_status').value = gato.estado;
            document.getElementById('edit_birth').value = gato.fecha_nacimiento;
            document.getElementById('edit_gender').value = gato.sexo;
            document.getElementById('edit_desc').value = gato.descripcion;
            document.getElementById('edit_notas').value = gato.notas_medicas || '';
            document.getElementById('edit_vhif').checked = gato.vhif == 1;

            if (usuarioActual.role === 'employee') {
                document.getElementById('edit_name').disabled = true;
                document.getElementById('edit_birth').disabled = true;
                document.getElementById('edit_gender').disabled = true;
                document.getElementById('edit_desc').disabled = true;
                document.getElementById('edit_img').disabled = true;
                document.getElementById('edit_vhif').disabled = true;

                const helpText = document.createElement('div');
                helpText.className = 'alert alert-info mt-3 small';
                helpText.innerText = 'Como empleado, solo tienes permisos para actualizar el estado del felino.';
                document.getElementById('formEditarGato').appendChild(helpText);
            }

            document.getElementById('formEditarGato').classList.remove('d-none');
            document.getElementById('loading-edit').classList.add('d-none');
        } else {
            alert("Error: " + resultado.message);
            window.location.href = 'gestion.html';
        }
    } catch (error) {
        console.error("Error al cargar gato:", error);
        alert("Error de conexión.");
        window.location.href = 'gestion.html';
    }
}

async function actualizarGato(formData) {
    try {
        const respuesta = await fetch(`${API_CATS}?action=update`, {
            method: 'POST',
            body: formData
        });
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            alert("Gato actualizado correctamente.");
            window.location.href = 'gestion.html';
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("Error de conexión al actualizar.");
    }
}
