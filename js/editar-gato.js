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
            const data = Object.fromEntries(formData.entries());
            data.vhif_positive = formData.get('vhif_positive') ? 1 : 0;
            
            await actualizarGato(data);
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
            document.getElementById('edit_img').value = gato.imagen_principal;
            document.getElementById('edit_vhif').checked = gato.vhif == 1;

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

async function actualizarGato(datos) {
    try {
        const respuesta = await fetch(`${API_CATS}?action=update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
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
