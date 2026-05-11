<?php
require_once 'api/db.php';
$pdo = getDBConnection();
$stmt = $pdo->query("DESCRIBE gatos");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
