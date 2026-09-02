<?php
declare(strict_types=1);

ob_start();
require __DIR__ . '/entry.php';
$html = (string)ob_get_clean();

$view=preg_replace('/[^a-z_]/','',(string)($_GET['view']??'feed')) ?: 'feed';
$logged=!empty($_SESSION['oyya_uid']);
$headInject = "\n<link rel=\"stylesheet\" href=\"/oyya-ui.css?v=3\">\n";

$top='';
if($logged){
  $top=<<<'HTML'
<div class="oyya-reference-top">
  <div class="oyya-reference-brand"><b>OYYA</b><small>عالمك حولك</small></div>
  <div class="oyya-top-actions">
    <a class="oyya-circle" href="/?view=explore" aria-label="بحث">⌕</a>
    <a class="oyya-circle" href="/?view=notifications" aria-label="الإشعارات">♡</a>
    <a class="oyya-circle avatar" href="/?view=profile" aria-label="الملف الشخصي">أ</a>
  </div>
</div>
HTML;
}

$bodyInject = <<<'HTML'
<div class="oyya-bottom-shell" id="oyyaBottomShell" aria-label="تنقل OYYA">
  <nav class="oyya-bottom-nav" id="oyyaSmartNav">
    <a class="oyya-nav-item" data-view="feed" href="/?view=feed"><span class="oyya-nav-icon">⌂</span><span>الرئيسية</span></a>
    <a class="oyya-nav-item" data-view="reels" href="/?view=reels"><span class="oyya-nav-icon">▶</span><span>ريلز</span></a>
    <a class="oyya-nav-item" data-view="map" href="/?view=map"><span class="oyya-nav-icon">⌖</span><span>حولك</span></a>
    <a class="oyya-nav-item oyya-smart-slot" data-view="explore" href="/?view=explore"><span class="oyya-nav-icon">✦</span><span class="oyya-smart-label">اكتشف</span></a>
    <button class="oyya-nav-item oyya-radio-nav" type="button" id="oyyaRadioNav"><span class="oyya-nav-icon">♫</span><span>تشغيل</span></button>
    <button class="oyya-nav-item" type="button" id="oyyaMoreButton" aria-expanded="false"><span class="oyya-nav-icon">•••</span><span>المزيد</span></button>
  </nav>
</div>
<div class="oyya-more-backdrop" id="oyyaMoreBackdrop" hidden></div>
<section class="oyya-more-sheet" id="oyyaMoreSheet" aria-hidden="true" aria-label="المزيد من OYYA">
  <div class="oyya-sheet-grip" aria-hidden="true"></div>
  <div class="oyya-sheet-head"><div><strong>عالم OYYA</strong><small>المسارات الإضافية داخل العالم</small></div><button type="button" id="oyyaMoreClose" aria-label="إغلاق">×</button></div>
  <div class="oyya-more-grid" id="oyyaMoreGrid">
    <a href="/?view=people" data-view="people"><b>الناس</b><small>حولك، عمل، دراسة، اهتمامات والمواضيع العامة والتعارف</small></a>
    <a href="/?view=explore" data-view="explore"><b>اكتشف</b><small>بحث وترند وفرص ومجتمعات</small></a>
    <a href="/?view=nearby" data-view="nearby"><b>منشورات حولك</b><small>محتوى موزع بالمسافة دون كشف موقع الأشخاص</small></a>
    <a href="/?view=communities" data-view="communities"><b>المجتمعات</b><small>دوائر الاهتمام والمجموعات</small></a>
    <a href="/?view=events" data-view="events"><b>الأحداث</b><small>ما يحدث الآن والقادم</small></a>
    <a href="/?view=opportunities" data-view="opportunities"><b>الفرص والعمل</b><small>احتياجات، مهارات وفرص قريبة</small></a>
    <a href="/?view=games" data-view="games"><b>القعدة والألعاب</b><small>طاولات OYYA وتفاعل مشترك</small></a>
    <a href="/?view=pages" data-view="pages"><b>الصفحات والأعمال</b><small>متاجر، خدمات ومعارض دائمة</small></a>
    <a href="/?view=messages" data-view="messages"><b>الرسائل</b><small>تواصل مباشر بسيط</small></a>
    <a href="/?view=notifications" data-view="notifications"><b>النشاط</b><small>طلبات وتفاعلات وإشعارات</small></a>
    <a href="/?view=saved" data-view="saved"><b>المحفوظات</b><small>ما حفظته للرجوع إليه</small></a>
    <a href="/?view=albums" data-view="albums"><b>الألبومات</b><small>صور ووسائط منظمة</small></a>
    <a href="/?view=memories" data-view="memories"><b>الذكريات</b><small>تاريخك داخل OYYA</small></a>
    <a href="/?view=profile" data-view="profile"><b>ملفي</b><small>مهاراتي، اهتماماتي، أقدم وأبحث عن</small></a>
    <a href="/?view=ads" data-view="ads"><b>الإعلانات</b><small>إنشاء وإدارة الحملات التجريبية</small></a>
  </div>
</section>
<script src="/oyya-ui.js?v=3" defer></script>
HTML;

if (stripos($html, '</head>') !== false) $html = str_ireplace('</head>', $headInject . '</head>', $html);
$html=preg_replace('/<body([^>]*)>/i','<body$1 class="oyya-view-'.htmlspecialchars($view,ENT_QUOTES,'UTF-8').'">'.$top,$html,1) ?? $html;
if($logged && stripos($html,'<header class="top">')!==false){
  $html=str_replace('<header class="top">','<header class="top oyya-legacy-top">',$html);
}
if (stripos($html, '</body>') !== false && $logged) $html = str_ireplace('</body>', $bodyInject . '</body>', $html);
echo $html;
