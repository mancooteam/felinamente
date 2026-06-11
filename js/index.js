document.addEventListener('DOMContentLoaded', async () => {
    cargarAdoptadosHome();
    cargarDestacadosHome();
});

async function cargarAdoptadosHome() {
    const contenedor = document.getElementById('lista-adoptados-home');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('api/cats.php?action=list&status_filter=reservado');
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            const adoptados = resultado.data.slice(0, 3);
            if (adoptados.length === 0) {
                contenedor.innerHTML = '<p class="text-center text-muted">Aún no hay historias registradas, ¡pero pronto las habrá!</p>';
                return;
            }

            let html = '';
            adoptados.forEach(gato => {
                let fechaRaw = gato.fecha_estado || gato.fecha_ingreso;
                let fechaObj;
                if (typeof fechaRaw === 'number' || !isNaN(Number(fechaRaw))) {
                    const val = Number(fechaRaw);
                    fechaObj = new Date(val < 10000000000 ? val * 1000 : val);
                } else {
                    fechaObj = new Date(String(fechaRaw).replace(' ', 'T'));
                }

                let fechaTexto = "recientemente";
                if (fechaObj && !isNaN(fechaObj.getTime())) {
                    fechaTexto = fechaObj.toLocaleDateString('es-ES', {
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'Europe/Madrid'
                    });
                }

                html += `
                    <div class="col-md-4 mb-4">
                        <div class="text-center">
                            <div class="mb-3 position-relative d-inline-block">
                                <img src="${gato.imagen_principal}" class="rounded-circle shadow-sm" style="width: 180px; height: 180px; object-fit: cover; border: 5px solid white;">
                                <div class="position-absolute bottom-0 end-0 bg-accent text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px; transform: translate(10px, 10px);">
                                    ♥
                                </div>
                            </div>
                            <h4 class="font-serif mb-1">${gato.nombre}</h4>
                            <p class="text-uppercase small text-muted fw-bold" style="letter-spacing: 1px;">Adoptado en ${fechaTexto}</p>
                        </div>
                    </div>
                `;
            });
            contenedor.innerHTML = html;
        }
    } catch (error) {
        console.error("Error cargando adoptados home:", error);
        contenedor.innerHTML = '';
    }
}

async function cargarDestacadosHome() {
    const contenedor = document.getElementById('gatos-destacados');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('api/cats.php?action=list');
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            const destacados = resultado.data.filter(g => g.estado === 'disponible').slice(0, 3);
            let html = '';
            destacados.forEach(gato => {
                html += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 border-0 bg-white shadow-sm hover-card" style="transition: transform 0.3s ease, box-shadow 0.3s ease; border-radius: 12px; overflow: hidden;">
                            <img src="${gato.imagen_principal}" class="card-img-top" style="height: 300px; object-fit: cover;">
                            <div class="card-body p-4">
                                <h4 class="font-serif mb-2" style="font-size: 1.5rem; letter-spacing: -0.5px;">${gato.nombre}</h4>
                                <p class="text-muted small line-clamp-2 mb-3" style="font-size: 0.9rem; height: 2.7rem;">${gato.descripcion || ''}</p>
                                <div class="pt-2">
                                    <a href="gato.html?id=${gato.id_gato}" class="link-editorial fw-bold">Conocer a ${gato.nombre}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            contenedor.innerHTML = html;
        }
    } catch (error) {
        console.error("Error cargando destacados home:", error);
    }
}
