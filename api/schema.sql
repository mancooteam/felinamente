-- Esquema de base de datos Felinamente
-- Recreación limpia de la base de datos de Aiven desde cero con BIGINT Unix Timestamps en milisegundos

DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS gato_fotos;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS gatos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    imagen_perfil VARCHAR(255),
    fecha_nacimiento DATE,
    residencia VARCHAR(255),
    rol ENUM('admin', 'employee', 'volunteer', 'user') DEFAULT 'user',
    fecha_creacion BIGINT DEFAULT (ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000))
);

CREATE TABLE gatos (
    id_gato INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    sexo ENUM('macho', 'hembra', 'desconocido'),
    descripcion TEXT,
    vhif BOOLEAN DEFAULT FALSE,
    estado ENUM('disponible', 'reservado', 'enfermo', 'acogido') DEFAULT 'disponible',
    imagen_principal VARCHAR(255),
    notas_medicas TEXT,
    fecha_ingreso BIGINT DEFAULT (ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)),
    fecha_estado BIGINT DEFAULT (ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000))
);

CREATE TABLE solicitudes (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_gato INT,
    tipo_solicitud ENUM('adopcion', 'visita', 'acogida', 'voluntariado') NOT NULL,
    estado_solicitud ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud BIGINT DEFAULT (ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)),
    comentarios_usu TEXT,
    notas_internas TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_gato) REFERENCES gatos(id_gato) ON DELETE CASCADE
);

CREATE TABLE gato_fotos (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    id_gato INT NOT NULL,
    url_foto VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_gato) REFERENCES gatos(id_gato) ON DELETE CASCADE
);

CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion BIGINT DEFAULT (ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
