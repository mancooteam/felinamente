document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();

    const params = new URLSearchParams(window.location.search);
    const idGato = params.get('id');
    const tipo = params.get('tipo');

    if (!idGato || !tipo) {
        alert("Faltan parámetros para procesar la solicitud.");
        window.location.href = 'gatos.html';
        return;
    }

    if (usuarioActual.role === 'guest') {
        alert("Debes iniciar sesión para realizar una solicitud.");
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('solicitud_id_gato').value = idGato;
    document.getElementById('solicitud_tipo').value = tipo;

    const tituloPagina = document.getElementById('titulo-pagina-solicitud');
    let labelTipo = '';
    if (tipo === 'adopcion') labelTipo = 'Solicitud de Adopción';
    else if (tipo === 'acogida') labelTipo = 'Solicitud de Casa de Acogida';
    else if (tipo === 'visita') labelTipo = 'Solicitud de Visita Presencial';

    tituloPagina.innerText = labelTipo;
    document.title = labelTipo + " - Felinamente";

    cargarInfoGato(idGato, tipo);

    const formSolicitud = document.getElementById('formSolicitud');
    formSolicitud.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formSolicitud);
        const data = Object.fromEntries(formData.entries());

        const mensajeFinal = JSON.stringify({
            nombre: data.nombre,
            apellidos: data.apellidos,
            localidad: data.localidad,
            vivienda: data.vivienda,
            convivientes: data.convivientes,
            mascotas: data.mascotas,
            mensaje_libre: data.mensaje
        });

        try {
            const respuesta = await fetch('api/solicitudes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_gato: data.id_gato,
                    tipo: data.tipo,
                    mensaje: mensajeFinal
                })
            });
            const textoRespuesta = await respuesta.text();
            let resultado;

            try {
                resultado = JSON.parse(textoRespuesta);
            } catch (parseError) {
                console.error("La respuesta del servidor no es JSON:", textoRespuesta);
                throw new Error("El servidor devolvió un error inesperado.");
            }

            if (resultado.status === 201) {
                alert(`¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.`);
                window.location.href = 'gato.html?id=' + idGato;
            } else {
                alert("Error al enviar solicitud: " + resultado.message);
            }
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            alert("Hubo un error al procesar tu solicitud. Por favor, revisa la consola para más detalles.");
        }
    });
});

async function cargarInfoGato(id, tipo) {
    try {
        const respuesta = await fetch(`${API_CATS}?action=get&id=${id}`);
        const resultado = await respuesta.json();

        if (resultado.status === 200) {
            const gato = resultado.data;
            document.getElementById('cat-brief').classList.remove('d-none');
            document.getElementById('brief-img').src = gato.imagen_principal || 'https://placehold.co/80x80/fcfbf9/333333?text=Gato';
            document.getElementById('brief-name').innerText = gato.nombre;
            let msg = `Estás solicitando la ${tipo === 'adopcion' ? 'adopción' : (tipo === 'acogida' ? 'acogida' : 'visita')} de este felino.`;
            if (tipo === 'visita') {
                msg = `Estás solicitando conocer a ${gato.nombre} en persona. Tras la visita, se podrá iniciar el proceso de adopción o acogida.`;
            }
            document.getElementById('brief-text').innerText = msg;
        }
    } catch (error) {
        console.error("Error cargando info del gato:", error);
    }
}
