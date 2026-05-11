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
        contenedor.innerHTML = `<div class="col-12"><div class="alert text-center text-muted" style="background: transparent; border: 1px solid #eaeaea;">No hay felinos con esos filtros ahora mismo.</div></div>`;
        return;
    }

    let html = '';
    gatos.forEach(gato => {
        let textoGenero = gato.sexo === 'macho' ? 'Macho' : 'Hembra';
        let etiquetaVhif = gato.vhif ? '<span class="badge bg-dark ms-2 fw-normal rounded-pill px-2 py-1" style="font-size: 0.7rem;">VHIF+</span>' : '';
        let imagen = gato.imagen_principal || 'https://placehold.co/400x300/fcfbf9/333333?text=Sin+imagen';

        // Badge de estado sobre la imagen
        let badgeEstado = '';
        let claseImagen = '';
        if (gato.estado === 'reservado') {
            badgeEstado = '<div class="badge-overlay badge-adoptado">Adoptado</div>';
            claseImagen = 'img-grayscale';
        } else if (gato.estado === 'acogido') {
            badgeEstado = '<div class="badge-overlay badge-acogido">En Acogida</div>';
        }

        html += `
            <div class="col-md-4 mb-5">
                <div class="card h-100 border-0" style="background: transparent;">
                    <div class="card-img-container">
                        ${badgeEstado}
                        <img src="${imagen}" class="card-img-top rounded-0 ${claseImagen}" alt="${gato.nombre}" style="height: 320px; object-fit: cover;">
                    </div>
                    <div class="card-body px-0 pt-4">
                        <div class="d-flex justify-content-between align-items-baseline mb-2">
                            <h4 class="card-title m-0" style="font-family: 'Georgia', serif; font-size: 1.5rem; color: #111;">${gato.nombre}</h4>
                            ${etiquetaVhif}
                        </div>
                        <p class="card-text text-muted mb-4" style="font-size: 0.95rem;">
                            ${textoGenero} · ${gato.fecha_nacimiento || 'Edad desconocida'}
                        </p>
                        <a href="gato.html?id=${gato.id_gato}" class="text-dark fw-medium text-decoration-none border-bottom border-dark pb-1">
                            ${gato.estado === 'reservado' ? 'Ver su historia' : 'Conocer detalles'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}
