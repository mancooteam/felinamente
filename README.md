# Felinamente — Plataforma Web de Gestión y Adopción de Felinos

Este documento constituye la memoria técnica y académica para el Proyecto Final del Ciclo Formativo de Grado Superior de Desarrollo de Aplicaciones Web (DAW).

---

## 1. Portada

* **Título del proyecto:** Felinamente: Plataforma Web de Gestión y Adopción para Protectoras de Felinos
* **Nombre del autor/a:** `[Tu nombre completo aquí]`
* **Nombre del tutor/a:** `[Nombre del tutor del proyecto]`
* **Centro educativo:** `[Nombre de tu centro educativo]`
* **Curso académico:** 2025 - 2026
* **Cielo formativo:** Grado Superior en Desarrollo de Aplicaciones Web (2º DAW)

---

## 2. Introducción

### Justificación del proyecto
El abandono de animales es una problemática social grave a nivel global. Las protectoras de gatos suelen ser organizaciones sin fines de lucro con recursos muy limitados. Muchas de ellas realizan la gestión diaria (registro clínico de los felinos, control de socios, gestión de solicitudes de adopción o acogida) de manera manual mediante libretas, redes sociales o hojas de cálculo compartidas. Esta falta de centralización provoca pérdidas de datos, duplicación de esfuerzos y una peor calidad de atención a los animales. El proyecto **Felinamente** nace para solucionar esta carencia proporcionando una herramienta centralizada, digitalizada y eficiente.

### Contexto y motivación
Como futuros desarrolladores web, este proyecto es una oportunidad para diseñar una solución real desde el principio. La motivación principal es combinar la pasión por la tecnología con el bienestar animal, facilitando la comunicación bidireccional entre la protectora y la ciudadanía interesada en adoptar o realizar acogidas.

### Objetivos generales y específicos
* **Objetivos Generales:**
  * Diseñar y desarrollar una aplicación web integral para la gestión administrativa y la visualización pública de los felinos en adopción de una protectora.
  * Implementar una arquitectura de desarrollo web moderna, separando de manera clara la capa de datos (API REST) de la del cliente (frontend dinámico).
* **Objetivos Específicos:**
  * Crear una base de datos MySQL segura y encriptada (mediante certificado SSL) alojada en la nube (Aiven).
  * Programar una API REST robusta en **PHP 8.2** sin dependencias de grandes frameworks comerciales para una mayor comprensión de las bases de la programación del lado del servidor.
  * Diseñar un cliente web moderno y responsive utilizando **JavaScript (ES6)** asíncrono, HTML5 y CSS3 personalizado, siguiendo directrices de diseño limpio y editorial.
  * Implementar un control estricto de acceso mediante roles de sesión (`admin`, `employee`, `volunteer`, `user`).
  * Asegurar un flujo de trabajo para las adopciones mediante validaciones en el backend (exigir una visita previa por seguridad antes de solicitar la adopción de un gato).
  * Contenedorizar la aplicación utilizando **Docker** y desplegarla de forma automatizada en la plataforma **Render**.

---

## 3. Análisis del proyecto

### Descripción del problema a resolver
Actualmente, la protectora no dispone de un sistema web interactivo. Los usuarios interesados deben enviar correos o llamar por teléfono, lo cual satura al personal. Además, no se lleva una trazabilidad de las visitas previas de las personas interesadas a los gatos (vital para asegurar la afinidad entre felino y adoptante) ni se tiene un registro de datos médicos de los felinos visible de forma privada para el personal clínico.

### Público objetivo y usuarios potenciales
* **Adoptantes / Usuarios públicos:** Personas interesadas en conocer los gatos disponibles, realizar visitas presenciales, solicitar acogidas temporales o adopciones.
* **Voluntarios:** Personal que se encarga de interactuar directamente con los animales y crear solicitudes de acogida o soporte.
* **Empleados / Administradores:** Gestores de la protectora que necesitan un panel de control para añadir nuevos felinos, asignar historial médico, aceptar/rechazar solicitudes de ciudadanos y controlar los usuarios del sistema.

### Requisitos funcionales
* **Gestión de usuarios:** Registro, login, control de perfil personal y seguridad de sesiones.
* **Catálogo de felinos:** Visualización en línea de las fichas de los gatos (nombre, descripción, edad, sexo, estado e historial médico si corresponde). Incluye filtros de búsqueda y ordenación dinámica (edad, sexo, vhif positivo o negativo).
* **Gestión de Solicitudes:**
  * Los usuarios pueden solicitar: `visita`, `adopción`, `acogida` o `voluntariado`.
  * **Regla de Negocio Crítica (Seguridad):** Un usuario no puede solicitar acogida ni adopción directamente desde la web si la base de datos no registra que ha realizado al menos una petición previa de `visita` aprobada por la protectora.
