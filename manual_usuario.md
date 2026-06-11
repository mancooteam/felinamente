# ANEXO: MANUAL DE USUARIO

## 1. Introducción
El presente manual tiene como objetivo documentar las directrices de uso de la plataforma web "Felinamente". Este documento describe los flujos operativos de la aplicación desde la perspectiva de los diferentes roles contemplados en el sistema: Usuario No Autenticado (Visitante), Usuario Autenticado (Adoptante), Empleado y Administrador.

La plataforma ha sido diseñada para ser accesible mediante cualquier navegador web estándar, requiriendo únicamente conexión a Internet.

## 2. Acceso y Registro (Usuarios No Autenticados)

### 2.1. Navegación en el Portal Público
La página de inicio ofrece información general sobre el refugio y el acceso directo al catálogo de felinos. Los usuarios no autenticados pueden visualizar el catálogo completo de animales disponibles haciendo uso de la pestaña "Nuestros felinos" ubicada en el menú de navegación principal.

### 2.2. Registro de Nuevos Usuarios
Para realizar trámites de adopción o acogida, el sistema requiere la creación de una cuenta de usuario. El procedimiento es el siguiente:
1. Acceder al botón "Registrarse" situado en la esquina superior derecha de la interfaz.
2. Cumplimentar el formulario emergente introduciendo un nombre de usuario válido, una dirección de correo electrónico y una contraseña segura.
3. Confirmar la operación pulsando "Crear cuenta". El sistema validará los datos e informará del éxito del registro.

*(Figura 1: Formulario de registro de usuario)*

### 2.3. Autenticación en el Sistema
Los usuarios previamente registrados deben autenticarse de la siguiente manera:
1. Seleccionar la opción "Login" en el menú principal.
2. Introducir las credenciales (nombre de usuario y contraseña).
3. Pulsar el botón "Entrar" para establecer la sesión.

*(Figura 2: Formulario de inicio de sesión)*

## 3. Guía de Uso para Adoptantes (Usuarios Autenticados)

Tras la autenticación, el usuario asume el rol base de Adoptante, habilitándose las funcionalidades de solicitud.

### 3.1. Exploración del Catálogo de Felinos
En la sección "Nuestros felinos", el usuario visualizará las fichas resumidas de cada animal.
El sistema proporciona herramientas de filtrado en la parte superior que permiten acotar la búsqueda según criterios como edad, sexo y estado de salud (por ejemplo, positividad en VHIF). Al seleccionar un felino, se accede a su ficha detallada, que incluye información ampliada, notas de comportamiento y una galería fotográfica.

### 3.2. Tramitación de Solicitudes
El sistema implementa una lógica de negocio restrictiva para asegurar el bienestar animal. Antes de poder optar a una adopción o acogida, es imperativo solicitar una "Visita presencial".

El proceso para registrar una solicitud es el siguiente:
1. Desde la ficha detallada del felino, identificar el formulario de solicitud.
2. Seleccionar el tipo de trámite deseado (Visita, Acogida o Adopción). Si se intenta solicitar Acogida o Adopción sin constar una visita previa, el sistema bloqueará la operación notificando el motivo al usuario.
3. Introducir de manera opcional comentarios adicionales o motivaciones en la caja de texto.
4. Enviar la solicitud. El sistema registrará el trámite en estado "Pendiente".

### 3.3. Seguimiento y Notificaciones
- **Gestión de solicitudes:** A través del menú de usuario (esquina superior derecha), seleccionando "Mis Solicitudes", se despliega el historial completo de trámites activos y pasados, mostrando su estado actual (Pendiente, Aprobada, Rechazada, etc.). En caso de que un administrador requiera más información, el usuario podrá editar sus comentarios desde este panel de control.
- **Sistema de alertas:** El icono de la campana en la interfaz actúa como centro de notificaciones en tiempo real, avisando al usuario cada vez que el estado de sus trámites es actualizado por el personal del refugio.

*(Figura 3: Interfaz de notificaciones y seguimiento de solicitudes)*

### 3.4. Gestión del Perfil
El usuario puede actualizar sus datos de contacto accediendo a "Mi Perfil" desde el menú principal. Se permite la modificación de la dirección de correo, teléfono de contacto, municipio de residencia y credenciales de acceso.

## 4. Guía de Uso para Empleados

Las cuentas con privilegios de Empleado disponen de herramientas operativas para la gestión diaria del refugio, sin llegar a tener control destructivo sobre los registros.

### 4.1. Panel de Administración
Al autenticarse, el empleado verá habilitada una sección "Administración" en su menú desplegable, la cual concede acceso directo a las herramientas operativas.

### 4.2. Auditoría de Solicitudes
Desde la vista "Gestión de Solicitudes", el empleado tiene visibilidad sobre todos los trámites iniciados por los usuarios.
- El empleado debe revisar el historial, el usuario solicitante y el felino implicado.
- Se proporcionan controles para modificar el estado de la solicitud a "Aprobada", "Rechazada" o solicitar más detalles ("Requiere más info").
- Cualquier actualización de estado disparará automáticamente una alerta en el perfil del usuario involucrado.

*(Figura 4: Panel de control de solicitudes para empleados)*

### 4.3. Mantenimiento del Catálogo
El empleado tiene autorización para acceder al Panel de Gestión y editar los registros existentes de los felinos. Podrá actualizar su disponibilidad (por ejemplo, pasarlo a estado "Reservado" o "En Acogida") o modificar las notas médicas. No obstante, este rol carece de privilegios para la creación de nuevos registros de animales o la eliminación de los mismos de la base de datos.

## 5. Guía de Uso para Administradores

El rol de Administrador dispone del nivel máximo de privilegios del sistema, abarcando la totalidad de la gestión.

### 5.1. Gestión de Usuarios y Permisos
Mediante la sección "Gestión de Usuarios", el administrador puede visualizar el listado completo de cuentas registradas en la base de datos.
- Se permite la elevación de privilegios, otorgando el rol de Empleado o de Administrador a usuarios estándar.
- Facilita la eliminación definitiva de cuentas del sistema por motivos de mantenimiento o incumplimiento de normativas.

### 5.2. Gestión Integral del Catálogo (Altas y Bajas)
El Administrador es el único perfil autorizado para añadir o eliminar fichas de felinos.
1. **Alta de felinos:** Mediante el botón de creación en el Panel de Gestión, se introduce la información biológica, el estado de salud y se adjunta una fotografía principal.
2. **Ampliación de galería:** Durante la edición de un registro existente, se habilita la opción de carga múltiple (subida masiva de imágenes) para construir de manera eficiente la galería fotográfica del animal.
3. **Baja de registros:** La plataforma provee un mecanismo de eliminación segura. Al borrar un felino, el sistema garantiza el borrado en cascada a nivel de base de datos, eliminando de forma transparente los recursos multimedia y los trámites históricos vinculados a dicho animal, preservando así la integridad referencial.

*(Figura 5: Interfaz de gestión integral del catálogo para administradores)*
