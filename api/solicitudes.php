<?php
require_once 'utils.php';
session_start();
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
            sendResponse(200, "Conteo exitoso", ["count" => $count]);
        } else {
            sendResponse(403, "No tienes permisos.");
        }
    }
    sendResponse(405, "Método no permitido o acción inválida.");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(405, "Método no permitido.");
}

if (!$userId) {
    sendResponse(401, "Debes iniciar sesión para realizar una solicitud.");
}

$idGato = $data['id_gato'] ?? null;
$tipo = $data['tipo'] ?? ''; // 'adopcion' o 'acogida'
$mensaje = $data['mensaje'] ?? '';

if (!$idGato || !$tipo) {
    sendResponse(400, "Faltan datos requeridos.");
}

try {
    $stmt = $pdo->prepare("INSERT INTO solicitudes (id_usuario, id_gato, tipo_solicitud, estado_solicitud, comentarios_usu) VALUES (?, ?, ?, 'pendiente', ?)");
    $stmt->execute([$userId, $idGato, $tipo, $mensaje]);
    sendResponse(201, "Solicitud enviada con éxito.");
} catch (PDOException $e) {
    error_log($e->getMessage());
    sendResponse(500, "Error BD: " . $e->getMessage());
}
