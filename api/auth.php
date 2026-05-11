<?php
// Archivo de autenticación de usuarios
session_start(); // Iniciamos la sesión para guardar el usuario
require_once 'db.php';
require_once 'utils.php';

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
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
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

        $stmt = $pdo->prepare("SELECT id, username, password, role FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $user['username'];
            
            sendResponse(200, "Login exitoso", [
                "id" => $user['id'],
                "username" => $user['username'],
                "role" => $user['role']
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

    default:
        sendResponse(405, "Método no permitido.");
        break;
}
?>
