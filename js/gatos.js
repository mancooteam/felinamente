document.addEventListener('DOMContentLoaded', () => {
    obtenerGatos();
});

async function obtenerGatos() {
    const filtroVhif = document.getElementById('filtro-vhif');
    const filtroGenero = document.getElementById('filtro-genero');
    
    let vhif = filtroVhif ? filtroVhif.value : "";
    let genero = filtroGenero ? filtroGenero.value : "";
    
    let url = `${API_CATS}?action=list`;
    if (vhif !== "") url += `&vhif=${vhif}`;
    if (genero !== "") url += `&gender=${genero}`;

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            pintarGatos(resultado.data);
        } else {
            console.error("Error del servidor:", resultado.message);
            alert("Error del servidor: " + resultado.message);
            document.getElementById('lista-gatos').innerHTML = `<div class="alert alert-danger">Error: ${resultado.message}</div>`;
        }
    } catch (error) {
        console.error("Error al pedir los gatos:", error);
    }
}

function pintarGatos(gatos) {
    const contenedor = document.getElementById('lista-gatos');
    if (!contenedor) return;

    if (!gatos || gatos.length === 0) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-info">No hay gatitos con esos filtros ahora mismo.</div></div>`;
        return;
    }

    let html = '';
    gatos.forEach(gato => {
        let textoGenero = gato.sexo === 'macho' ? 'Macho' : 'Hembra';
        let etiquetaVhif = gato.vhif ? '<span class="badge bg-danger ms-2">VHIF+</span>' : '';
        let imagen = gato.imagen_principal || 'https://placehold.co/300x200/EEE/31343C?text=Gato';

        html += `
            <div class="col-md-4 mb-4">
                <div class="card cat-card h-100 border-0 shadow-sm">
                    <img src="${imagen}" class="card-img-top" alt="${gato.nombre}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${gato.nombre} ${etiquetaVhif}</h5>
                        <p class="card-text text-muted">
                            <strong>Género:</strong> ${textoGenero}<br>
                            <strong>Nacimiento:</strong> ${gato.fecha_nacimiento || 'Desconocido'}
                        </p>
                        <a href="gato.html?id=${gato.id_gato}" class="btn btn-outline-primary w-100">Ver detalles</a>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}