* **Panel de administración (Backoffice):**
  * Empleados: Pueden actualizar el estado de los gatos.
  * Administradores: Tienen control total. Pueden dar de alta nuevos gatos (con imagen principal y galería secundaria), editar cualquier campo, aprobar/rechazar solicitudes de cualquier tipo y gestionar usuarios.
  * **Cambios de estado automáticos:** Al aprobarse una solicitud de adopción, el estado del gato cambia automáticamente a `reservado`/`adoptado` para evitar que otros usuarios lo soliciten.
* **Notificaciones internas:** El usuario recibe notificaciones en tiempo real cuando se modifica el estado de su solicitud.

### Requisitos no funcionales
* **Seguridad:** Encriptación de contraseñas con el algoritmo BCRYPT de PHP.
* **Protección de datos:** Conexión a la base de datos de la nube utilizando certificados SSL enlazados dinámicamente en la conexión PDO.
* **Portabilidad:** Toda la aplicación web se ejecuta dentro de una imagen de Docker basada en Apache con soporte para PDO MySQL, asegurando que funcione exactamente igual en cualquier ordenador o servidor.
* **Usabilidad:** Diseño responsive adaptado a cualquier pantalla (móviles, tablets y ordenadores) y uso de micro-animaciones para mejorar la experiencia de usuario.

---

## 4. Desarrollo

### Tecnologías y herramientas utilizadas
* **Entorno de Desarrollo:** Visual Studio Code, Git/GitHub, Docker Desktop.
* **Backend:** PHP 8.2 (Vanilla, orientado a objetos con PDO), Session API, JSON responses.
* **Frontend:** HTML5 semántico, Vanilla CSS3 (diseño estético editorial personalizado con variables CSS), Bootstrap 5 para rejilla y componentes modulares, Vanilla JavaScript (programación asíncrona con Fetch, gestión de eventos).
* **Base de datos:** MySQL 8.0 alojada en **Aiven** (base de datos en la nube de alta disponibilidad).
* **Servidor y Despliegue:** Apache HTTP Server (integrado en la imagen oficial de Docker), Render (plataforma PaaS para despliegues automatizados sincronizados con GitHub).

### Código fuente
La estructura del proyecto se divide de la siguiente manera para mantener una clara separación de responsabilidades:

```text
felinamente/
├── api/                   # BACKEND (API REST)
│   ├── auth.php           # Gestión de usuarios, autenticación, perfiles y notificaciones.
│   ├── cats.php           # CRUD de gatos, carga de imágenes y galería de fotos.
│   ├── db.php             # Conexión PDO segura con conexión SSL de Aiven.
│   ├── schema.sql         # Definición de las tablas de la base de datos.
│   ├── seed.sql           # Datos de prueba (usuarios y gatos).
│   ├── solicitudes.php    # Gestión de peticiones y lógica de las reglas de negocio.
│   └── utils.php          # Helpers globales de lectura JSON, control de sesión y respuestas.
├── css/                   # ESTILOS
│   └── style.css          # Diseño estético editorial personalizado.
├── js/                    # FRONTEND (Lógica del cliente)
│   ├── auth.js            # Comprueba estado de sesión, login y registro de usuarios.
│   ├── editar-gato.js     # Formulario de edición del gato, galería, actualización.
│   ├── gato.js            # Ficha pública detallada de un felino y envío de solicitudes.
│   ├── gatos.js           # Lista pública de gatos con filtros y búsqueda dinámica.
│   ├── gestion.js         # Tabla administrativa de gatos para administradores y empleados.
│   ├── index.js           # Lógica de la página principal (Gatos destacados y adoptados).
│   ├── mis-solicitudes.js # Espacio personal del usuario con historial y estado de peticiones.
│   ├── solicitudes_admin.js # Control de solicitudes para administradores (aprobar/rechazar).
│   └── usuarios_admin.js  # Gestión de usuarios y cambios de roles por parte del administrador.
├── img/                   # Recursos gráficos estáticos (logos, imágenes de muestra).
├── index.html             # Página de inicio pública.
├── gatos.html             # Catálogo de gatos.
├── gato.html              # Ficha de detalle de un gato.
├── solicitud.html         # Formulario para tramitar visitas, acogidas o adopciones.
├── mis-solicitudes.html   # Panel del adoptante.
├── gestion.html           # Panel principal de la protectora (altas/bajas).
├── solicitudes.html       # Listado administrativo de solicitudes pendientes/aprobadas.
├── usuarios.html          # Listado administrativo de usuarios.
├── contacto.html          # Página de contacto y localización.
├── patrocinadores.html    # Página de agradecimientos y espónsors.
├── credits.html           # Información de créditos del proyecto.
├── Dockerfile             # Archivo de configuración para la creación del contenedor.
└── README.md              # Documentación del proyecto (este archivo).
```

