<?php
declare(strict_types=1);

function oyya_world_boot(): void {
    foreach(['media','albums','album_items','reels','ads','game_rooms','game_actions','friend_requests'] as $f){
        if(!file_exists(oyya_path($f))) oyya_write($f,[]);
    }
    if(!is_dir(__DIR__.'/media')) @mkdir(__DIR__.'/media',0775,true);
}
oyya_world_boot();

function oyya_mark_notifications_read(string $uid): void {
    $rows=oyya_read('notifications');
    foreach($rows as &$r) if(($r['user_id']??'')===$uid) $r['read']=true;
    oyya_write('notifications',$rows);
}

function oyya_delete_account(string $uid): bool {
    $users=array_values(array_filter(oyya_users(),fn($u)=>($u['id']??'')!==$uid));
    if(!oyya_save_users($users)) return false;
    foreach(['posts','comments','likes','follows','saves','memberships','notifications','messages','media','albums','album_items','reels','ads','friend_requests'] as $name){
        $rows=oyya_read($name);
        $rows=array_values(array_filter($rows,function($r)use($uid){
            foreach(['user_id','owner_id','from_id','to_id','follower_id','target_id','requester_id','recipient_id'] as $k){ if(($r[$k]??null)===$uid) return false; }
            return true;
        }));
        oyya_write($name,$rows);
    }
    return true;
}

