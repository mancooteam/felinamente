# Guía Técnica de Funcionamiento — Felinamente

Esta guía explica detalladamente la arquitectura del proyecto, cómo se comunican las distintas partes del software (frontend y backend) y la función exacta de cada archivo y subrutina del sistema. Está pensada para servir como material de estudio y preparación de la defensa del proyecto ante el tribunal.

---

## 1. Arquitectura y Flujo de Comunicación

El proyecto **Felinamente** está estructurado bajo un patrón de **arquitectura desacoplada**:
* **Frontend (Cliente):** Formado por páginas HTML estáticas, estilos CSS y lógica de control escrita en Vanilla JavaScript (ES6). Corre directamente en el navegador del usuario.
* **Backend (Servidor - API REST):** Formado por scripts PHP independientes. No renderizan HTML; su única responsabilidad es gestionar la persistencia, procesar reglas de negocio y devolver respuestas en formato estructurado **JSON**.
* **Base de Datos:** Motor relacional **MySQL** que persiste la información.

### Esquema del Flujo de Comunicación
```text
[Cliente: Navegador]                     [Servidor: PHP API]                 [Base de Datos: MySQL]
    │                                         │                                        │
    │  1. Evento (ej: Clic en Adoptar)        │                                        │
    ├────────────────────────────────────────>│                                        │
    │  2. Fetch POST /api/solicitudes.php     │                                        │
    │     Envía JSON {id_gato, tipo}          │                                        │
    │                                         │  3. Lógica de Negocio (Visita previa)  │
    │                                         ├───────────────────────────────────────>│
    │                                         │  4. Ejecuta SELECT / INSERT SQL        │
    │                                         │<───────────────────────────────────────┤
    │                                         │                                        │
    │  5. Envía JSON {status: 201, message}   │                                        │
    │<────────────────────────────────────────┤                                        │
    │                                         │                                        │
    │  6. Procesa Respuesta (JS)              │                                        │
    │     Modifica el DOM (HTML) en caliente  │                                        │
    ▼                                         ▼                                        ▼
```

### 1.1 El ciclo Petición/Respuesta (Request/Response)
1. **Petición HTTP (Fetch):** El frontend utiliza la función `fetch()` de JavaScript para realizar peticiones asíncronas hacia el backend. Para operaciones de lectura se utiliza `GET` (pasando parámetros en la URL) y para inserciones/modificaciones se utiliza `POST` (pasando datos en formato JSON en el cuerpo de la petición).
2. **Procesamiento de datos en el servidor:** El backend recibe las peticiones. Si los datos vienen como JSON en el cuerpo del `POST`, la API los lee empleando la corriente de entrada `php://input` y los decodifica en un array asociativo de PHP.
3. **Respuesta JSON unificada:** El servidor procesa la petición y siempre responde con una cabecera de tipo `Content-Type: application/json` y un cuerpo estructurado. El formato estándar de respuesta es:
   ```json
   {
     "status": 200,      // Código de estado HTTP explicativo (200 OK, 201 Created, 400 Bad Request, etc.)
     "message": "Mensaje informativo para el usuario",
     "data": []          // Información devuelta (opcional: lista de gatos, datos de usuario, etc.)
   }
   ```

### 1.2 Mecanismo de Sesiones y Roles
La autenticación se gestiona mediante el módulo nativo de **Sesiones de PHP** (`session_start()`):
* Al hacer login correcto, el servidor crea una sesión en el servidor y envía una cookie identificadora temporal (`PHPSESSID`) al navegador del usuario. El navegador adjunta automáticamente esta cookie en cada petición subsiguiente.
* En el backend, las variables globales `$_SESSION['user_id']`, `$_SESSION['username']` y `$_SESSION['role']` se utilizan para verificar si el usuario está autenticado y qué permisos tiene (`admin`, `employee`, `volunteer`, `user`).

---

## 2. Análisis del Backend (Directorios y Funciones)

El backend reside íntegramente en la carpeta `/api/`. Todos los endpoints de la API empiezan importando configuraciones de seguridad y helpers comunes.