### Funcionamiento general
1. **Acceso público:** Cualquier visitante puede ver la página de inicio y filtrar la lista de gatos en `gatos.html`.
2. **Sistema de adopción seguro (Flujo):**
   * El usuario elige un gato en `gato.html`.
   * Si hace clic en "Adoptar" o "Acoger", el sistema intercepta la petición en la API `solicitudes.php`.
   * La API comprueba si existe una solicitud de `visita` aprobada en la BD. Si no existe, deniega la acción con un error `403` e invita a solicitar primero una cita de visita.
   * El usuario rellena el formulario de visita. El administrador lo recibe, lo pone en contacto con los voluntarios y, tras la visita presencial, el administrador aprueba la solicitud desde `solicitudes.html`.
   * Una vez aprobada la visita, el usuario ya tiene acceso al formulario para solicitar formalmente la adopción del gato.
   * Cuando el administrador aprueba la adopción, la API realiza una transacción SQL para cambiar el estado del gato a `reservado`/`adoptado` y enviar una notificación interna a la bandeja del usuario.

### Manual de usuario y Credenciales de Prueba
Para poder probar de forma correcta todas las funcionalidades, se han definido los siguientes usuarios de muestra en la base de datos (todos tienen la misma contraseña para facilitar la corrección: `1234`):

1. **Administrador total:**
   * **Usuario:** `admin`
   * **Contraseña:** `1234`
   * **Permisos:** CRUD completo de gatos, control de usuarios, aceptación/rechazo de solicitudes globales.
2. **Empleado de la protectora:**
   * **Usuario:** `karol_staff`
   * **Contraseña:** `1234`
   * **Permisos:** Modificar el estado de los gatos y revisar solicitudes, pero no puede eliminar registros ni cambiar roles de seguridad de la aplicación.
3. **Voluntario:**
   * **Usuario:** `juan_voluntario`
   * **Contraseña:** `1234`
   * **Permisos:** Acceso normal con capacidades de visualización y colaboración en acogidas.
4. **Usuario / Adoptante general:**
   * **Usuario:** `maria_adopta`
   * **Contraseña:** `1234`
   * **Permisos:** Solicitar visitas, adopciones y ver su historial y notificaciones.

---

## 5. Conclusión y valoración personal

### Evaluación del proyecto
El desarrollo de **Felinamente** ha resultado un éxito. Se ha logrado el despliegue de un entorno real de producción mediante Docker y bases de datos remotas con SSL, consiguiendo un comportamiento óptimo de la API REST creada a medida con PHP. Desde el punto de vista estético, se ha evitado el aspecto genérico de Bootstrap aplicando variables de diseño CSS personalizadas (fuentes Serif, minimalismo, colores cálidos, efectos Hover y transiciones de opacidad).