function oyya_upload_media(string $uid,array $file,string $kind='post'): array {
    if(($file['error']??UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK) return [false,'لم يتم اختيار ملف.'];
    $size=(int)($file['size']??0); if($size<=0||$size>20*1024*1024)return[false,'حجم الملف يجب ألا يتجاوز 20MB.'];
    $tmp=(string)($file['tmp_name']??''); if(!is_uploaded_file($tmp))return[false,'رفع غير صالح.'];
    $finfo=new finfo(FILEINFO_MIME_TYPE);$mime=(string)$finfo->file($tmp);
    $allowed=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif','video/mp4'=>'mp4','video/webm'=>'webm','audio/webm'=>'webm','audio/ogg'=>'ogg','audio/mpeg'=>'mp3','audio/mp4'=>'m4a','audio/wav'=>'wav'];
    if(!isset($allowed[$mime]))return[false,'نوع الملف غير مدعوم.'];
    $id=oyya_id();$name=$id.'.'.$allowed[$mime];$dir=__DIR__.'/media';if(!is_dir($dir))mkdir($dir,0775,true);$dest=$dir.'/'.$name;
    if(!move_uploaded_file($tmp,$dest))return[false,'تعذر حفظ الملف.'];
    $rows=oyya_read('media');$rows[]=['id'=>$id,'user_id'=>$uid,'kind'=>$kind,'mime'=>$mime,'url'=>'/media/'.$name,'size'=>$size,'created_at'=>oyya_now()];oyya_write('media',$rows);
    return[true,$id];
}
function oyya_media_by_id(string $id): ?array {foreach(oyya_read('media') as $m)if(($m['id']??'')===$id)return$m;return null;}

function oyya_create_reel(string $uid,string $caption,string $mediaId): array {
    $m=oyya_media_by_id($mediaId);if(!$m||($m['user_id']??'')!==$uid||!str_starts_with((string)$m['mime'],'video/'))return[false,'اختر فيديو صالحًا.'];
    $r=oyya_read('reels');$r[]=['id'=>oyya_id(),'user_id'=>$uid,'media_id'=>$mediaId,'caption'=>trim($caption),'created_at'=>oyya_now()];oyya_write('reels',$r);return[true,'تم نشر الريل.'];
}

function oyya_create_album(string $uid,string $title): array {$title=trim($title);if(mb_strlen($title)<2)return[false,'اكتب اسم الألبوم.'];$r=oyya_read('albums');$id=oyya_id();$r[]=['id'=>$id,'user_id'=>$uid,'title'=>$title,'created_at'=>oyya_now()];oyya_write('albums',$r);return[true,$id];}
function oyya_album_add(string $uid,string $albumId,string $mediaId): array {$a=null;foreach(oyya_read('albums') as $x)if(($x['id']??'')===$albumId&&($x['user_id']??'')===$uid)$a=$x;if(!$a)return[false,'الألبوم غير موجود.'];$m=oyya_media_by_id($mediaId);if(!$m||($m['user_id']??'')!==$uid)return[false,'الوسائط غير موجودة.'];$r=oyya_read('album_items');$r[]=['id'=>oyya_id(),'album_id'=>$albumId,'media_id'=>$mediaId,'created_at'=>oyya_now()];oyya_write('album_items',$r);return[true,'تمت الإضافة.'];}

function oyya_create_ad(string $uid,array $in): array {
    $title=trim((string)($in['title']??''));$text=trim((string)($in['text']??''));$city=trim((string)($in['city']??''));$days=max(1,min(30,(int)($in['days']??1)));
    if(mb_strlen($title)<2||$text==='')return[false,'أكمل الحملة.'];
    $r=oyya_read('ads');$r[]=['id'=>oyya_id(),'owner_id'=>$uid,'title'=>$title,'text'=>$text,'city'=>$city,'days'=>$days,'status'=>'active','created_at'=>oyya_now()];oyya_write('ads',$r);return[true,'تم إنشاء الحملة التجريبية.'];
}

function oyya_friend_request(string $uid,string $target): array {
    if($uid===$target||!oyya_user_by_id($target))return[false,'طلب غير صالح.'];$rows=oyya_read('friend_requests');
    foreach($rows as $r)if((($r['requester_id']??'')===$uid&&($r['recipient_id']??'')===$target)&&($r['status']??'')==='pending')return[false,'الطلب مرسل بالفعل.'];
    $rows[]=['id'=>oyya_id(),'requester_id'=>$uid,'recipient_id'=>$target,'status'=>'pending','created_at'=>oyya_now()];oyya_write('friend_requests',$rows);oyya_notify($target,'لديك طلب تعارف/صداقة جديد.','friend_request');return[true,'تم إرسال الطلب.'];
}
function oyya_friend_respond(string $uid,string $id,string $status): void {$rows=oyya_read('friend_requests');foreach($rows as &$r)if(($r['id']??'')===$id&&($r['recipient_id']??'')===$uid&&($r['status']??'')==='pending'){$r['status']=in_array($status,['accepted','declined'],true)?$status:'declined';if($r['status']==='accepted'){oyya_toggle_follow($uid,(string)$r['requester_id']);oyya_toggle_follow((string)$r['requester_id'],$uid);oyya_notify((string)$r['requester_id'],'تم قبول طلبك.','friend_request');}}oyya_write('friend_requests',$rows);}

function oyya_create_game_room(string $uid,string $name,int $maxPlayers=6): array {
    $name=trim($name);if($name==='')$name='طاولة OYYA';$maxPlayers=in_array($maxPlayers,[2,4,6,8],true)?$maxPlayers:6;$rooms=oyya_read('game_rooms');$id=oyya_id();$rooms[]=['id'=>$id,'owner_id'=>$uid,'name'=>$name,'max_players'=>$maxPlayers,'players'=>[$uid],'turn_index'=>0,'round'=>1,'scores'=>[$uid=>0],'status'=>'waiting','created_at'=>oyya_now()];oyya_write('game_rooms',$rooms);return[true,$id];
}
function oyya_join_game(string $uid,string $roomId): array {$rooms=oyya_read('game_rooms');foreach($rooms as &$room)if(($room['id']??'')===$roomId){$players=$room['players']??[];if(in_array($uid,$players,true))return[true,'أنت داخل الطاولة.'];if(count($players)>=(int)$room['max_players'])return[false,'الطاولة ممتلئة.'];$players[]=$uid;$room['players']=$players;$room['scores'][$uid]=0;if(count($players)>=2)$room['status']='playing';oyya_write('game_rooms',$rooms);return[true,'دخلت الطاولة.'];}return[false,'الطاولة غير موجودة.'];}
function oyya_game_play(string $uid,string $roomId): array {$rooms=oyya_read('game_rooms');foreach($rooms as &$room)if(($room['id']??'')===$roomId){$players=$room['players']??[];if(count($players)<2)return[false,'تحتاج لاعبين على الأقل.'];$idx=(int)($room['turn_index']??0)%count($players);if(($players[$idx]??'')!==$uid)return[false,'ليس دورك الآن.'];$gain=random_int(1,6);$room['scores'][$uid]=(int)($room['scores'][$uid]??0)+$gain;$room['turn_index']=($idx+1)%count($players);if($room['turn_index']===0)$room['round']=(int)($room['round']??1)+1;oyya_write('game_rooms',$rooms);$actions=oyya_read('game_actions');$actions[]=['id'=>oyya_id(),'room_id'=>$roomId,'user_id'=>$uid,'gain'=>$gain,'created_at'=>oyya_now()];oyya_write('game_actions',$actions);return[true,'لعبت وحصلت على '.$gain.' نقاط.'];}return[false,'الطاولة غير موجودة.'];}

function oyya_rankings(): array {$scores=[];foreach(oyya_read('game_rooms') as $r)foreach(($r['scores']??[]) as $uid=>$s)$scores[$uid]=($scores[$uid]??0)+(int)$s;arsort($scores);return$scores;}
