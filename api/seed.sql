-- Script de población de datos (Seed) extendido para el proyecto Felinamente
-- Basado en el diagrama de Entidad-Relación y adaptado para 2º DAW

-- Limpiar datos previos si fuera necesario (Cuidado: borra todo)
-- DELETE FROM solicitudes; DELETE FROM gatos; DELETE FROM usuarios;

-- 1. USUARIOS (Password para todos: '1234')
-- El hash corresponde a '1234' usando BCRYPT
INSERT INTO usuarios (nombre_usuario, correo, contrasenia, rol, telefono, residencia) VALUES 
('admin', 'admin@felinamente.com', '$2y$10$vI8A7sz5S1VpD.9zU6.MueM.uS.EaTfH5uXmXyVv/uS6XmXyVv/uS', 'admin', '600111222', 'Oficina Central'),
('karol_staff', 'karol@felinamente.com', '$2y$10$vI8A7sz5S1VpD.9zU6.MueM.uS.EaTfH5uXmXyVv/uS6XmXyVv/uS', 'employee', '611222333', 'Valencia Sede Norte'),
('juan_voluntario', 'juan@gmail.com', '$2y$10$vI8A7sz5S1VpD.9zU6.MueM.uS.EaTfH5uXmXyVv/uS6XmXyVv/uS', 'volunteer', '622333444', 'Mislata'),
('maria_adopta', 'maria.user@yahoo.es', '$2y$10$vI8A7sz5S1VpD.9zU6.MueM.uS.EaTfH5uXmXyVv/uS6XmXyVv/uS', 'user', '633444555', 'Valencia Centro'),
('pedro_gatos', 'pedro88@gmail.com', '$2y$10$vI8A7sz5S1VpD.9zU6.MueM.uS.EaTfH5uXmXyVv/uS6XmXyVv/uS', 'user', '644555666', 'Torrent'),
('ana_protectora', 'ana@protectora.org', '$2y$10$vI8A7sz5S1VpD.9zU6.MueM.uS.EaTfH5uXmXyVv/uS6XmXyVv/uS', 'volunteer', '655666777', 'Paterna');

-- 2. GATOS (10 ejemplos con imágenes locales pre-instaladas del proyecto)
INSERT INTO gatos (nombre, fecha_nacimiento, sexo, descripcion, vhif, estado, imagen_principal, notas_medicas) VALUES 
('Michi', '2023-05-10', 'macho', 'Gatito naranja muy sociable, ideal para familias con niños.', 0, 'disponible', 'img/slider_1.png', 'Vacunación completa. Desparasitado.'),
('Luna', '2024-02-15', 'hembra', 'Gatita negra elegante, un poco tímida al principio.', 0, 'disponible', 'img/slider_2.png', 'Pendiente de esterilización.'),
('Simba', '2022-08-20', 'macho', 'Gato rubio rescatado de una colonia. Es positivo en VHIF pero hace vida normal.', 1, 'disponible', 'img/slider_3.png', 'VHIF positivo. Requiere control anual.'),
('Nala', '2020-11-05', 'hembra', 'Siamesa adulta muy tranquila. Le encanta dormir al sol.', 0, 'acogido', 'img/hero_cats.png', 'Esterilizada. Sin problemas de salud.'),
('Bolas', '2025-01-10', 'macho', 'Cachorro gris muy juguetón, fue encontrado en una caja.', 0, 'disponible', 'img/slider_1.png', 'En tratamiento por conjuntivitis leve.'),
('Garfield', '2021-03-12', 'macho', 'Gato grande y perezoso, le encanta la comida húmeda.', 0, 'reservado', 'img/slider_2.png', 'Sobrepeso leve. Dieta controlada.'),
('Bella', '2019-06-25', 'hembra', 'Gata carey con mucha personalidad.', 0, 'disponible', 'img/slider_3.png', 'Sana. Carácter fuerte.'),
('Copito', '2023-12-01', 'macho', 'Totalmente blanco, ojos azules. Sordo de nacimiento.', 0, 'disponible', 'img/slider_1.png', 'Sordera congénita. Debe vivir en interiores.'),
('Mimi', '2024-05-05', 'hembra', 'Gatita tricolor muy pequeña para su edad.', 1, 'enfermo', 'img/slider_2.png', 'Tratamiento por infección respiratoria.'),
('Ramsés', '2018-09-17', 'macho', 'Gato egipcio (Sphynx) muy inteligente y activo.', 0, 'disponible', 'img/slider_3.png', 'Requiere cuidados especiales de la piel.');

-- 3. SOLICITUDES
INSERT INTO solicitudes (id_usuario, id_gato, tipo_solicitud, estado_solicitud, comentarios_usu, notas_internas) VALUES 
(4, 1, 'adopcion', 'pendiente', 'Tenemos otra gata en casa y nos gustaría que tuviera compañía.', 'Llamar para entrevista inicial.'),
(5, 5, 'adopcion', 'rechazada', 'Quiero un gato para cazar ratones en mi finca.', 'Perfil no apto: busca gato para exterior.'),
(3, 2, 'acogida', 'aprobada', 'Puedo tenerla un par de meses mientras se recupera.', 'Voluntario con experiencia previa.'),
(4, 3, 'visita', 'pendiente', 'Me interesa Simba, ¿puedo ir el sábado?', NULL),
(6, 10, 'acogida', 'pendiente', 'Tengo experiencia con gatos Sphynx.', 'Pendiente de verificar domicilio.');
