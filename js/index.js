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
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-info text-center">Pronto tendremos nuevos gatitos.</div></div>`;
        return;
    }

    let html = '';
    gatos.forEach(gato => {
        let textoGenero = gato.sexo === 'macho' ? 'Macho' : 'Hembra';
        let etiquetaVhif = gato.vhif ? '<span class="badge bg-danger ms-2">VHIF+</span>' : '';
        let imagen = gato.imagen_principal || 'https://placehold.co/300x200/EEE/31343C?text=Gato';

        html += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 shadow-sm hover-shadow transition-all" style="border-radius: 15px; overflow: hidden;">
                    <img src="${imagen}" class="card-img-top" alt="${gato.nombre}" style="height: 250px; object-fit: cover;">
                    <div class="card-body text-center p-4">
                        <h4 class="card-title fw-bold mb-3">${gato.nombre} ${etiquetaVhif}</h4>
                        <p class="card-text text-muted mb-3">
                            <strong>Nacimiento:</strong> ${gato.fecha_nacimiento || 'Desconocido'}<br>
                            <strong>Sexo:</strong> ${textoGenero}
                        </p>
                        <a href="gato.html?id=${gato.id_gato}" class="btn btn-primary w-100 fw-bold rounded-pill">Conocer a ${gato.nombre}</a>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}