### 2.1 [api/db.php](file:///c:/Users/karol/Desktop/entrega/felinamente/api/db.php)
Este archivo gestiona la conexión a la base de datos MySQL remota de Aiven utilizando **PDO (PHP Data Objects)**.
* **`getDBConnection()`**:
  * **Qué hace**: Carga las variables de entorno de configuración (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`).
  * **Manejo del Certificado SSL de Aiven**: Lee el certificado desde la variable de entorno `MYSQL_ATTR_SSL_CA`, genera un archivo temporal en disco mediante `tempnam()` y `file_put_contents()`, y lo pasa en la configuración de PDO (`PDO::MYSQL_ATTR_SSL_CA`) para establecer un enlace cifrado obligatorio con la base de datos remota.
  * **Retorno**: Instancia del objeto de conexión PDO.

### 2.2 [api/utils.php](file:///c:/Users/karol/Desktop/entrega/felinamente/api/utils.php)
Contiene funciones de utilidad compartidas por múltiples controladores.
* **`session_start()`**: Se ejecuta al principio del archivo para inicializar el lector de sesiones en cada petición.
* **`sendResponse($status, $message, $data = null)`**:
  * **Parámetros**: Código de estado HTTP (`int`), mensaje descriptivo (`string`), información opcional (`array/object`).
  * **Qué hace**: Establece el código de respuesta HTTP (`http_response_code`), configura la cabecera `Content-Type: application/json`, e imprime el JSON estructurado final, finalizando el script (`exit`).
* **`getJsonInput()`**:
  * **Qué hace**: Lee la entrada en crudo del servidor (`file_get_contents('php://input')`) y la procesa con `json_decode()` para transformarla en un array nativo de PHP. Se usa para procesar peticiones JSON POST desde JavaScript.

### 2.3 [api/auth.php](file:///c:/Users/karol/Desktop/entrega/felinamente/api/auth.php)
Es el controlador encargado de la seguridad y gestión de perfiles de usuario. Recibe el parámetro `$action = $_GET['action']` para enrutar el comportamiento:
* **`action = register`**: Registra un nuevo adoptante general. Encripta la contraseña usando `password_hash($password, PASSWORD_BCRYPT)`.
* **`action = login`**: Compara la contraseña enviada con el hash de la BD usando `password_verify()`. Si coincide, guarda los datos del usuario en la sesión (`$_SESSION`) y devuelve su rol al cliente.
* **`action = logout`**: Ejecuta `session_destroy()` para borrar las credenciales de la sesión activa.
* **`action = status`**: Comprueba si el usuario tiene una sesión de servidor activa y devuelve su información de identidad y rol. Evita tener que guardar credenciales en el almacenamiento local del navegador (lo cual es inseguro).
* **`action = list`**: (Solo para administradores) Devuelve todos los usuarios del sistema.
* **`action = update`**: (Solo para administradores) Modifica los datos y roles de cualquier usuario.
* **`action = delete`**: (Solo para administradores) Borra un usuario del sistema.
* **`action = get_profile`** / **`update_profile`**: Lectura y edición de los datos de contacto y contraseña del usuario logueado en su área privada.
* **`action = get_notifications`** / **`read_notifications`**: Obtiene las alertas del usuario (ej: "Tu solicitud ha sido aprobada") y permite marcarlas como leídas.

### 2.4 [api/cats.php](file:///c:/Users/karol/Desktop/entrega/felinamente/api/cats.php)
Controlador encargado de la gestión de felinos y sus correspondientes fotografías de galería.
* **`action = list`**: Devuelve los gatos filtrados según parámetros `GET`:
    * Parámetro `status_filter` (estado: disponible, acogido, reservado, enfermo).
    * Parámetro `gender` (macho, hembra, desconocido).
    * Parámetro `vhif` (positivo/negativo).
    * Parámetro `age` (cachorro, joven, adulto, senior), calculada dinámicamente usando la diferencia de tiempo entre la fecha de nacimiento y la fecha actual en SQL (`TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE())`).
* **`action = get`**: Obtiene los datos detallados de un gato específico por su ID y realiza un `SELECT` en la tabla `gato_fotos` para incorporar su array de imágenes secundarias de la galería.
* **`action = add`**: (Solo administradores) Añade un gato procesando campos textuales y subiendo la foto principal (`$_FILES['imagen']`) a la carpeta de uploads.
* **`action = update`**: (Solo administradores/empleados) Actualiza campos.
    * Si es administrador, procesa la modificación de textos, de la nueva imagen principal y permite subir múltiples imágenes secundarias a la vez (`$_FILES['gallery_files']`) mapeándolas en la tabla `gato_fotos`.
    * Si es empleado, solo le permite modificar el estado de salud y adopción del felino.
* **`action = delete`**: (Solo administradores) Elimina el felino de la base de datos.

### 2.5 [api/solicitudes.php](file:///c:/Users/karol/Desktop/entrega/felinamente/api/solicitudes.php)
Módulo crítico que gestiona las peticiones de los adoptantes y las reglas de negocio del sistema de adopción.
* **Flujo `GET`**:
  * **`action = pending_count`**: Devuelve la cantidad de solicitudes en estado `pendiente`. Se usa para pintar el indicador visual numérico en el panel de gestión del personal de forma dinámica.
  * **`action = list`**: (Solo personal) Devuelve la lista completa de solicitudes cruzando datos con las tablas `gatos` y `usuarios` (`JOIN`).
  * **`action = my_list`**: Devuelve solo las solicitudes del usuario autenticado actual.
* **Flujo `POST`**:
  * **`action = update_my_solicitud`**: Permite al usuario editar su propio comentario en una solicitud rechazada y volver a ponerla en estado `pendiente` para su revisión.
  * **`action = update_status`**: (Solo administradores/empleados) Modifica el estado de una solicitud (`aprobada`, `rechazada`).
    * **Transacción SQL**: Se abre un bloque transaccional (`$pdo->beginTransaction()`). Si el estado pasa a `aprobada`, el sistema actualiza automáticamente el estado del felino asociado: si es adopción pasa a `reservado`/`adoptado`, y si es acogida pasa a `acogido`.
    * **Disparador de Notificaciones**: Crea una alerta personalizada en la tabla `notificaciones` destinada al usuario adoptante.
  * **Nueva Solicitud (Acción por defecto)**: Crea una solicitud para un gato.
    * **Validación Crítica (Regla de Adopción)**: Si el usuario intenta solicitar `adopcion` o `acogida`, se realiza un `SELECT COUNT(*)` para verificar si el usuario tiene alguna solicitud de tipo `visita` aprobada anteriormente. Si el resultado es cero, detiene la operación lanzando una respuesta de error con código HTTP `403` impidiendo guardar el registro.

---

## 3. Análisis del Frontend (JavaScript del Cliente)

El frontend reside en la raíz y utiliza ficheros JavaScript separados ubicados en `/js/` para evitar colisiones de variables globales y facilitar el mantenimiento.

### 3.1 [js/auth.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/auth.js)
Script cargado de forma global en todas las páginas web. Su misión es controlar el flujo de navegación según el estado de la sesión.
* **`comprobarSesion()`**: Hace una llamada fetch asíncrona a `api/auth.php?action=status`. Si hay sesión, guarda la información en la variable global `usuarioActual` y renderiza el menú de navegación con accesos rápidos adaptados a su rol (ej: si es administrador, dibuja el botón de "Gestión" en el menú).
* **`login()`** / **`registro()`** / **`logout()`**: Envían los datos de los formularios modales correspondientes a la API y refrescan la página o redirigen al usuario tras el éxito.

### 3.2 [js/index.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/index.js)
Controla la página de portada (`index.html`).
* **`cargarAdoptadosHome()`**: Llama a la lista de gatos en estado `reservado` (adoptados), selecciona los 3 más recientes y renderiza tarjetas informativas de "Casos de éxito".
* **`cargarDestacadosHome()`**: Obtiene la lista completa de felinos y pinta en portada tres gatos destacados disponibles para captar el interés de los adoptantes.

### 3.3 [js/gatos.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/gatos.js)
Controla la galería de visualización pública (`gatos.html`).
* **`cargarGatos()`**: Llama a `api/cats.php?action=list` concatenando dinámicamente a la URL de consulta los valores de los filtros seleccionados por el usuario en el DOM (sexo, vhif, edad y criterio de ordenación). Renderiza dinámicamente las tarjetas HTML correspondientes a los felinos encontrados.

### 3.4 [js/gato.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/gato.js)
Gestiona la ficha individual detallada de cada gato (`gato.html`).
* **`cargarDetalleGato()`**: Lee el parámetro `id` de la URL (`URLSearchParams`), realiza una petición a `api/cats.php?action=get&id=X` y pinta en la pantalla la ficha de salud, fotos secundarias en forma de carrusel interactivo y descripción del temperamento del animal.
* **Manejo de Botones de Solicitud**: Redirige al usuario logueado hacia el formulario de solicitudes pasándole el ID del gato de forma implícita.

### 3.5 [js/solicitud.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/solicitud.js)
Controla el formulario para tramitar peticiones (`solicitud.html`).
* Lee el parámetro `id_gato` y el tipo de solicitud inicial.
* Al enviar el formulario, empaqueta los datos en un objeto JSON y realiza un `fetch()` POST a `api/solicitudes.php`.
* Si el backend devuelve un error `403` (falta de visita aprobada), muestra una alerta informativa personalizada guiando al usuario para que solicite primero una cita.

### 3.6 [js/mis-solicitudes.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/mis-solicitudes.js)
Controla el área privada del adoptante (`mis-solicitudes.html`).
* **`cargarMisSolicitudes()`**: Muestra el historial de visitas, adopciones y acogidas que ha solicitado el usuario. Si alguna está en estado "rechazada", dibuja un botón interactivo "Corregir comentario" para que el usuario pueda rectificar su propuesta y volverla a enviar a los gestores de forma ágil.

### 3.7 [js/gestion.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/gestion.js)
Controla el backoffice administrativo principal (`gestion.html`).
* **`cargarPanelGestion()`**: Carga en una tabla HTML el listado de gatos para los administradores y personal. Muestra su estado actual y botones rápidos para Editar o Eliminar.
* **`guardarGato()`**: Envía el formulario de alta del felino usando un objeto nativo `FormData` en lugar de JSON común. Esto es necesario debido a que incluye una subida binaria de archivo (la imagen principal del gato).

### 3.8 [js/editar-gato.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/editar-gato.js)
Controla la edición detallada del felino (`editar-gato.html`).
* Carga los datos actuales del gato en los inputs del formulario.
* Al procesar la confirmación, utiliza `FormData` para enviar los campos actualizados, la nueva foto principal (opcional) y la selección múltiple de fotos para adjuntar a la galería secundaria del gato.

### 3.9 [js/solicitudes_admin.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/solicitudes_admin.js)
Controla la gestión de solicitudes del personal (`solicitudes.html`).
* Pinta todas las solicitudes tramitadas en el sistema.
* Contiene los controladores de eventos para los botones "Aprobar" y "Rechazar" que llaman al endpoint `api/solicitudes.php?action=update_status` enviando la resolución.

### 3.10 [js/usuarios_admin.js](file:///c:/Users/karol/Desktop/entrega/felinamente/js/usuarios_admin.js)
Controla la administración de usuarios (`usuarios.html`).
* Permite al administrador principal modificar contraseñas de emergencia, cambiar nombres de usuario y ascender/descender usuarios asignándoles nuevos roles del sistema (`admin`, `employee`, `volunteer`, `user`).

---

## 4. Flujos Clave de la Aplicación (Paso a Paso)

### 4.1 Autenticación de un Usuario
1. El usuario introduce usuario y contraseña en el modal y pulsa "Entrar".
2. JS captura el evento `submit`, extrae los valores y los envía como JSON a `api/auth.php?action=login`.
3. El PHP recibe el JSON, comprueba la existencia del usuario y valida el hash con `password_verify()`.
4. Si es correcto:
   * Guarda `id_usuario`, `nombre_usuario` y `rol` en el array global del servidor `$_SESSION`.
   * Devuelve un JSON con estado `200` y los datos públicos de la sesión.
5. El JavaScript recibe el `200`, guarda la información en la variable global, cierra el modal de login y redibuja la cabecera mostrando el panel adaptado al usuario autenticado.

### 4.2 La Regla de Negocio: Restricción de Adopción
1. Un usuario entra en la ficha de un gato y pulsa en "Adoptar".
2. Se le redirige al formulario de solicitudes con el tipo `adopcion`.
3. Al enviar la solicitud, JS hace un `fetch()` POST hacia `api/solicitudes.php`.
4. El script PHP comprueba que el tipo es `adopcion`.
5. Ejecuta la consulta de seguridad:
   ```sql
   SELECT COUNT(*) FROM solicitudes 
   WHERE id_usuario = :userId AND id_gato = :idGato AND tipo_solicitud = 'visita' AND estado_solicitud = 'aprobada'
   ```
6. **Escenario A (No ha visitado el gato):** La consulta devuelve `0`. El PHP interrumpe el proceso ejecutando `sendResponse(403, "Debes solicitar primero una cita presencial...")`. El frontend recibe el error y muestra una ventana modal de alerta bloqueando la solicitud.
7. **Escenario B (Ya ha visitado el gato):** La consulta devuelve `>= 1`. El PHP permite continuar la ejecución, insertando la nueva solicitud en estado `pendiente`. Devuelve un `201` al frontend y este muestra un mensaje de éxito redirigiendo al usuario a su área personal.
