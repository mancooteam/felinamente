<?php
require_once 'utils.php';
require_once 'db.php';

$action = $_GET['action'] ?? 'list';
$pdo = getDBConnection();
$data = getJsonInput();

$role = $_SESSION['role'] ?? 'guest';

switch ($action) {
    case 'list':
        $vhif = $_GET['vhif'] ?? null;
        $sexo = $_GET['gender'] ?? null;
        $estado = $_GET['status'] ?? null;
        $age = $_GET['age'] ?? null;
        $order = $_GET['order'] ?? 'recientes';
        
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
        
        // Filtro por edad (basado en fecha_nacimiento)
        if ($age) {
            if ($age === 'cachorro') {
                $query .= " AND TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) < 1";
            } elseif ($age === 'joven') {
                $query .= " AND TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 1 AND 3";
            } elseif ($age === 'adulto') {
                $query .= " AND TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 3 AND 7";
            } elseif ($age === 'senior') {
                $query .= " AND TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) >= 7";
            }
        }

        if ($role === 'employee' || $role === 'admin') {
            if (isset($_GET['status_filter'])) {
                $query .= " AND estado = ?";
                $params[] = $_GET['status_filter'];
            }
        } else {
            $query .= " AND estado IN ('disponible', 'acogido', 'reservado', 'enfermo')";
        }

        // Orden dinámico
        if ($order === 'antiguos') {
            $query .= " ORDER BY fecha_ingreso ASC";
        } elseif ($order === 'nombre_asc') {
            $query .= " ORDER BY nombre ASC";
        } else {
            $query .= " ORDER BY fecha_ingreso DESC";
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $cats = $stmt->fetchAll();
        foreach ($cats as &$cat) {
            if (!empty($cat['fecha_ingreso'])) {
                $cat['fecha_ingreso'] = strtotime($cat['fecha_ingreso']) * 1000;
            }
            if (!empty($cat['fecha_estado'])) {
                $cat['fecha_estado'] = strtotime($cat['fecha_estado']) * 1000;
            }
        }
        sendResponse(200, "Lista de gatos", $cats);
        break;

    case 'get':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            sendResponse(400, "Se requiere el ID del gato.");
        }
        $stmt = $pdo->prepare("SELECT * FROM gatos WHERE id_gato = ?");
        $stmt->execute([$id]);
        $cat = $stmt->fetch();
        
        if ($cat) {
            if (!empty($cat['fecha_ingreso'])) {
                $cat['fecha_ingreso'] = strtotime($cat['fecha_ingreso']) * 1000;
            }
            if (!empty($cat['fecha_estado'])) {
                $cat['fecha_estado'] = strtotime($cat['fecha_estado']) * 1000;
            }
            // Cargar galería de fotos (con manejo de errores por si la tabla no existe aún)
            try {
                $stmtPhotos = $pdo->prepare("SELECT url_foto FROM gato_fotos WHERE id_gato = ?");
                $stmtPhotos->execute([$id]);
                $cat['galeria'] = $stmtPhotos->fetchAll(PDO::FETCH_COLUMN);
            } catch (PDOException $e) {
                $cat['galeria'] = []; // Si la tabla no existe, enviamos galería vacía
            }
            
            sendResponse(200, "Detalles del gato", $cat);
        } else {
            sendResponse(404, "Gato no encontrado.");
        }
        break;

    case 'add':
        if ($role !== 'admin') {
            sendResponse(403, "Solo administradores pueden añadir gatos.");
        }
        
        $nombre = $_POST['name'] ?? '';
        $nacimiento = $_POST['birth_date'] ?? null;
        $sexo = $_POST['gender'] ?? 'desconocido';
        $vhif = $_POST['vhif_positive'] ?? 0;
        $desc = $_POST['description'] ?? '';
        $estado = $_POST['status'] ?? 'disponible';
        $notas = $_POST['notas_medicas'] ?? '';
        
        $imgPath = '';
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/cats/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileName = time() . '_' . basename($_FILES['imagen']['name']);
            $targetFilePath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['imagen']['tmp_name'], $targetFilePath)) {
                $imgPath = 'uploads/cats/' . $fileName; // Ruta relativa para el frontend
            } else {
                sendResponse(500, "Error al subir la imagen.");
            }
        }

        $stmt = $pdo->prepare("INSERT INTO gatos (nombre, fecha_nacimiento, sexo, vhif, descripcion, notas_medicas, imagen_principal, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $nacimiento, $sexo, $vhif, $desc, $notas, $imgPath, $estado]);
        sendResponse(201, "Gato añadido con éxito.");
        break;

    case 'update':
        if ($role !== 'admin' && $role !== 'employee') {
            sendResponse(403, "Permisos insuficientes.");
        }
        
        $id = $_POST['id'] ?? null;
        if (!$id) sendResponse(400, "ID de gato requerido.");

        $estado = $_POST['status'] ?? 'disponible';
        
        if ($role === 'admin') {
            $nombre = $_POST['name'] ?? '';
            $nacimiento = $_POST['birth_date'] ?? null;
            $sexo = $_POST['gender'] ?? 'desconocido';
            $vhif = (isset($_POST['vhif_positive']) && ($_POST['vhif_positive'] === 'on' || $_POST['vhif_positive'] == 1)) ? 1 : 0;
            $desc = $_POST['description'] ?? '';
            $notas = $_POST['notas_medicas'] ?? '';

            // Manejo de Imagen Principal
            $imgPath = null;
            if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = '../uploads/cats/';
                if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
                $fileName = time() . '_main_' . basename($_FILES['image_file']['name']);
                if (move_uploaded_file($_FILES['image_file']['tmp_name'], $uploadDir . $fileName)) {
                    $imgPath = 'uploads/cats/' . $fileName;
                }
            }

            if ($imgPath) {
                $stmt = $pdo->prepare("UPDATE gatos SET nombre=?, fecha_nacimiento=?, sexo=?, vhif=?, estado=?, descripcion=?, notas_medicas=?, imagen_principal=?, fecha_estado=(ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)) WHERE id_gato=?");
                $stmt->execute([$nombre, $nacimiento, $sexo, $vhif, $estado, $desc, $notas, $imgPath, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE gatos SET nombre=?, fecha_nacimiento=?, sexo=?, vhif=?, estado=?, descripcion=?, notas_medicas=?, fecha_estado=(ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)) WHERE id_gato=?");
                $stmt->execute([$nombre, $nacimiento, $sexo, $vhif, $estado, $desc, $notas, $id]);
            }

            // Manejo de Galería (Múltiples archivos)
            if (isset($_FILES['gallery_files'])) {
                $uploadDir = '../uploads/cats/';
                foreach ($_FILES['gallery_files']['tmp_name'] as $key => $tmp_name) {
                    if ($_FILES['gallery_files']['error'][$key] === UPLOAD_ERR_OK) {
                        $fName = time() . '_gal_' . $key . '_' . basename($_FILES['gallery_files']['name'][$key]);
                        if (move_uploaded_file($tmp_name, $uploadDir . $fName)) {
                            $gPath = 'uploads/cats/' . $fName;
                            $stmtG = $pdo->prepare("INSERT INTO gato_fotos (id_gato, url_foto) VALUES (?, ?)");
                            $stmtG->execute([$id, $gPath]);
                        }
                    }
                }
            }

        } else {
            // Empleado solo puede actualizar el estado
            $stmt = $pdo->prepare("UPDATE gatos SET estado=?, fecha_estado=(ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)) WHERE id_gato=?");
            $stmt->execute([$estado, $id]);
        }
        
        sendResponse(200, "Gato actualizado correctamente.");
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
