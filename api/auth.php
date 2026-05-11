<?php
// Archivo de autenticación de usuarios
require_once 'utils.php';
session_start(); // Iniciamos la sesión para guardar el usuario
require_once 'db.php';

// Recogemos la acción de la URL (por GET)
$action = $_GET['action'] ?? '';
$data = getJsonInput(); // Usamos la función de utils.php para leer JSON
$pdo = getDBConnection(); // Conectamos a la BD

switch ($action) {
    case 'register':
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$username || !$email || !$password) {
            sendResponse(400, "Faltan datos obligatorios.");
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        try {
            $stmt = $pdo->prepare("INSERT INTO usuarios (nombre_usuario, correo, contrasenia) VALUES (?, ?, ?)");
            $stmt->execute([$username, $email, $hashedPassword]);
            sendResponse(201, "Usuario registrado con éxito.");
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                sendResponse(409, "El usuario o email ya existe.");
            }
            sendResponse(500, "Error al registrar: " . $e->getMessage());
        }
        break;

    case 'login':
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $pdo->prepare("SELECT id_usuario, nombre_usuario, contrasenia, rol FROM usuarios WHERE nombre_usuario = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['contrasenia'])) {
            $_SESSION['user_id'] = $user['id_usuario'];
            $_SESSION['role'] = $user['rol'];
            $_SESSION['username'] = $user['nombre_usuario'];
            
            sendResponse(200, "Login exitoso", [
                "id" => $user['id_usuario'],
                "username" => $user['nombre_usuario'],
                "role" => $user['rol']
            ]);
        } else {
            sendResponse(401, "Credenciales inválidas.");
        }
        break;

    case 'logout':
        session_destroy();
        sendResponse(200, "Sesión cerrada.");
        break;

    case 'status':
        if (isset($_SESSION['user_id'])) {
            sendResponse(200, "Sesión activa", [
                "id" => $_SESSION['user_id'],
                "username" => $_SESSION['username'],
                "role" => $_SESSION['role']
            ]);
        } else {
            sendResponse(200, "Sin sesión activa", ["role" => "guest"]);
        }
        break;

    case 'list':
        if (($_SESSION['role'] ?? '') !== 'admin') sendResponse(403, "Solo admin.");
        $stmt = $pdo->query("SELECT id_usuario, nombre_usuario, correo, rol, telefono, residencia FROM usuarios");
        sendResponse(200, "Lista de usuarios", $stmt->fetchAll());
        break;

    case 'update':
        if (($_SESSION['role'] ?? '') !== 'admin') sendResponse(403, "Solo admin.");
        $id = $data['id_usuario'] ?? null;
        $newRole = $data['rol'] ?? null;
        $newPass = $data['password'] ?? null;

        if (!$id) sendResponse(400, "ID necesario.");

        if ($newPass) {
            $hashed = password_hash($newPass, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE usuarios SET rol = ?, contrasenia = ? WHERE id_usuario = ?");
            $stmt->execute([$newRole, $hashed, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE usuarios SET rol = ? WHERE id_usuario = ?");
            $stmt->execute([$newRole, $id]);
        }
        sendResponse(200, "Usuario actualizado.");
        break;

    case 'get_profile':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        $stmt = $pdo->prepare("SELECT id_usuario, nombre_usuario, correo, rol, telefono, residencia FROM usuarios WHERE id_usuario = ?");
        $stmt->execute([$_SESSION['user_id']]);
        sendResponse(200, "Tu perfil", $stmt->fetch());
        break;

    case 'update_profile':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        $id = $_SESSION['user_id'];
        $email = $data['email'] ?? null;
        $telefono = $data['telefono'] ?? null;
        $residencia = $data['residencia'] ?? null;
        $newPass = $data['password'] ?? null;

        if (!$email) sendResponse(400, "Email es obligatorio.");

        if ($newPass) {
            $hashed = password_hash($newPass, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE usuarios SET correo = ?, telefono = ?, residencia = ?, contrasenia = ? WHERE id_usuario = ?");
            $stmt->execute([$email, $telefono, $residencia, $hashed, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE usuarios SET correo = ?, telefono = ?, residencia = ? WHERE id_usuario = ?");
            $stmt->execute([$email, $telefono, $residencia, $id]);
        }
        sendResponse(200, "Perfil actualizado.");
        break;

    case 'get_notifications':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        $stmt = $pdo->prepare("SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 10");
        $stmt->execute([$_SESSION['user_id']]);
        sendResponse(200, "Notificaciones", $stmt->fetchAll());
        break;

    case 'read_notifications':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        $stmt = $pdo->prepare("UPDATE notificaciones SET leida = 1 WHERE id_usuario = ?");
        $stmt->execute([$_SESSION['user_id']]);
        sendResponse(200, "Marcadas como leídas.");
        break;

    default:
        sendResponse(405, "Método no permitido.");
        break;
}
?>
