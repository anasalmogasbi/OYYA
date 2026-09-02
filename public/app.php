<?php
declare(strict_types=1);
session_start();

const OYYA_MAX_USERS = 20;
const OYYA_DATA_DIR = __DIR__ . '/data';
const OYYA_SYSTEM_USER_ID = 'oyya-system';

function oyya_path(string $name): string { return OYYA_DATA_DIR . '/' . $name . '.json'; }
function oyya_boot(): void {
    if (!is_dir(OYYA_DATA_DIR)) mkdir(OYYA_DATA_DIR,0755,true);
    foreach(['users','posts','comments','likes','follows','saves','entities','memberships','notifications','messages'] as $f){
        if(!file_exists(oyya_path($f))) file_put_contents(oyya_path($f),'[]',LOCK_EX);
    }
}
function oyya_read(string $name): array { oyya_boot(); $v=json_decode((string)@file_get_contents(oyya_path($name)),true); return is_array($v)?$v:[]; }
function oyya_write(string $name,array $rows): bool { oyya_boot(); return file_put_contents(oyya_path($name),json_encode(array_values($rows),JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT),LOCK_EX)!==false; }
function oyya_id(): string { return bin2hex(random_bytes(8)); }
function oyya_now(): string { return date(DATE_ATOM); }
function oyya_users(): array { return oyya_read('users'); }
function oyya_test_users(): array { return array_values(array_filter(oyya_users(),fn($u)=>empty($u['system']))); }
function oyya_save_users(array $u): bool { return oyya_write('users',$u); }
function oyya_user_by_id(string $id): ?array { foreach(oyya_users() as $u) if(($u['id']??'')===$id)return $u; return null; }
function oyya_normalize_phone(string $phone): string { $phone=preg_replace('/[^0-9+]/','',trim($phone))??''; if(str_starts_with($phone,'00218'))$phone='+218'.substr($phone,5); if(str_starts_with($phone,'218'))$phone='+'.$phone; return $phone; }
function oyya_valid_libyan_phone(string $phone): bool { return (bool)preg_match('/^(?:\+2189|09)[0-9]{8}$/',$phone); }
function oyya_current_user(): ?array { return empty($_SESSION['oyya_uid'])?null:oyya_user_by_id((string)$_SESSION['oyya_uid']); }
function oyya_seed_system_user(): void {
    $users=oyya_users();
    $ids=array_column($users,'id');
    if(!in_array(OYYA_SYSTEM_USER_ID,$ids,true)){
      $users[]=['id'=>OYYA_SYSTEM_USER_ID,'name'=>'OYYA','phone'=>'','password_hash'=>'','city'=>'ليبيا','skills'=>'OYYA','interests'=>'ليبيا، المجتمع، الفرص، الأحداث','study_work'=>'الحساب الرسمي لـ OYYA','hobbies'=>'','offers'=>'اكتشاف ما يحدث حولك','seeks'=>'','bio'=>'الحساب الرسمي داخل عالم OYYA.','location_visibility'=>'hidden','verified'=>true,'system'=>true,'created_at'=>oyya_now()];
    }
    $demo=[
      ['demo-sara','سارة الورفلي','بنغازي','مديرة تسويق رقمي','استراتيجية المحتوى، الحملات، بناء العلامات','التسويق، ريادة الأعمال، التقنية','أساعد العلامات الليبية على بناء حضور رقمي أقوى.','تصوير، قهوة مختصة، سفر','استشارات تسويق وحملات رقمية','شراكات ومشاريع إبداعية','https://i.pravatar.cc/300?img=47','Nova Creative Lab','جامعة بنغازي','5 سنوات'],
      ['demo-mohamed','محمد السنوسي','بنغازي','مهندس برمجيات Full‑Stack','Laravel، JavaScript، APIs، PWA','البرمجة، الذكاء الاصطناعي، المنتجات','أبني منتجات ويب سريعة وبسيطة تحل مشاكل حقيقية.','ألعاب، شطرنج، قراءة','تطوير منصات وتطبيقات ويب','فريق منتج أو مشروع تقني','https://i.pravatar.cc/300?img=12','Freelance / Product Builder','جامعة بنغازي','6 سنوات'],
      ['demo-lina','لينا القماطي','طرابلس','مصممة هوية وتجربة مستخدم','Branding، UI/UX، Design Systems','التصميم، الموضة، الثقافة','أحب تحويل الأفكار المعقدة إلى تجارب بسيطة وواضحة.','رسم، تصوير، معارض','هوية بصرية وتصميم منتجات','تعاون مع شركات ناشئة','https://i.pravatar.cc/300?img=32','Studio L','جامعة طرابلس','4 سنوات'],
      ['demo-ahmed','أحمد الجبالي','مصراتة','رائد أعمال في التجارة الإلكترونية','E‑commerce، مبيعات، عمليات','التجارة، اللوجستيات، الاستثمار','أدير متجرًا إلكترونيًا وأهتم ببناء عمليات بيع قابلة للتوسع.','سيارات، جيم، سفر','خبرة في التجارة والتشغيل','فرص توسع وشركاء توزيع','https://i.pravatar.cc/300?img=68','Jebali Commerce','جامعة مصراتة','7 سنوات'],
      ['demo-rima','ريما العبيدي','بنغازي','مهندسة معمارية ومصممة داخلية','Architecture، Interior Design، 3D','العقار، الفن، التصميم','أصمم مساحات عملية بهوية معاصرة تناسب الحياة اليومية.','رسم، ديكور، موسيقى','تصميم معماري وداخلي','مشاريع سكنية وتجارية','https://i.pravatar.cc/300?img=44','Rima Studio','جامعة بنغازي','5 سنوات'],
      ['demo-yousef','يوسف الزوي','بنغازي','مصور وصانع محتوى','Photography، Video، Editing','الإعلام، السفر، القصص','أوثق الناس والأماكن بطريقة تحكي قصة حقيقية.','كرة قدم، رحلات، سينما','تصوير تجاري ومحتوى','علامات تحتاج محتوى مستمر','https://i.pravatar.cc/300?img=11','Independent Creator','المعهد العالي للإعلام','8 سنوات'],
      ['demo-nour','نور الترهوني','طرابلس','محامية ومستشارة أعمال','قانون شركات، عقود، تفاوض','الأعمال، الاستثمار، التشريعات','أساعد رواد الأعمال على فهم العقود والقرارات القانونية قبل التوقيع.','قراءة، بودكاست، سفر','استشارات قانونية للأعمال','شركات ناشئة تحتاج تنظيم عقودها','https://i.pravatar.cc/300?img=49','مكتب الترهوني','جامعة طرابلس','7 سنوات'],
      ['demo-omar','عمر الفيتوري','بنغازي','مختص موارد بشرية وتوظيف','Recruitment، HR، Career Coaching','الوظائف، التعليم، التطوير','أربط الشركات بالكفاءات وأساعد الشباب في بناء مسار مهني أوضح.','جري، كتب، تطوع','توظيف ومراجعة ملفات مهنية','مواهب وشركات توظف','https://i.pravatar.cc/300?img=5','People First Libya','جامعة بنغازي','6 سنوات']
    ];
    foreach($demo as $d){
      $existingIndex=null; foreach($users as $i=>$u)if(($u['id']??'')===$d[0]){$existingIndex=$i;break;}
      $row=['id'=>$d[0],'name'=>$d[1],'phone'=>'','password_hash'=>'','city'=>$d[2],'headline'=>$d[3],'skills'=>$d[4],'interests'=>$d[5],'study_work'=>$d[11],'hobbies'=>$d[7],'offers'=>$d[8],'seeks'=>$d[9],'bio'=>$d[6],'avatar'=>$d[10],'company'=>$d[11],'education'=>$d[12],'experience'=>$d[13],'location_visibility'=>'city','verified'=>true,'system'=>true,'demo_profile'=>true,'created_at'=>oyya_now()];
      if($existingIndex===null)$users[]=$row; else $users[$existingIndex]=array_merge($users[$existingIndex],$row);
    }
    oyya_save_users($users);
}
function oyya_register(array $in): array {
    $name=trim((string)($in['name']??''));$phone=oyya_normalize_phone((string)($in['phone']??''));$pw=(string)($in['password']??'');$city=trim((string)($in['city']??''));
    if(mb_strlen($name)<2)return[false,'اكتب اسمك الحقيقي.']; if(!oyya_valid_libyan_phone($phone))return[false,'اكتب رقم هاتف ليبي صحيح.']; if(strlen($pw)<6)return[false,'كلمة المرور يجب ألا تقل عن 6 خانات.']; if($city==='')return[false,'اختر مدينتك.'];
    $users=oyya_users(); if(count(oyya_test_users())>=OYYA_MAX_USERS)return[false,'اكتملت مساحة الاختبار الحالية (20 مستخدمًا).']; foreach($users as $u)if(($u['phone']??'')===$phone)return[false,'هذا الرقم مسجل بالفعل.'];
    $id=oyya_id();$users[]=['id'=>$id,'name'=>$name,'phone'=>$phone,'password_hash'=>password_hash($pw,PASSWORD_DEFAULT),'city'=>$city,'skills'=>'','interests'=>'','study_work'=>'','hobbies'=>'','offers'=>'','seeks'=>'','bio'=>'','location_visibility'=>'approx','verified'=>false,'system'=>false,'created_at'=>oyya_now()];
    if(!oyya_save_users($users))return[false,'تعذر حفظ الحساب الآن.'];$_SESSION['oyya_uid']=$id;session_regenerate_id(true);return[true,'تم إنشاء الحساب.'];
}
function oyya_login(array $in): array { $p=oyya_normalize_phone((string)($in['phone']??''));$pw=(string)($in['password']??'');foreach(oyya_users() as $u){if(!empty($u['system']))continue;if(($u['phone']??'')===$p&&password_verify($pw,(string)($u['password_hash']??''))){$_SESSION['oyya_uid']=$u['id'];session_regenerate_id(true);return[true,'تم تسجيل الدخول.'];}}return[false,'رقم الهاتف أو كلمة المرور غير صحيحة.']; }
function oyya_logout(): void { $_SESSION=[]; if(ini_get('session.use_cookies')){$p=session_get_cookie_params();setcookie(session_name(),'',time()-42000,$p['path'],$p['domain'],$p['secure'],$p['httponly']);}session_destroy(); }
function oyya_profile_update(string $uid,array $in): array { $users=oyya_users(); foreach($users as &$u){if(($u['id']??'')===$uid){foreach(['skills','interests','study_work','hobbies','offers','seeks','bio'] as $k)$u[$k]=trim((string)($in[$k]??''));$u['location_visibility']=in_array(($in['location_visibility']??'approx'),['hidden','city','approx'],true)?$in['location_visibility']:'approx';oyya_save_users($users);return[true,'تم حفظ ملفك.'];}}return[false,'الحساب غير موجود.']; }
function oyya_notify(string $uid,string $text,string $type='activity'): void { $n=oyya_read('notifications');$n[]=['id'=>oyya_id(),'user_id'=>$uid,'text'=>$text,'type'=>$type,'read'=>false,'created_at'=>oyya_now()];oyya_write('notifications',$n); }
function oyya_create_post(string $uid,array $in): array { $text=trim((string)($in['text']??'')); if($text==='')return[false,'اكتب شيئًا للنشر.'];$p=oyya_read('posts');$p[]=['id'=>oyya_id(),'user_id'=>$uid,'text'=>$text,'nearby'=>!empty($in['nearby']),'kind'=>(string)($in['kind']??'post'),'created_at'=>oyya_now()];oyya_write('posts',$p);return[true,'تم النشر.']; }
function oyya_toggle_like(string $uid,string $post): void { $rows=oyya_read('likes');$found=false;$out=[];foreach($rows as $r){if(($r['user_id']??'')===$uid&&($r['post_id']??'')===$post){$found=true;continue;}$out[]=$r;}if(!$found){$out[]=['user_id'=>$uid,'post_id'=>$post,'created_at'=>oyya_now()];foreach(oyya_read('posts') as $p)if(($p['id']??'')===$post&&($p['user_id']??'')!==$uid)oyya_notify((string)$p['user_id'],'أعجب شخص بمنشورك.','like');}oyya_write('likes',$out); }
function oyya_add_comment(string $uid,string $post,string $text): array { $text=trim($text);if($text==='')return[false,'اكتب تعليقًا.'];$c=oyya_read('comments');$c[]=['id'=>oyya_id(),'post_id'=>$post,'user_id'=>$uid,'text'=>$text,'created_at'=>oyya_now()];oyya_write('comments',$c);foreach(oyya_read('posts') as $p)if(($p['id']??'')===$post&&($p['user_id']??'')!==$uid)oyya_notify((string)$p['user_id'],'لديك تعليق جديد على منشورك.','comment');return[true,'تم التعليق.']; }
function oyya_toggle_follow(string $uid,string $target): void { if($uid===$target)return;$r=oyya_read('follows');$found=false;$out=[];foreach($r as $x){if(($x['follower_id']??'')===$uid&&($x['target_id']??'')===$target){$found=true;continue;}$out[]=$x;}if(!$found){$out[]=['follower_id'=>$uid,'target_id'=>$target,'created_at'=>oyya_now()];oyya_notify($target,'بدأ شخص بمتابعتك.','follow');}oyya_write('follows',$out); }
function oyya_toggle_save(string $uid,string $post): void { $r=oyya_read('saves');$f=false;$o=[];foreach($r as $x){if(($x['user_id']??'')===$uid&&($x['post_id']??'')===$post){$f=true;continue;}$o[]=$x;}if(!$f)$o[]=['user_id'=>$uid,'post_id'=>$post,'created_at'=>oyya_now()];oyya_write('saves',$o); }
function oyya_create_entity(string $uid,array $in): array { $type=(string)($in['type']??'');$name=trim((string)($in['name']??'')); if(!in_array($type,['business','community','event','opportunity','place'],true)||mb_strlen($name)<2)return[false,'أكمل بيانات الإنشاء.'];$e=oyya_read('entities');$e[]=['id'=>oyya_id(),'owner_id'=>$uid,'type'=>$type,'name'=>$name,'description'=>trim((string)($in['description']??'')),'city'=>trim((string)($in['city']??'')),'address'=>trim((string)($in['address']??'')),'contact'=>trim((string)($in['contact']??'')),'created_at'=>oyya_now()];oyya_write('entities',$e);return[true,'تم الإنشاء.']; }
function oyya_toggle_membership(string $uid,string $eid): void { $r=oyya_read('memberships');$f=false;$o=[];foreach($r as $x){if(($x['user_id']??'')===$uid&&($x['entity_id']??'')===$eid){$f=true;continue;}$o[]=$x;}if(!$f)$o[]=['user_id'=>$uid,'entity_id'=>$eid,'created_at'=>oyya_now()];oyya_write('memberships',$o); }
function oyya_send_message(string $uid,string $to,string $text): array { $text=trim($text);if($text===''||!oyya_user_by_id($to)||$to===$uid)return[false,'تعذر إرسال الرسالة.'];$m=oyya_read('messages');$m[]=['id'=>oyya_id(),'from_id'=>$uid,'to_id'=>$to,'text'=>$text,'created_at'=>oyya_now()];oyya_write('messages',$m);oyya_notify($to,'لديك رسالة جديدة.','message');return[true,'تم إرسال الرسالة.']; }
function oyya_is_following(string $uid,string $target): bool { foreach(oyya_read('follows') as $x)if(($x['follower_id']??'')===$uid&&($x['target_id']??'')===$target)return true;return false; }
function oyya_is_saved(string $uid,string $post): bool { foreach(oyya_read('saves') as $x)if(($x['user_id']??'')===$uid&&($x['post_id']??'')===$post)return true;return false; }
function oyya_post_likes(string $post): int { $n=0;foreach(oyya_read('likes') as $x)if(($x['post_id']??'')===$post)$n++;return $n; }
function oyya_post_comments(string $post): array { return array_values(array_filter(oyya_read('comments'),fn($x)=>($x['post_id']??'')===$post)); }

oyya_boot();
oyya_seed_system_user();
