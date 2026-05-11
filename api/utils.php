<?php
// Evitar que PHP muestre errores por defecto en formato HTML (para no romper el JSON del frontend)
ini_set('display_errors', 0);

// Capturar cualquier excepción (como errores de base de datos) y devolverla en JSON
set_exception_handler(function($e) {
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode([
        "status" => 500,
        "message" => "Error interno: " . $e->getMessage(),
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
?>
