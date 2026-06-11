<?php
// ------------------------------------------------------------
// Auto‑contained utilities (previously utils.php)
// ------------------------------------------------------------
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

set_exception_handler(function($e){
    http_response_code(500);
    echo json_encode(['status'=>500,'message'=>'Excepción: '.$e->getMessage(),'data'=>null]);
    exit();
});
set_error_handler(function($errno,$errstr){
    http_response_code(500);
    echo json_encode(['status'=>500,'message'=>'Error: '.$errstr,'data'=>null]);
    exit();
});

function sendResponse($status, $message, $data = null) {
    header('Content-Type: application/json');
    http_response_code($status);
    
    $respuesta = [
        "status" => $status,
        "message" => $message,
        "data" => $data
    ];
    
    echo json_encode($respuesta);
    exit();
}

function getJsonInput(){
    return json_decode(file_get_contents('php://input'), true);
}

function parseTimestamp($val){
    if (empty($val)) return null;
    return is_numeric($val) ? (int)$val : strtotime($val)*1000;
}

if (session_status()===PHP_SESSION_NONE){
    session_start();
}
$userIdHeader = $_SERVER['HTTP_X_USER_ID'] ?? null;
$roleHeader = $_SERVER['HTTP_X_USER_ROLE'] ?? 'guest';
$usernameHeader = $_SERVER['HTTP_X_USER_USERNAME'] ?? null;
if (function_exists('getallheaders')){
    $h = getallheaders();
    $userIdHeader = $userIdHeader ?? $h['X-User-Id'] ?? $h['x-user-id'] ?? null;
    $roleHeader = $roleHeader ?? $h['X-User-Role'] ?? $h['x-user-role'] ?? 'guest';
    $usernameHeader = $usernameHeader ?? $h['X-User-Username'] ?? $h['x-user-username'] ?? null;
}
if ($userIdHeader !== null){
    $_SESSION['user_id'] = $userIdHeader;
    $_SESSION['role'] = $roleHeader;
    $_SESSION['username'] = $usernameHeader;
}

require_once 'db.php';

