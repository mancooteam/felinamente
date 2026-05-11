-- Esquema de base de datos Felinamente
-- Basado en el diagrama de Entidad-Relación

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    imagen_perfil VARCHAR(255),
    fecha_nacimiento DATE,
    residencia VARCHAR(255),
    rol ENUM('admin', 'employee', 'volunteer', 'user') DEFAULT 'user',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gatos (
    id_gato INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    sexo ENUM('macho', 'hembra', 'desconocido'),
    descripcion TEXT,
    vhif BOOLEAN DEFAULT FALSE,
    estado ENUM('disponible', 'reservado', 'enfermo', 'acogido') DEFAULT 'disponible',
    imagen_principal VARCHAR(255),
    notas_medicas TEXT,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_estado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_gato INT,
    tipo_solicitud ENUM('adopcion', 'visita', 'acogida', 'voluntariado') NOT NULL,
    estado_solicitud ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comentarios_usu TEXT,
    notas_internas TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_gato) REFERENCES gatos(id_gato) ON DELETE CASCADE
);
