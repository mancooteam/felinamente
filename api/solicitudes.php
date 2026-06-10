<?php
require_once 'utils.php';
require_once 'db.php';

$data = getJsonInput();
$pdo = getDBConnection();
$userId = $_SESSION['user_id'] ?? null;
$role = $_SESSION['role'] ?? 'guest';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'pending_count') {
        if ($userId && ($role === 'admin' || $role === 'employee')) {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM solicitudes WHERE estado_solicitud = 'pendiente'");
            $count = $stmt->fetchColumn();
            sendResponse(200, "Conteo exitoso", ["count" => (int)$count]);
        } else {
            sendResponse(403, "No tienes permisos.");
        }
    }

    if ($action === 'list') {
        if ($userId && ($role === 'admin' || $role === 'employee')) {
            $stmt = $pdo->query("
                SELECT s.*, g.nombre as gato_nombre, u.nombre_usuario 
                FROM solicitudes s
                JOIN gatos g ON s.id_gato = g.id_gato
                JOIN usuarios u ON s.id_usuario = u.id_usuario
                ORDER BY s.id_solicitud DESC
            ");
            $lista = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, "Lista de solicitudes", $lista);
        } else {
            sendResponse(403, "No tienes permisos.");
        }
    }

    if ($action === 'my_list') {
        if (!$userId) sendResponse(401, "Sesión no válida.");
        $stmt = $pdo->prepare("
            SELECT s.*, g.nombre as gato_nombre 
            FROM solicitudes s
            JOIN gatos g ON s.id_gato = g.id_gato
            WHERE s.id_usuario = ?
            ORDER BY s.id_solicitud DESC
        ");
        $stmt->execute([$userId]);
        sendResponse(200, "Tus solicitudes", $stmt->fetchAll());
    }
    sendResponse(400, "Acción GET no válida.");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? '';

    if ($action === 'update_my_solicitud') {
        $id = $data['id_solicitud'] ?? null;
        $mensaje = $data['mensaje'] ?? null;
        if (!$id || !$mensaje) sendResponse(400, "Faltan datos.");

        // Verificar que la solicitud pertenece al usuario
        $stmt = $pdo->prepare("SELECT id_usuario FROM solicitudes WHERE id_solicitud = ?");
        $stmt->execute([$id]);
        $soli = $stmt->fetch();

        if (!$soli || $soli['id_usuario'] != $userId) {
            sendResponse(403, "No puedes editar esta solicitud.");
        }

        // Actualizar mensaje y volver a poner en pendiente
        $stmt = $pdo->prepare("UPDATE solicitudes SET comentarios_usu = ?, estado_solicitud = 'pendiente' WHERE id_solicitud = ?");
        $stmt->execute([$mensaje, $id]);
        sendResponse(200, "Solicitud actualizada y enviada a revisión.");
    }

    // Acción para actualizar estado (admin)
    if ($action === 'update_status') {
        if ($userId && ($role === 'admin' || $role === 'employee')) {
            $id = $data['id_solicitud'] ?? null;
            $nuevoEstado = $data['estado'] ?? null;
            if (!$id || !$nuevoEstado) sendResponse(400, "Faltan datos para actualizar el estado.");

            $pdo->beginTransaction();
            try {
                // Actualizar el estado de la solicitud
                $stmt = $pdo->prepare("UPDATE solicitudes SET estado_solicitud = ? WHERE id_solicitud = ?");
                $stmt->execute([$nuevoEstado, $id]);

                // Si se aprueba, actualizamos el estado del gato automáticamente
                if ($nuevoEstado === 'aprobada') {
                    // Primero obtenemos el id_gato y el tipo de solicitud
                    $stmtSoli = $pdo->prepare("SELECT id_gato, tipo_solicitud FROM solicitudes WHERE id_solicitud = ?");
                    $stmtSoli->execute([$id]);
                    $solicitudInfo = $stmtSoli->fetch();

                    if ($solicitudInfo) {
                        $idGato = $solicitudInfo['id_gato'];
                        $tipo = $solicitudInfo['tipo_solicitud'];
                        // Usamos valores en minúsculas y que coincidan con el ENUM de la BD (según seed.sql)
                        $nuevoEstadoGato = ($tipo === 'adopcion') ? 'reservado' : 'acogido';

                        $stmtGato = $pdo->prepare("UPDATE gatos SET estado = ? WHERE id_gato = ?");
                        $stmtGato->execute([$nuevoEstadoGato, $idGato]);
                    }
                }

                // Crear notificación para el usuario (Manejo de error si la tabla no existe aún)
                try {
                    $stmtUser = $pdo->prepare("SELECT id_usuario, tipo_solicitud FROM solicitudes WHERE id_solicitud = ?");
                    $stmtUser->execute([$id]);
                    $soliData = $stmtUser->fetch();
                    if ($soliData) {
                        $msgNotif = "Tu solicitud de " . $soliData['tipo_solicitud'] . " ha sido " . $nuevoEstado . ".";
                        $stmtN = $pdo->prepare("INSERT INTO notificaciones (id_usuario, mensaje) VALUES (?, ?)");
                        $stmtN->execute([$soliData['id_usuario'], $msgNotif]);
                    }
                } catch (Exception $notifError) {
                    // Ignoramos el error de notificación para no bloquear la actualización principal
                }

                $pdo->commit();
                sendResponse(200, "Estado actualizado con éxito.");
            } catch (Exception $e) {
                $pdo->rollBack();
                sendResponse(500, "Error al actualizar: " . $e->getMessage());
            }
        } else {
            sendResponse(403, "No tienes permisos para realizar esta acción.");
        }
    }

    // Si no hay acción específica, es una nueva solicitud de usuario
    if (!$userId) {
        sendResponse(401, "Debes iniciar sesión para realizar una solicitud.");
    }

    $idGato = $data['id_gato'] ?? null;
    $tipo = $data['tipo'] ?? '';
    $mensaje = $data['mensaje'] ?? '';

    if (!$idGato || !$tipo) {
        sendResponse(400, "Faltan datos obligatorios (Gato o Tipo).");
    }

    // OBLIGACIÓN: Antes de adopción o acogida, debe existir al menos una solicitud de 'visita'
    if ($tipo === 'adopcion' || $tipo === 'acogida') {
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM solicitudes WHERE id_usuario = ? AND id_gato = ? AND tipo_solicitud = 'visita'");
        $stmtCheck->execute([$userId, $idGato]);
        if ($stmtCheck->fetchColumn() == 0) {
            sendResponse(403, "Debes solicitar primero una cita presencial para conocer al felino antes de tramitar su adopción o acogida.");
        }
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO solicitudes (id_usuario, id_gato, tipo_solicitud, estado_solicitud, comentarios_usu) VALUES (?, ?, ?, 'pendiente', ?)");
        $stmt->execute([$userId, $idGato, $tipo, $mensaje]);
        sendResponse(201, "Solicitud enviada con éxito.");
    } catch (PDOException $e) {
        error_log("Error SQL en solicitudes: " . $e->getMessage());
        sendResponse(500, "Error en la base de datos al guardar la solicitud: " . $e->getMessage());
    }
}

sendResponse(405, "Método no permitido.");