$data = getJsonInput();
$pdo = getDBConnection();
$userId = $_SESSION['user_id'] ?? null;
$role = $_SESSION['role'] ?? 'guest';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'pending_count') {
        if ($userId && ($role === 'admin' || $role === 'employee')) {
            $consulta = $pdo->query("SELECT COUNT(*) as count FROM solicitudes WHERE estado_solicitud = 'pendiente'");
            $count = $consulta->fetchColumn();
            sendResponse(200, "Conteo exitoso", ["count" => (int)$count]);
        } else {
            sendResponse(403, "No tienes permisos.");
        }
    }

    if ($action === 'list') {
        if ($userId && ($role === 'admin' || $role === 'employee')) {
            $consulta = $pdo->query("
                SELECT s.*, g.nombre as gato_nombre, u.nombre_usuario 
                FROM solicitudes s
                JOIN gatos g ON s.id_gato = g.id_gato
                JOIN usuarios u ON s.id_usuario = u.id_usuario
                ORDER BY s.id_solicitud DESC
            ");
            $lista = $consulta->fetchAll();
            foreach ($lista as $s) {
                if (!empty($s['fecha_solicitud'])) {
                    $s['fecha_solicitud'] = parseTimestamp($s['fecha_solicitud']);
                    $s['fecha_creacion'] = $s['fecha_solicitud'];
                }
            }
            sendResponse(200, "Lista de solicitudes", $lista);
        } else {
            sendResponse(403, "No tienes permisos.");
        }
    }

    if ($action === 'my_list') {
        if (!$userId) sendResponse(401, "Sesión no válida.");
        $consulta = $pdo->prepare("
            SELECT s.*, g.nombre as gato_nombre 
            FROM solicitudes s
            JOIN gatos g ON s.id_gato = g.id_gato
            WHERE s.id_usuario = ?
            ORDER BY s.id_solicitud DESC
        ");
        $consulta->execute([$userId]);
        $lista = $consulta->fetchAll();
        foreach ($lista as &$s) {
            if (!empty($s['fecha_solicitud'])) {
                $s['fecha_solicitud'] = parseTimestamp($s['fecha_solicitud']);
                $s['fecha_creacion'] = $s['fecha_solicitud'];
            }
        }
        sendResponse(200, "Tus solicitudes", $lista);
    }
    sendResponse(400, "Acción GET no válida.");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? '';

    if ($action === 'update_my_solicitud') {
        $id = $data['id_solicitud'] ?? null;
        $mensaje = $data['mensaje'] ?? null;
        if (!$id || !$mensaje) sendResponse(400, "Faltan datos.");
        $consulta = $pdo->prepare("SELECT id_usuario FROM solicitudes WHERE id_solicitud = ?");
        $consulta->execute([$id]);
        $soli = $consulta->fetch();

        if (!$soli || $soli['id_usuario'] != $userId) {
            sendResponse(403, "No puedes editar esta solicitud.");
        }
        $consulta = $pdo->prepare("UPDATE solicitudes SET comentarios_usu = ?, estado_solicitud = 'pendiente' WHERE id_solicitud = ?");
        $consulta->execute([$mensaje, $id]);
        sendResponse(200, "Solicitud actualizada y enviada a revisión.");
    }

    if ($action === 'update_status') {
        if ($userId && ($role === 'admin' || $role === 'employee')) {
            $id = $data['id_solicitud'];
            $nuevoEstado = $data['estado'];
            if (!$id || !$nuevoEstado) sendResponse(400, "Faltan datos para actualizar el estado.");

            $pdo->beginTransaction();
            try {
                $consulta = $pdo->prepare("UPDATE solicitudes SET estado_solicitud = ? WHERE id_solicitud = ?");
                $consulta->execute([$nuevoEstado, $id]);
                if ($nuevoEstado === 'aprobada') {
                    $stmtSoli = $pdo->prepare("SELECT id_gato, tipo_solicitud FROM solicitudes WHERE id_solicitud = ?");
                    $stmtSoli->execute([$id]);
                    $solicitudInfo = $stmtSoli->fetch();

                    if ($solicitudInfo) {
                        $idGato = $solicitudInfo['id_gato'];
                        $tipo = $solicitudInfo['tipo_solicitud'];
                        $nuevoEstadoGato = ($tipo === 'adopcion') ? 'reservado' : 'acogido';
                        $stmtGato = $pdo->prepare("UPDATE gatos SET estado = ?, fecha_estado = (ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)) WHERE id_gato = ?");
                        $stmtGato->execute([$nuevoEstadoGato, $idGato]);
                    }
                }

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

    if (!$userId) {
        sendResponse(401, "Debes iniciar sesión para realizar una solicitud.");
    }

    $idGato = $data['id_gato'] ?? null;
    $tipo = $data['tipo'] ?? '';
    $mensaje = $data['mensaje'] ?? '';

    if (!$idGato || !$tipo) {
        sendResponse(400, "Faltan datos obligatorios (Gato o Tipo).");
    }

    if ($tipo === 'adopcion' || $tipo === 'acogida') {
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM solicitudes WHERE id_usuario = ? AND id_gato = ? AND tipo_solicitud = 'visita'");
        $stmtCheck->execute([$userId, $idGato]);
        if ($stmtCheck->fetchColumn() == 0) {
            sendResponse(403, "Debes solicitar primero una cita presencial para conocer al felino antes de tramitar su adopción o acogida.");
        }
    }

    try {
        $consulta = $pdo->prepare("INSERT INTO solicitudes (id_usuario, id_gato, tipo_solicitud, estado_solicitud, comentarios_usu) VALUES (?, ?, ?, 'pendiente', ?)");
        $consulta->execute([$userId, $idGato, $tipo, $mensaje]);
        sendResponse(201, "Solicitud enviada con éxito.");
    } catch (PDOException $e) {
        error_log("Error SQL en solicitudes: " . $e->getMessage());
        sendResponse(500, "Error en la base de datos al guardar la solicitud: " . $e->getMessage());
    }
}

sendResponse(405, "Método no permitido.");
?>
