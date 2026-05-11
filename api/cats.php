<?php
session_start();
require_once 'db.php';
require_once 'utils.php';

$action = $_GET['action'] ?? 'list';
$pdo = getDBConnection();
$data = getJsonInput();

$role = $_SESSION['role'] ?? 'guest';

switch ($action) {
    case 'list':
        $vhif = $_GET['vhif'] ?? null;
        $sexo = $_GET['gender'] ?? null; // Front calls it gender
        $estado = $_GET['status'] ?? 'disponible';
        
        $query = "SELECT * FROM gatos WHERE 1=1";
        $params = [];

        if ($vhif !== null) {
            $query .= " AND vhif = ?";
            $params[] = (int)$vhif;
        }
        if ($sexo) {
            $query .= " AND sexo = ?";
            $params[] = $sexo;
        }
        
        if ($role === 'employee' || $role === 'admin') {
            if (isset($_GET['status_filter'])) {
                $query .= " AND estado = ?";
                $params[] = $_GET['status_filter'];
            }
        } else {
            $query .= " AND estado = 'disponible'";
        }

        $query .= " ORDER BY fecha_ingreso DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $cats = $stmt->fetchAll();
        sendResponse(200, "Lista de gatos", $cats);
        break;

    case 'add':
        if ($role !== 'admin') {
            sendResponse(403, "Solo administradores pueden añadir gatos.");
        }
        
        $nombre = $data['name'] ?? '';
        $nacimiento = $data['birth_date'] ?? null; // Updated to match diagram
        $sexo = $data['gender'] ?? 'desconocido';
        $vhif = $data['vhif_positive'] ?? 0;
        $desc = $data['description'] ?? '';
        $img = $data['image_url'] ?? '';

        $stmt = $pdo->prepare("INSERT INTO gatos (nombre, fecha_nacimiento, sexo, vhif, descripcion, imagen_principal) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $nacimiento, $sexo, $vhif, $desc, $img]);
        sendResponse(201, "Gato añadido con éxito.");
        break;

    case 'update':
        if ($role !== 'admin' && $role !== 'employee') {
            sendResponse(403, "Permisos insuficientes.");
        }
        
        $id = $data['id'] ?? null;
        if (!$id) sendResponse(400, "ID de gato requerido.");

        $estado = $data['status'] ?? null;
        if ($role === 'admin') {
            $stmt = $pdo->prepare("UPDATE gatos SET nombre=?, fecha_nacimiento=?, sexo=?, vhif=?, estado=?, descripcion=?, imagen_principal=? WHERE id_gato=?");
            $stmt->execute([$data['name'], $data['birth_date'], $data['gender'], $data['vhif_positive'], $data['status'], $data['description'], $data['image_url'], $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE gatos SET estado=? WHERE id_gato=?");
            $stmt->execute([$estado, $id]);
        }
        sendResponse(200, "Gato actualizado.");
        break;

    case 'delete':
        if ($role !== 'admin') {
            sendResponse(403, "Solo administradores pueden eliminar gatos.");
        }
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM gatos WHERE id_gato=?");
        $stmt->execute([$id]);
        sendResponse(200, "Gato eliminado.");
        break;

    default:
        sendResponse(405, "Acción no válida.");
        break;
}
?>
