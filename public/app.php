<?php
declare(strict_types=1);

session_start();

const OYYA_MAX_USERS = 20;
const OYYA_DATA_DIR = __DIR__ . '/data';
const OYYA_USERS_FILE = OYYA_DATA_DIR . '/users.json';

function oyya_boot(): void {
    if (!is_dir(OYYA_DATA_DIR)) {
        mkdir(OYYA_DATA_DIR, 0755, true);
    }
    if (!file_exists(OYYA_USERS_FILE)) {
        file_put_contents(OYYA_USERS_FILE, "[]", LOCK_EX);
    }
}

function oyya_users(): array {
    oyya_boot();
    $raw = file_get_contents(OYYA_USERS_FILE);
    $users = json_decode($raw ?: '[]', true);
    return is_array($users) ? $users : [];
}

function oyya_save_users(array $users): bool {
    oyya_boot();
    return file_put_contents(OYYA_USERS_FILE, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

function oyya_normalize_phone(string $phone): string {
    $phone = preg_replace('/[^0-9+]/', '', trim($phone)) ?? '';
    if (str_starts_with($phone, '00218')) $phone = '+218' . substr($phone, 5);
    if (str_starts_with($phone, '218')) $phone = '+' . $phone;
    return $phone;
}

function oyya_valid_libyan_phone(string $phone): bool {
    return (bool)preg_match('/^(?:\+2189|09)[0-9]{8}$/', $phone);
}

function oyya_current_user(): ?array {
    if (empty($_SESSION['oyya_uid'])) return null;
    foreach (oyya_users() as $user) {
        if (($user['id'] ?? '') === $_SESSION['oyya_uid']) return $user;
    }
    return null;
}

function oyya_register(array $input): array {
    $name = trim((string)($input['name'] ?? ''));
    $phone = oyya_normalize_phone((string)($input['phone'] ?? ''));
    $password = (string)($input['password'] ?? '');
    $city = trim((string)($input['city'] ?? ''));

    if (mb_strlen($name) < 2) return [false, 'اكتب اسمك الحقيقي.'];
    if (!oyya_valid_libyan_phone($phone)) return [false, 'اكتب رقم هاتف ليبي صحيح.'];
    if (strlen($password) < 6) return [false, 'كلمة المرور يجب ألا تقل عن 6 خانات.'];
    if ($city === '') return [false, 'اختر مدينتك.'];

    $users = oyya_users();
    if (count($users) >= OYYA_MAX_USERS) return [false, 'اكتملت مساحة الاختبار الحالية (20 مستخدمًا).'];
    foreach ($users as $user) {
        if (($user['phone'] ?? '') === $phone) return [false, 'هذا الرقم مسجل بالفعل.'];
    }

    $id = bin2hex(random_bytes(8));
    $users[] = [
        'id' => $id,
        'name' => $name,
        'phone' => $phone,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'city' => $city,
        'skills' => '',
        'interests' => '',
        'study_work' => '',
        'offers' => '',
        'seeks' => '',
        'created_at' => date(DATE_ATOM),
    ];
    if (!oyya_save_users($users)) return [false, 'تعذر حفظ الحساب الآن.'];
    $_SESSION['oyya_uid'] = $id;
    session_regenerate_id(true);
    return [true, 'تم إنشاء الحساب.'];
}

function oyya_login(array $input): array {
    $phone = oyya_normalize_phone((string)($input['phone'] ?? ''));
    $password = (string)($input['password'] ?? '');
    foreach (oyya_users() as $user) {
        if (($user['phone'] ?? '') === $phone && password_verify($password, (string)($user['password_hash'] ?? ''))) {
            $_SESSION['oyya_uid'] = $user['id'];
            session_regenerate_id(true);
            return [true, 'تم تسجيل الدخول.'];
        }
    }
    return [false, 'رقم الهاتف أو كلمة المرور غير صحيحة.'];
}

function oyya_logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}
