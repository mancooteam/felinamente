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
            const formData = new FormData(formEditar);
            // vhif_positive ya se envía como 'on' si está marcado, el backend lo manejará
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

            // Restricción de empleados: solo pueden tocar el estado
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
