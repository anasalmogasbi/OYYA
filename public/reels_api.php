<?php
declare(strict_types=1);
require __DIR__.'/app.php';
require __DIR__.'/world.php';
header('Content-Type: application/json; charset=utf-8');
$user=oyya_current_user();if(!$user){http_response_code(401);echo json_encode(['ok'=>false,'message'=>'غير مسجل']);exit;}$uid=(string)$user['id'];
foreach(['reel_likes','reel_comments','reel_saves'] as $f)if(!file_exists(oyya_path($f)))oyya_write($f,[]);
function rout(array $v): never {echo json_encode($v,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
if($_SERVER['REQUEST_METHOD']==='POST'){
 $a=(string)($_POST['action']??'');$rid=(string)($_POST['reel_id']??'');
 if($a==='upload'){$up=oyya_upload_media($uid,$_FILES['video']??[],'reel');if(!$up[0])rout(['ok'=>false,'message'=>$up[1]]);[$ok,$msg]=oyya_create_reel($uid,(string)($_POST['caption']??''),(string)$up[1]);rout(['ok'=>$ok,'message'=>$msg]);}
 if($a==='like'){$r=oyya_read('reel_likes');$found=false;$out=[];foreach($r as $x){if(($x['reel_id']??'')===$rid&&($x['user_id']??'')===$uid){$found=true;continue;}$out[]=$x;}if(!$found)$out[]=['id'=>oyya_id(),'reel_id'=>$rid,'user_id'=>$uid,'created_at'=>oyya_now()];oyya_write('reel_likes',$out);rout(['ok'=>true,'active'=>!$found]);}
 if($a==='save'){$r=oyya_read('reel_saves');$found=false;$out=[];foreach($r as $x){if(($x['reel_id']??'')===$rid&&($x['user_id']??'')===$uid){$found=true;continue;}$out[]=$x;}if(!$found)$out[]=['id'=>oyya_id(),'reel_id'=>$rid,'user_id'=>$uid,'created_at'=>oyya_now()];oyya_write('reel_saves',$out);rout(['ok'=>true,'active'=>!$found]);}
 if($a==='comment'){$text=trim((string)($_POST['text']??''));if($text==='')rout(['ok'=>false,'message'=>'اكتب تعليقًا']);$r=oyya_read('reel_comments');$r[]=['id'=>oyya_id(),'reel_id'=>$rid,'user_id'=>$uid,'text'=>$text,'created_at'=>oyya_now()];oyya_write('reel_comments',$r);rout(['ok'=>true]);}
 if($a==='follow'){$target=(string)($_POST['target_id']??'');if($target===''||$target===$uid)rout(['ok'=>false]);oyya_toggle_follow($uid,$target);rout(['ok'=>true,'active'=>oyya_is_following($uid,$target)]);}
 rout(['ok'=>false,'message'=>'إجراء غير معروف']);
}
$users=[];foreach(oyya_users() as $u)$users[(string)$u['id']]=['id'=>(string)$u['id'],'name'=>(string)($u['name']??'مستخدم'),'avatar'=>(string)($u['avatar']??''),'verified'=>!empty($u['verified'])];
$media=[];foreach(oyya_read('media') as $m)$media[(string)$m['id']]=$m;
$likes=oyya_read('reel_likes');$comments=oyya_read('reel_comments');$saves=oyya_read('reel_saves');
$rows=[];foreach(array_reverse(oyya_read('reels')) as $r){$m=$media[(string)($r['media_id']??'')]??null;if(!$m||!str_starts_with((string)($m['mime']??''),'video/'))continue;$id=(string)$r['id'];$owner=(string)$r['user_id'];$cs=array_values(array_filter($comments,fn($x)=>($x['reel_id']??'')===$id));foreach($cs as &$c)$c['user']=$users[(string)($c['user_id']??'')]??['name'=>'مستخدم','avatar'=>''];$rows[]=['id'=>$id,'user_id'=>$owner,'user'=>$users[$owner]??['name'=>'OYYA','avatar'=>''],'caption'=>(string)($r['caption']??''),'created_at'=>$r['created_at']??'','video'=>(string)$m['url'],'liked_by_me'=>count(array_filter($likes,fn($x)=>($x['reel_id']??'')===$id&&($x['user_id']??'')===$uid))>0,'likes_count'=>count(array_filter($likes,fn($x)=>($x['reel_id']??'')===$id)),'saved_by_me'=>count(array_filter($saves,fn($x)=>($x['reel_id']??'')===$id&&($x['user_id']??'')===$uid))>0,'comments'=>$cs,'following'=>oyya_is_following($uid,$owner),'is_me'=>$owner===$uid];}
rout(['ok'=>true,'me'=>$users[$uid]??[],'reels'=>$rows]);
