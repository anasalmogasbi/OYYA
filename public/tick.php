<?php
declare(strict_types=1);
require __DIR__.'/app.php';
require __DIR__.'/world.php';
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok'=>true,'ts'=>time()],JSON_UNESCAPED_UNICODE);
