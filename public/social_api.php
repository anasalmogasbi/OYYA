<?php
declare(strict_types=1);
require __DIR__.'/app.php';
require __DIR__.'/world.php';
require __DIR__.'/world_extra.php';
require __DIR__.'/proximity.php';
header('Content-Type: application/json; charset=utf-8');
$user=oyya_current_user();if(!$user){http_response_code(401);echo json_encode(['ok'=>false,'message'=>'غير مسجل']);exit;}$uid=(string)$user['id'];
function out(array $v): never {echo json_encode($v,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function media_map(): array {$o=[];foreach(oyya_read('media') as $m)$o[(string)$m['id']]=$m;return$o;}
function public_user(array $u): array {return ['id'=>(string)($u['id']??''),'name'=>(string)($u['name']??''),'city'=>(string)($u['city']??''),'headline'=>(string)($u['headline']??($u['study_work']??'')),'bio'=>(string)($u['bio']??''),'skills'=>(string)($u['skills']??''),'interests'=>(string)($u['interests']??''),'hobbies'=>(string)($u['hobbies']??''),'offers'=>(string)($u['offers']??''),'seeks'=>(string)($u['seeks']??''),'company'=>(string)($u['company']??''),'education'=>(string)($u['education']??''),'experience'=>(string)($u['experience']??''),'avatar'=>(string)($u['avatar']??''),'cover'=>(string)($u['cover']??''),'verified'=>!empty($u['verified'])];}
if($_SERVER['REQUEST_METHOD']==='POST'){
  $a=(string)($_POST['action']??'');
  if($a==='profile_save'){$users=oyya_users();$found=false;foreach($users as &$u)if(($u['id']??'')===$uid){$found=true;foreach(['name','city','headline','bio','skills','interests','hobbies','offers','seeks','company','education','experience'] as $k)if(isset($_POST[$k]))$u[$k]=trim((string)$_POST[$k]);$u['study_work']=$u['headline']??($u['study_work']??'');}if(!$found)out(['ok'=>false,'message'=>'الحساب غير موجود']);oyya_save_users($users);out(['ok'=>true,'message'=>'تم حفظ ملفك']);}
  if(in_array($a,['avatar_upload','cover_upload'],true)){$file=$_FILES['image']??[];[$ok,$mid]=oyya_upload_media($uid,$file,$a==='avatar_upload'?'avatar':'cover');if(!$ok)out(['ok'=>false,'message'=>$mid]);$m=oyya_media_by_id((string)$mid);$users=oyya_users();foreach($users as &$u)if(($u['id']??'')===$uid)$u[$a==='avatar_upload'?'avatar':'cover']=(string)($m['url']??'');oyya_save_users($users);out(['ok'=>true,'url'=>$m['url']??'']);}
  if($a==='comment'){[$ok,$msg]=oyya_add_comment($uid,(string)($_POST['post_id']??''),(string)($_POST['text']??''));out(['ok'=>$ok,'message'=>$msg]);}
  if($a==='voice_comment'){[$ok,$msg]=oyya_add_audio_comment($uid,(string)($_POST['post_id']??''),$_FILES['voice']??[]);out(['ok'=>$ok,'message'=>$msg]);}
  if($a==='like'){oyya_toggle_like($uid,(string)($_POST['post_id']??''));out(['ok'=>true]);}
  if($a==='location'){[$ok,$msg]=oyya_location_set($uid,(float)($_POST['lat']??999),(float)($_POST['lng']??999));out(['ok'=>$ok,'message'=>$msg]);}
  if($a==='post_edit'){$id=(string)($_POST['post_id']??'');$text=trim((string)($_POST['text']??''));$rows=oyya_read('posts');$ok=false;foreach($rows as &$p)if(($p['id']??'')===$id&&($p['user_id']??'')===$uid){if($text===''&&empty($p['media_id']))out(['ok'=>false,'message'=>'لا يمكن أن يكون المنشور فارغًا']);$p['text']=$text;$p['edited_at']=oyya_now();$ok=true;break;}if($ok)oyya_write('posts',$rows);out(['ok'=>$ok,'message'=>$ok?'تم تعديل المنشور':'لا تملك هذا المنشور']);}
  if($a==='post_delete'){$id=(string)($_POST['post_id']??'');$posts=oyya_read('posts');$owned=false;foreach($posts as $p)if(($p['id']??'')===$id&&($p['user_id']??'')===$uid){$owned=true;break;}if(!$owned)out(['ok'=>false,'message'=>'لا تملك هذا المنشور']);oyya_write('posts',array_values(array_filter($posts,fn($p)=>($p['id']??'')!==$id)));foreach(['comments','likes','saves'] as $n){$r=oyya_read($n);oyya_write($n,array_values(array_filter($r,fn($x)=>($x['post_id']??'')!==$id)));}out(['ok'=>true,'message'=>'تم حذف المنشور']);}
  if($a==='comment_edit'){$id=(string)($_POST['comment_id']??'');$text=trim((string)($_POST['text']??''));if($text==='')out(['ok'=>false,'message'=>'اكتب التعليق']);$rows=oyya_read('comments');$ok=false;foreach($rows as &$c)if(($c['id']??'')===$id&&($c['user_id']??'')===$uid&&empty($c['media_id'])){$c['text']=$text;$c['edited_at']=oyya_now();$ok=true;break;}if($ok)oyya_write('comments',$rows);out(['ok'=>$ok,'message'=>$ok?'تم تعديل التعليق':'لا يمكن تعديل هذا التعليق']);}
  if($a==='comment_delete'){$id=(string)($_POST['comment_id']??'');$rows=oyya_read('comments');$owned=false;foreach($rows as $c)if(($c['id']??'')===$id&&($c['user_id']??'')===$uid){$owned=true;break;}if(!$owned)out(['ok'=>false,'message'=>'لا تملك هذا التعليق']);oyya_write('comments',array_values(array_filter($rows,fn($c)=>($c['id']??'')!==$id)));out(['ok'=>true,'message'=>'تم حذف التعليق']);}
  out(['ok'=>false,'message'=>'إجراء غير معروف']);
}
$media=media_map();$users=[];foreach(oyya_users() as $u)$users[(string)$u['id']]=public_user($u);
$comments=[];foreach(oyya_read('comments') as $c){$pid=(string)($c['post_id']??'');$row=$c;$row['user']=$users[(string)($c['user_id']??'')]??['name'=>'مستخدم'];$row['media']=!empty($c['media_id'])?($media[(string)$c['media_id']]??null):null;$row['owned_by_me']=(($c['user_id']??'')===$uid);$comments[$pid][]=$row;}
$likes=oyya_read('likes');$posts=[];foreach(array_reverse(oyya_read('posts')) as $p){$pid=(string)$p['id'];$p['user']=$users[(string)($p['user_id']??'')]??['name'=>'مستخدم'];$p['media']=!empty($p['media_id'])?($media[(string)$p['media_id']]??null):null;$p['comments']=$comments[$pid]??[];$p['likes_count']=count(array_filter($likes,fn($x)=>($x['post_id']??'')===$pid));$p['liked_by_me']=count(array_filter($likes,fn($x)=>($x['post_id']??'')===$pid&&($x['user_id']??'')===$uid))>0;$p['owned_by_me']=(($p['user_id']??'')===$uid);$posts[]=$p;}
$me=public_user(oyya_user_by_id($uid)??$user);out(['ok'=>true,'me'=>$me,'users'=>array_values($users),'posts'=>$posts]);
