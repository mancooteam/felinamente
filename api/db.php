<?php

function getDBConnection() {
    $host = getenv('DB_HOST');
    $port = getenv('DB_PORT');
    $db   = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASS');

    $ca_content = getenv('MYSQL_ATTR_SSL_CA');

    if (!$ca_content) {
        die("Error Crítico: No se encontró la variable MYSQL_ATTR_SSL_CA en el entorno.");
    }

    $ca_path = tempnam(sys_get_temp_dir(), 'db-ca-cert');
    file_put_contents($ca_path, $ca_content);

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_SSL_CA => $ca_path,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
        return $pdo;
    } catch (PDOException $e) {
        die("Error de conexión SQL: " . $e->getMessage());
    }
}
?>