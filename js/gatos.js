document.addEventListener('DOMContentLoaded', () => {
    obtenerGatos();
});

async function obtenerGatos() {
    const filtroVhif = document.getElementById('filtro-vhif');
    const filtroGenero = document.getElementById('filtro-genero');
    const filtroEdad = document.getElementById('filtro-edad');
    const filtroOrden = document.getElementById('filtro-orden');
    
    let vhif = filtroVhif ? filtroVhif.value : "";
    let genero = filtroGenero ? filtroGenero.value : "";
    let edad = filtroEdad ? filtroEdad.value : "";
    let orden = filtroOrden ? filtroOrden.value : "recientes";
    
    let url = `${API_CATS}?action=list`;
    if (vhif !== "") url += `&vhif=${vhif}`;
    if (genero !== "") url += `&gender=${genero}`;
    if (edad !== "") url += `&age=${edad}`;
    if (orden !== "") url += `&order=${orden}`;

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
                <div class="card h-100 border-0 bg-white shadow-sm hover-card" style="transition: transform 0.3s ease, box-shadow 0.3s ease; border-radius: 12px; overflow: hidden;">
                    <div class="card-img-container" style="height: 280px;">
                        ${badgeEstado}
                        <img src="${imagen}" class="card-img-top ${claseImagen}" alt="${gato.nombre}" style="height: 100%; width: 100%; object-fit: cover; transition: transform 0.5s ease;">
                    </div>
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="card-title m-0 font-serif" style="font-size: 1.6rem; letter-spacing: -0.5px;">${gato.nombre}</h4>
                            ${etiquetaVhif}
                        </div>
                        <p class="text-muted small mb-4">
                            <span class="text-uppercase fw-bold" style="letter-spacing: 0.5px; font-size: 0.75rem;">${textoGenero}</span> 
                            <span class="mx-2 opacity-50">|</span> 
                            <span>${gato.fecha_nacimiento || 'Edad desconocida'}</span>
                        </p>
                        <p class="card-text text-muted line-clamp-2 mb-4" style="font-size: 0.9rem; height: 2.7rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${gato.descripcion || 'Sin descripción disponible.'}
                        </p>
                        <div class="pt-3 border-top d-flex justify-content-between align-items-center">
                            <a href="gato.html?id=${gato.id_gato}" class="link-editorial text-dark small" style="border-width: 2px;">
                                ${gato.estado === 'reservado' ? 'Ver su historia' : 'Conocer detalles'}
                            </a>
                            <span class="text-muted" style="font-size: 0.8rem;">
                                <i class="opacity-50">#${gato.id_gato}</i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}
