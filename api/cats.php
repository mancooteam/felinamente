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
        $gender = $_GET['gender'] ?? null;
        $status = $_GET['status'] ?? 'available'; // Default to available for guests/users
        
        $query = "SELECT * FROM cats WHERE 1=1";
        $params = [];

        if ($vhif !== null) {
            $query .= " AND vhif_positive = ?";
            $params[] = (int)$vhif;
        }
        if ($gender) {
            $query .= " AND gender = ?";
            $params[] = $gender;
        }
        
        // Employees and admins can see all statuses
        if ($role === 'employee' || $role === 'admin') {
            if (isset($_GET['status_filter'])) {
                $query .= " AND status = ?";
                $params[] = $_GET['status_filter'];
            }
        } else {
            $query .= " AND status = 'available'";
        }

        $query .= " ORDER BY admission_date DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $cats = $stmt->fetchAll();
        sendResponse(200, "Lista de gatos", $cats);
        break;

    case 'add':
        if ($role !== 'admin') {
            sendResponse(403, "Solo administradores pueden añadir gatos.");
        }
        
        $name = $data['name'] ?? '';
        $age = $data['age'] ?? 0;
        $gender = $data['gender'] ?? 'unknown';
        $breed = $data['breed_color'] ?? '';
        $vhif = $data['vhif_positive'] ?? 0;
        $admission = $data['admission_date'] ?? date('Y-m-d');
        $desc = $data['description'] ?? '';
        $img = $data['image_url'] ?? '';

        $stmt = $pdo->prepare("INSERT INTO cats (name, age, gender, breed_color, vhif_positive, admission_date, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $age, $gender, $breed, $vhif, $admission, $desc, $img]);
        sendResponse(201, "Gato añadido con éxito.");
        break;

    case 'update':
        if ($role !== 'admin' && $role !== 'employee') {
            sendResponse(403, "Permisos insuficientes.");
        }
        
        $id = $data['id'] ?? null;
        if (!$id) sendResponse(400, "ID de gato requerido.");

        $status = $data['status'] ?? null;
        // Admins can update everything, employees only status (as per requirements)
        if ($role === 'admin') {
            $stmt = $pdo->prepare("UPDATE cats SET name=?, age=?, gender=?, breed_color=?, vhif_positive=?, status=?, description=?, image_url=? WHERE id=?");
            $stmt->execute([$data['name'], $data['age'], $data['gender'], $data['breed_color'], $data['vhif_positive'], $data['status'], $data['description'], $data['image_url'], $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE cats SET status=? WHERE id=?");
            $stmt->execute([$status, $id]);
        }
        sendResponse(200, "Gato actualizado.");
        break;

    case 'delete':
        if ($role !== 'admin') {
            sendResponse(403, "Solo administradores pueden eliminar gatos.");
        }
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM cats WHERE id=?");
        $stmt->execute([$id]);
        sendResponse(200, "Gato eliminado.");
        break;

    default:
        sendResponse(405, "Acción no válida.");
        break;
}
?>
