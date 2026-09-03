<?php
declare(strict_types=1);
require __DIR__.'/app.php';
require __DIR__.'/world.php';
header('Content-Type: application/json; charset=utf-8');
$user=oyya_current_user();if(!$user){http_response_code(401);echo json_encode(['ok'=>false,'message'=>'غير مسجل']);exit;}$uid=(string)$user['id'];
foreach(['reel_likes','reel_comments','reel_saves'] as $f)if(!file_exists(oyya_path($f)))oyya_write($f,[]);
function rout(array $v): never {echo json_encode($v,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function reel_upload_error(int $code): string {return match($code){UPLOAD_ERR_INI_SIZE,UPLOAD_ERR_FORM_SIZE=>'حجم الفيديو أكبر من الحد الذي يسمح به السيرفر حاليًا.',UPLOAD_ERR_PARTIAL=>'انقطع رفع الفيديو قبل اكتماله. حاول مرة أخرى.',UPLOAD_ERR_NO_FILE=>'اختر فيديو أولًا.',UPLOAD_ERR_NO_TMP_DIR=>'مجلد الرفع المؤقت غير متاح على السيرفر.',UPLOAD_ERR_CANT_WRITE=>'تعذر كتابة الفيديو على السيرفر.',UPLOAD_ERR_EXTENSION=>'أوقف السيرفر الرفع بسبب إضافة PHP.',default=>'تعذر رفع الفيديو.'};}
function oyya_upload_reel_file(string $uid,array $file): array {
 $err=(int)($file['error']??UPLOAD_ERR_NO_FILE);if($err!==UPLOAD_ERR_OK)return[false,reel_upload_error($err)];
 $size=(int)($file['size']??0);$max=1024*1024*1024;if($size<=0)return[false,'ملف الفيديو فارغ.'];if($size>$max)return[false,'الحد الأقصى للريل حاليًا 1GB.'];
 $tmp=(string)($file['tmp_name']??'');if(!is_uploaded_file($tmp))return[false,'رفع الفيديو غير صالح.'];
 $finfo=new finfo(FILEINFO_MIME_TYPE);$mime=(string)$finfo->file($tmp);$allowed=['video/mp4'=>'mp4','video/webm'=>'webm','video/quicktime'=>'mov','video/x-m4v'=>'m4v','application/octet-stream'=>'mp4'];
 if(!isset($allowed[$mime]))return[false,'صيغة الفيديو غير مدعومة. استخدم MP4 أو MOV أو WebM.'];
 $ext=$allowed[$mime];$original=strtolower((string)pathinfo((string)($file['name']??''),PATHINFO_EXTENSION));if($mime==='application/octet-stream'&&!in_array($original,['mp4','m4v'],true))return[false,'تعذر التحقق من صيغة الفيديو. استخدم MP4.'];if($original==='m4v')$ext='m4v';
 $id=oyya_id();$dir=__DIR__.'/media';if(!is_dir($dir)&&!mkdir($dir,0775,true))return[false,'تعذر تجهيز مجلد الفيديوهات.'];$name=$id.'.'.$ext;$dest=$dir.'/'.$name;if(!move_uploaded_file($tmp,$dest))return[false,'تعذر حفظ الفيديو بعد رفعه.'];
 $rows=oyya_read('media');$rows[]=['id'=>$id,'user_id'=>$uid,'kind'=>'reel','mime'=>$mime==='application/octet-stream'?'video/mp4':$mime,'url'=>'/media/'.$name,'size'=>$size,'created_at'=>oyya_now()];oyya_write('media',$rows);return[true,$id];
}
function reel_exists(string $rid): bool {foreach(oyya_read('reels') as $r)if(($r['id']??'')===$rid)return true;return false;}
if($_SERVER['REQUEST_METHOD']==='POST'){
 $a=(string)($_POST['action']??'');$rid=(string)($_POST['reel_id']??'');
 if($a==='upload'){$up=oyya_upload_reel_file($uid,$_FILES['video']??[]);if(!$up[0])rout(['ok'=>false,'message'=>$up[1]]);[$ok,$msg]=oyya_create_reel($uid,(string)($_POST['caption']??''),(string)$up[1]);rout(['ok'=>$ok,'message'=>$msg]);}
 if(in_array($a,['like','save','comment'],true)&&!reel_exists($rid))rout(['ok'=>false,'message'=>'الريل غير موجود.']);
 if($a==='like'){$r=oyya_read('reel_likes');$found=false;$out=[];foreach($r as $x){if(($x['reel_id']??'')===$rid&&($x['user_id']??'')===$uid){$found=true;continue;}$out[]=$x;}if(!$found)$out[]=['id'=>oyya_id(),'reel_id'=>$rid,'user_id'=>$uid,'created_at'=>oyya_now()];oyya_write('reel_likes',$out);rout(['ok'=>true,'active'=>!$found]);}
 if($a==='save'){$r=oyya_read('reel_saves');$found=false;$out=[];foreach($r as $x){if(($x['reel_id']??'')===$rid&&($x['user_id']??'')===$uid){$found=true;continue;}$out[]=$x;}if(!$found)$out[]=['id'=>oyya_id(),'reel_id'=>$rid,'user_id'=>$uid,'created_at'=>oyya_now()];oyya_write('reel_saves',$out);rout(['ok'=>true,'active'=>!$found]);}
 if($a==='comment'){$text=trim((string)($_POST['text']??''));if($text==='')rout(['ok'=>false,'message'=>'اكتب تعليقًا']);if(mb_strlen($text)>500)rout(['ok'=>false,'message'=>'التعليق طويل جدًا.']);$r=oyya_read('reel_comments');$r[]=['id'=>oyya_id(),'reel_id'=>$rid,'user_id'=>$uid,'text'=>$text,'created_at'=>oyya_now()];oyya_write('reel_comments',$r);rout(['ok'=>true]);}
 if($a==='follow'){$target=(string)($_POST['target_id']??'');if($target===''||$target===$uid||!oyya_user_by_id($target))rout(['ok'=>false,'message'=>'الحساب غير صالح.']);oyya_toggle_follow($uid,$target);rout(['ok'=>true,'active'=>oyya_is_following($uid,$target)]);}
 rout(['ok'=>false,'message'=>'إجراء غير معروف']);
}
$users=[];foreach(oyya_users() as $u)$users[(string)$u['id']]=['id'=>(string)$u['id'],'name'=>(string)($u['name']??'مستخدم'),'avatar'=>(string)($u['avatar']??''),'verified'=>!empty($u['verified'])];
$media=[];foreach(oyya_read('media') as $m)$media[(string)$m['id']]=$m;
$likes=oyya_read('reel_likes');$comments=oyya_read('reel_comments');$saves=oyya_read('reel_saves');
$rows=[];foreach(array_reverse(oyya_read('reels')) as $r){$m=$media[(string)($r['media_id']??'')]??null;if(!$m||!str_starts_with((string)($m['mime']??''),'video/'))continue;$id=(string)$r['id'];$owner=(string)$r['user_id'];$cs=array_values(array_filter($comments,fn($x)=>($x['reel_id']??'')===$id));foreach($cs as &$c)$c['user']=$users[(string)($c['user_id']??'')]??['name'=>'مستخدم','avatar'=>''];$rows[]=['id'=>$id,'user_id'=>$owner,'user'=>$users[$owner]??['name'=>'OYYA','avatar'=>''],'caption'=>(string)($r['caption']??''),'created_at'=>$r['created_at']??'','video'=>(string)$m['url'],'liked_by_me'=>count(array_filter($likes,fn($x)=>($x['reel_id']??'')===$id&&($x['user_id']??'')===$uid))>0,'likes_count'=>count(array_filter($likes,fn($x)=>($x['reel_id']??'')===$id)),'saved_by_me'=>count(array_filter($saves,fn($x)=>($x['reel_id']??'')===$id&&($x['user_id']??'')===$uid))>0,'comments'=>$cs,'following'=>oyya_is_following($uid,$owner),'is_me'=>$owner===$uid];}
rout(['ok'=>true,'me'=>$users[$uid]??[],'reels'=>$rows]);
