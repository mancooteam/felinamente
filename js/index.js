document.addEventListener('DOMContentLoaded', () => {
    cargarGatosDestacados();
});

async function cargarGatosDestacados() {
    try {
        const respuesta = await fetch(`${API_CATS}?action=list`);
        const resultado = await respuesta.json();
        
        if (resultado.status === 200) {
            // Filtrar solo los disponibles y coger los 3 primeros para destacar
            const disponibles = resultado.data.filter(g => g.estado === 'disponible' || g.estado === 'acogida_urgente' || g.estado === 'en adopcion');
            const destacados = disponibles.slice(0, 3);
            
            // Si no hay disponibles, coge los 3 primeros que haya
            if (destacados.length === 0) {
                 pintarDestacados(resultado.data.slice(0, 3));
            } else {
                 pintarDestacados(destacados);
            }
        } else {
            document.getElementById('gatos-destacados').innerHTML = `<p class="text-danger text-center">No se pudieron cargar los gatos destacados.</p>`;
        }
    } catch (error) {
        console.error("Error al cargar destacados:", error);
    }
}

function pintarDestacados(gatos) {
    const contenedor = document.getElementById('gatos-destacados');
    if (!contenedor) return;

    if (!gatos || gatos.length === 0) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert text-center text-muted" style="background: transparent; border: 1px solid #eaeaea;">Pronto tendremos nuevos felinos.</div></div>`;
        return;
    }

    let html = '';
    gatos.forEach(gato => {
        let textoGenero = gato.sexo === 'macho' ? 'Macho' : 'Hembra';
        let etiquetaVhif = gato.vhif ? '<span class="badge bg-dark ms-2 fw-normal rounded-pill px-2 py-1" style="font-size: 0.7rem;">VHIF+</span>' : '';
        let imagen = gato.imagen_principal || 'https://placehold.co/400x300/fcfbf9/333333?text=Sin+imagen';

        html += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0" style="background: transparent;">
                    <img src="${imagen}" class="card-img-top rounded-0" alt="${gato.nombre}" style="height: 320px; object-fit: cover;">
                    <div class="card-body px-0 pt-4">
                        <div class="d-flex justify-content-between align-items-baseline mb-2">
                            <h4 class="card-title m-0" style="font-family: 'Georgia', serif; font-size: 1.5rem; color: #111;">${gato.nombre}</h4>
                            ${etiquetaVhif}
                        </div>
                        <p class="card-text text-muted mb-4" style="font-size: 0.95rem;">
                            ${textoGenero} · ${gato.fecha_nacimiento || 'Edad desconocida'}
                        </p>
                        <a href="gato.html?id=${gato.id_gato}" class="text-dark fw-medium text-decoration-none border-bottom border-dark pb-1">Conocer detalles</a>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}