### Dificultades encontradas y cómo se solucionaron
1. **Conexión de Base de Datos Segura con SSL (Aiven):**
   * *Problema:* Aiven MySQL requiere obligatoriamente el uso de certificados SSL para las conexiones externas. En entornos de desarrollo local no se suele utilizar SSL, lo cual generaba errores de conexión en producción (Render).
   * *Solución:* Se configuró un mecanismo en [db.php](file:///c:/Users/karol/Desktop/entrega/felinamente/api/db.php) que lee el certificado desde una variable de entorno de Render (`MYSQL_ATTR_SSL_CA`), crea un archivo temporal en el sistema de archivos de PHP en tiempo de ejecución mediante `tempnam()`, y enlaza este archivo como parámetro `PDO::MYSQL_ATTR_SSL_CA` en la conexión.
2. **Sistema de Archivos Efímero en Docker / Render:**
   * *Problema:* Los servicios web en el plan gratuito de Render no tienen almacenamiento de disco persistente por defecto. Cuando se subía una nueva versión del código con Git o se realizaba un redespliegue automático, la carpeta `uploads/cats/` se borraba del contenedor, provocando que las fotos de los gatos añadidos desde la web de producción se perdieran (mientras que la base de datos en Aiven seguía guardando la URL vacía).
   * *Solución:* Para la demostración del proyecto académico, se han incluido las imágenes de muestra directamente en el repositorio de Git (bajo la carpeta `img/`), de manera que Render las monta directamente en cada construcción de la imagen de Docker. Además, se documenta que para producción en un entorno profesional se requiere:
     * Configurar un volumen/disco persistente en Render montado en `/var/www/html/uploads/` (opción de pago en Render).
     * O bien integrar la API de un servicio de almacenamiento externo como **Cloudinary** o **AWS S3** desde PHP.

### Posibles mejoras y evolución futura
* **Integración automática de Cloudinary:** Sustituir el disco local por la librería de Cloudinary para permitir subidas ilimitadas de fotos de gatos 100% persistentes y gratuitas en la versión en línea.
* **Pasarela de pago:** Conectar Stripe para permitir que los usuarios puedan realizar donaciones puntuales o hacerse socios de la protectora pagando una cuota mensual.
* **Chat en línea:** Utilizar WebSockets o AJAX Polling para permitir chatear en tiempo real entre voluntarios y adoptantes para organizar las visitas de manera más cercana.

---

## 6. Bibliografía y fuentes

* **Documentación de PHP:** [PHP Manual (Oficial)](https://www.php.net/manual/es/)
* **Documentación de PDO en PHP:** [PDO Class Reference](https://www.php.net/manual/es/class.pdo.php)
* **Desarrollo frontend y JavaScript:** [MDN Web Docs (Mozilla)](https://developer.mozilla.org/)
* **Rejilla y elementos de diseño:** [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
* **Imágenes de ejemplos libres de derechos:** [Unsplash](https://unsplash.com/)
* **Configuración de contenedores:** [Docker Reference Documentation](https://docs.google.com/home) / [Docker Hub](https://hub.docker.com/)
* **Despliegue y hostings de bases de datos:** [Render Docs](https://docs.render.com/) y [Aiven MySQL Help Center](https://help.aiven.io/)

---

## 7. Presentación ante el tribunal

Para la defensa del proyecto ante los miembros del tribunal examinador de DAW, se recomienda seguir esta estructura de tiempo (duración aproximada: **15 - 20 minutos**):

### Diapositiva 1: Introducción y Motivación (2 minutos)
* Presentación del alumno, tutor y título del proyecto.
* Justificación del porqué de una herramienta para protectoras de gatos (situación de abandono, falta de digitalización).

### Diapositiva 2: Requisitos y Reglas de Negocio (3 minutos)
* Qué hace especial al proyecto: sistema de roles de usuarios.
* Explicar de manera clara la regla del flujo de trabajo: **Seguridad del animal**. Obligación de haber realizado una `visita` exitosa antes de activar la opción de solicitar `adopción` o `acogida`.

### Diapositiva 3: Demostración en Directo de la Aplicación (6 minutos)
* **Paso 1:** Entrar como usuario anónimo, navegar por la página de gatos e intentar solicitar acogida de un gato (ver el bloqueo).
* **Paso 2:** Iniciar sesión con el usuario de pruebas `maria_adopta`. Realizar una solicitud de visita para el gato "Michi".
* **Paso 3:** Cerrar sesión e iniciar sesión como administrador (`admin`). Ir a la sección de "Gestión de Solicitudes", ver la solicitud de visita de María y aprobarla.
* **Paso 4:** Volver a entrar como `maria_adopta`. Comprobar la notificación interna y solicitar formalmente la adopción de "Michi".
* **Paso 5:** Volver como `admin` y aprobar la adopción. Mostrar cómo el estado del gato en la base de datos y en la ficha pública cambia instantáneamente a `reservado`/`adoptado`.

### Diapositiva 4: Arquitectura Técnica (3 minutos)
* Explicación de la conexión segura SSL con MySQL en Aiven.
* Cómo se ha organizado el código de la API (PHP) y el Cliente (JavaScript Fetch asíncrono).
* Uso de Docker para la replicabilidad del proyecto.

### Diapositiva 5: Conclusiones y Retos (3 minutos)
* Valoración de la experiencia (aprendizaje de seguridad SSL, manejo de eventos complejos en JavaScript).
* Líneas futuras de trabajo (módulos de pagos, Cloudinary).
* Preguntas del tribunal.
