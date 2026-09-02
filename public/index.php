<?php
declare(strict_types=1);
header('Content-Type: text/html; charset=UTF-8');
?><!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#111827">
  <title>OYYA — عالمك حولك</title>
  <link rel="manifest" href="/manifest.webmanifest">
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1020;color:#f8fafc;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wrap{width:min(92vw,760px);padding:48px 28px;text-align:center}.brand{font-size:clamp(54px,10vw,96px);font-weight:900;letter-spacing:.04em}.tag{font-size:clamp(24px,4vw,38px);font-weight:800;margin-top:8px}.status{margin:36px auto 0;padding:18px 22px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(255,255,255,.06);max-width:560px;line-height:1.8;color:#cbd5e1}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;margin-left:8px;box-shadow:0 0 18px #22c55e}
  </style>
</head>
<body>
  <main class="wrap">
    <div class="brand">OYYA</div>
    <div class="tag">عالمك حولك</div>
    <div class="status"><span class="dot"></span>البنية الحية متصلة وجاهزة للبناء.</div>
  </main>
  <script>if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}</script>
</body>
</html>
