<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

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

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);
$pdo = getDBConnection();

switch ($action) {
    case 'register':
        $username = $data['username'];
        $email = $data['email'];
        $password = $data['password'];

        if (!$username || !$email || !$password) {
            sendResponse(400, "Faltan datos obligatorios.");
        }

        $hPass = password_hash($password, PASSWORD_BCRYPT);

        try {
            $consulta = $pdo->prepare("INSERT INTO usuarios (nombre_usuario, correo, contrasenia) VALUES (?, ?, ?)");
            $consulta->execute([$username, $email, $hashedPassword]);
            sendResponse(201, "Usuario registrado con éxito.");
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                sendResponse(409, "El usuario o email ya existe.");
            }
            sendResponse(500, "Error al registrar: " . $e->getMessage());
        }
        break;

    case 'create_user':
        if (($_SESSION['role'] ?? '') !== 'admin') sendResponse(403, "Solo admin.");
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $rol = $data['rol'] ?? 'user';

        if (!$username || !$email || !$password) sendResponse(400, "Faltan datos.");

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        try {
            $consulta = $pdo->prepare("INSERT INTO usuarios (nombre_usuario, correo, contrasenia, rol) VALUES (?, ?, ?, ?)");
            $consulta->execute([$username, $email, $hashed, $rol]);
            sendResponse(201, "Usuario creado con éxito.");
        } catch (PDOException $e) {
            sendResponse(409, "El usuario o email ya existe.");
        }
        break;

    case 'login':
        $username = $data['username'];
        $password = $data['password'];

        $consulta = $pdo->prepare("SELECT id_usuario, nombre_usuario, contrasenia, rol FROM usuarios WHERE nombre_usuario = ?");
        $consulta->execute([$username]);
        $user = $consulta->fetch();

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
        $consulta = $pdo->query("SELECT id_usuario, nombre_usuario, correo, rol, telefono, residencia FROM usuarios");
        sendResponse(200, "Lista de usuarios", $consulta->fetchAll());
        break;

    case 'update':
        if (($_SESSION['role'] ?? '') !== 'admin') sendResponse(403, "Solo admin.");
        $id = $data['id_usuario'];
        $newName = $data['nombre_usuario'] ?? null;
        $newRole = $data['rol'] ?? null;
        $newPass = $data['password'] ?? null;

        if (!$id) sendResponse(400, "ID necesario.");

        $sql = "UPDATE usuarios SET rol = ?, nombre_usuario = ?";
        $params = [$newRole, $newName];

        if ($newPass) {
            $sql .= ", contrasenia = ?";
            $params[] = password_hash($newPass, PASSWORD_BCRYPT);
        }

        $sql .= " WHERE id_usuario = ?";
        $params[] = $id;

        $consulta = $pdo->prepare($sql);
        $consulta->execute($params);
        sendResponse(200, "Usuario actualizado.");
        break;

    case 'delete':
        if (($_SESSION['role'] ?? '') !== 'admin') sendResponse(403, "Solo admin.");
        $id = $data['id_usuario'] ?? null;
        if (!$id) sendResponse(400, "ID necesario.");

        $consulta = $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
        $consulta->execute([$id]);
        sendResponse(200, "Usuario eliminado.");
        break;

    case 'get_profile':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        $consulta = $pdo->prepare("SELECT id_usuario, nombre_usuario, correo, rol, telefono, residencia FROM usuarios WHERE id_usuario = ?");
        $consulta->execute([$_SESSION['user_id']]);
        sendResponse(200, "Tu perfil", $consulta->fetch());
        break;

    case 'update_profile':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        $id = $_SESSION['user_id'];
        $email = $data['email'] ?? null;
        $telefono = $data['telefono'] ?? null;
        $res = $data['residencia'] ?? null;
        $newPass = $data['password'] ?? null;

        if (!$email) sendResponse(400, "Email es obligatorio.");

        if ($newPass) {
            $hashed = password_hash($newPass, PASSWORD_BCRYPT);
            $consulta = $pdo->prepare("UPDATE usuarios SET correo = ?, telefono = ?, residencia = ?, contrasenia = ? WHERE id_usuario = ?");
            $consulta->execute([$email, $telefono, $res, $hashed, $id]);
        } else {
            $consulta = $pdo->prepare("UPDATE usuarios SET correo = ?, telefono = ?, residencia = ? WHERE id_usuario = ?");
            $consulta->execute([$email, $telefono, $res, $id]);
        }
        sendResponse(200, "Perfil actualizado.");
        break;

    case 'get_notifications':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        try {
            $consulta = $pdo->prepare("SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 10");
            $consulta->execute([$_SESSION['user_id']]);
            $notif = $consulta->fetchAll();
            foreach ($notif as &$n) {
                if (!empty($n['fecha_creacion'])) {
                    $n['fecha_creacion'] = parseTimestamp($n['fecha_creacion']);
                }
            }
            sendResponse(200, "Notificaciones", $notif);
        } catch (PDOException $e) {
            sendResponse(200, "Notificaciones", []);
        }
        break;

    case 'read_notifications':
        if (!isset($_SESSION['user_id'])) sendResponse(401, "No logueado.");
        $consulta = $pdo->prepare("UPDATE notificaciones SET leida = 1 WHERE id_usuario = ?");
        $consulta->execute([$_SESSION['user_id']]);
        sendResponse(200, "Marcadas como leídas.");
        break;

    default:
        sendResponse(405, "Método no permitido.");
        break;
}
?>
