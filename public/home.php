<?php
declare(strict_types=1);

ob_start();
require __DIR__ . '/index.php';
$html = (string)ob_get_clean();

$headInject = "\n<link rel=\"stylesheet\" href=\"/oyya-ui.css?v=1\">\n";
$bodyInject = <<<'HTML'

<div class="oyya-bottom-shell" id="oyyaBottomShell" aria-label="تنقل OYYA">
  <nav class="oyya-bottom-nav" id="oyyaSmartNav">
    <a class="oyya-nav-item" data-view="feed" href="/?view=feed"><span class="oyya-nav-icon">⌂</span><span>الرئيسية</span></a>
    <a class="oyya-nav-item" data-view="nearby" href="/?view=nearby"><span class="oyya-nav-icon">◎</span><span>حولك</span></a>
    <a class="oyya-nav-item" data-view="reels" href="/?view=reels"><span class="oyya-nav-icon">▶</span><span>Reels</span></a>
    <button class="oyya-nav-item oyya-radio-nav" type="button" id="oyyaRadioNav"><span class="oyya-nav-icon">♫</span><span>تشغيل</span></button>
    <button class="oyya-nav-item" type="button" id="oyyaMoreButton" aria-expanded="false"><span class="oyya-nav-icon">•••</span><span>المزيد</span></button>
  </nav>
</div>

<div class="oyya-more-backdrop" id="oyyaMoreBackdrop" hidden></div>
<section class="oyya-more-sheet" id="oyyaMoreSheet" aria-hidden="true" aria-label="المزيد من OYYA">
  <div class="oyya-sheet-grip" aria-hidden="true"></div>
  <div class="oyya-sheet-head"><div><strong>عالم OYYA</strong><small>كل ما تحتاجه في مكان واحد</small></div><button type="button" id="oyyaMoreClose" aria-label="إغلاق">×</button></div>
  <div class="oyya-more-grid" id="oyyaMoreGrid">
    <a href="/?view=people" data-view="people"><b>الأشخاص</b><small>اكتشف ناسًا قريبين واهتمامات مشتركة</small></a>
    <a href="/?view=map" data-view="map"><b>الخريطة</b><small>أماكن وأعمال وأحداث حولك</small></a>
    <a href="/?view=communities" data-view="communities"><b>المجتمعات</b><small>مجموعات ودوائر اهتمام</small></a>
    <a href="/?view=events" data-view="events"><b>الأحداث</b><small>ما الذي يحدث الآن</small></a>
    <a href="/?view=opportunities" data-view="opportunities"><b>الفرص والعمل</b><small>فرص، خدمات، احتياجات</small></a>
    <a href="/?view=games" data-view="games"><b>الألعاب</b><small>طاولات وتحديات مشتركة</small></a>
    <a href="/?view=pages" data-view="pages"><b>الصفحات والأعمال</b><small>كيانات ومتاجر ومعارض</small></a>
    <a href="/?view=messages" data-view="messages"><b>الرسائل</b><small>تواصل مباشر</small></a>
    <a href="/?view=notifications" data-view="notifications"><b>النشاط</b><small>تفاعلاتك وإشعاراتك</small></a>
    <a href="/?view=saved" data-view="saved"><b>المحفوظات</b><small>ارجع لما حفظته</small></a>
    <a href="/?view=albums" data-view="albums"><b>الألبومات</b><small>صور وذكريات منظّمة</small></a>
    <a href="/?view=explore" data-view="explore"><b>استكشف</b><small>ترند واكتشاف جديد</small></a>
    <a href="/?view=profile" data-view="profile"><b>ملفي</b><small>هويتك واهتماماتك ومهاراتك</small></a>
    <a href="/?view=ads" data-view="ads"><b>الإعلانات</b><small>حملات ممولة داخل العالم</small></a>
  </div>
</section>
<script src="/oyya-ui.js?v=1" defer></script>
HTML;

if (stripos($html, '</head>') !== false) {
    $html = str_ireplace('</head>', $headInject . '</head>', $html);
}
if (stripos($html, '</body>') !== false) {
    $html = str_ireplace('</body>', $bodyInject . '</body>', $html);
}

echo $html;
