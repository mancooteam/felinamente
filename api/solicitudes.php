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
    sendResponse(400, "Acción GET no válida.");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? '';

    // Acción para actualizar estado (admin)
    if ($action === 'update_status') {
        if ($userId && ($role === 'admin' || $role === 'employee')) {
            $id = $data['id_solicitud'] ?? null;
            $nuevoEstado = $data['estado'] ?? null;
            if (!$id || !$nuevoEstado) sendResponse(400, "Faltan datos para actualizar el estado.");

            $stmt = $pdo->prepare("UPDATE solicitudes SET estado_solicitud = ? WHERE id_solicitud = ?");
            $stmt->execute([$nuevoEstado, $id]);
            sendResponse(200, "Estado actualizado con éxito.");
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
