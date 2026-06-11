<?php
// Evitar que PHP muestre errores por defecto en formato HTML (para no romper el JSON del frontend)
ini_set('display_errors', 0);
date_default_timezone_set('UTC');

// Capturar cualquier excepción (como errores de base de datos) y devolverla en JSON
set_exception_handler(function($e) {
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode([
        "status" => 500,
        "message" => "Excepcion interna: " . $e->getMessage(),
        "data" => null
    ]);
    exit();
});

// Capturar advertencias (Warnings) de PHP que puedan romper el JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode([
        "status" => 500,
        "message" => "Error de servidor (Warning): " . $errstr,
        "data" => null
    ]);
    exit();
});

function sendResponse($status, $message, $data = null) {
    header("Content-Type: application/json");
    http_response_code($status);
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}

function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}

// Inicializar sesión y rellenarla desde las cabeceras HTTP si están presentes
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$userIdHeader = $_SERVER['HTTP_X_USER_ID'] ?? null;
$roleHeader = $_SERVER['HTTP_X_USER_ROLE'] ?? 'guest';
$usernameHeader = $_SERVER['HTTP_X_USER_USERNAME'] ?? null;

if (function_exists('getallheaders')) {
    $headers = getallheaders();
    if (!$userIdHeader && isset($headers['X-User-Id'])) {
        $userIdHeader = $headers['X-User-Id'];
    }
    if (!$userIdHeader && isset($headers['x-user-id'])) {
        $userIdHeader = $headers['x-user-id'];
    }
    if ($roleHeader === 'guest' && isset($headers['X-User-Role'])) {
        $roleHeader = $headers['X-User-Role'];
    }
    if ($roleHeader === 'guest' && isset($headers['x-user-role'])) {
        $roleHeader = $headers['x-user-role'];
    }
    if (!$usernameHeader && isset($headers['X-User-Username'])) {
        $usernameHeader = $headers['X-User-Username'];
    }
    if (!$usernameHeader && isset($headers['x-user-username'])) {
        $usernameHeader = $headers['x-user-username'];
    }
}

if ($userIdHeader !== null) {
    $_SESSION['user_id'] = $userIdHeader;
    $_SESSION['role'] = $roleHeader;
    $_SESSION['username'] = $usernameHeader;
}
?>
