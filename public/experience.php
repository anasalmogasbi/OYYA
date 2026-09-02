<?php
declare(strict_types=1);
require __DIR__.'/app.php';
require __DIR__.'/world.php';
require __DIR__.'/world_extra.php';
require __DIR__.'/proximity.php';
require __DIR__.'/demo_seed.php';
oyya_seed_demo_world();
header('Content-Type: application/json; charset=utf-8');
$user=oyya_current_user();if(!$user){http_response_code(401);echo json_encode(['ok'=>false]);exit;}$uid=(string)$user['id'];
$users=[];foreach(oyya_users() as $u)$users[(string)$u['id']]=['id'=>$u['id'],'name'=>$u['name'],'city'=>$u['city'],'verified'=>!empty($u['verified'])];
$media=[];foreach(oyya_read('media') as $m)$media[(string)$m['id']]=['id'=>$m['id'],'mime'=>$m['mime'],'url'=>$m['url']];
$likes=oyya_read('likes');$comments=oyya_read('comments');
$decorate=function(array $p)use($users,$media,$likes,$comments,$uid){$pid=(string)$p['id'];$p['user']=$users[(string)($p['user_id']??'')]??['name'=>'مستخدم','city'=>''];$p['media']=!empty($p['media_id'])?($media[(string)$p['media_id']]??null):null;$p['likes_count']=count(array_filter($likes,fn($x)=>($x['post_id']??'')===$pid));$p['comments_count']=count(array_filter($comments,fn($x)=>($x['post_id']??'')===$pid));$p['liked_by_me']=count(array_filter($likes,fn($x)=>($x['post_id']??'')===$pid&&($x['user_id']??'')===$uid))>0;return$p;};
$all=array_map($decorate,array_reverse(oyya_read('posts')));
$follows=[];foreach(oyya_read('follows') as $f)if(($f['follower_id']??'')===$uid)$follows[(string)$f['target_id']]=true;
$following=array_values(array_filter($all,fn($p)=>isset($follows[(string)($p['user_id']??'')])));
$mine=oyya_location($uid);$near=[];foreach($all as $p){if(empty($p['nearby']))continue;$loc=null;if(isset($p['map_lat'],$p['map_lng']))$loc=['lat'=>(float)$p['map_lat'],'lng'=>(float)$p['map_lng']];else $loc=oyya_location((string)($p['user_id']??''));$p['distance_km']=($mine&&$loc)?oyya_distance_km($mine,$loc):null;$near[]=$p;}usort($near,function($a,$b){$da=$a['distance_km']??PHP_FLOAT_MAX;$db=$b['distance_km']??PHP_FLOAT_MAX;return $da<=>$db;});
$entities=oyya_read('entities');$galleryRows=oyya_read('entity_gallery');$business=[];$mapEntities=[];
foreach($entities as $e){$item=$e;$item['gallery']=[];foreach($galleryRows as $g)if(($g['entity_id']??'')===($e['id']??'')){$m=$media[(string)($g['media_id']??'')]??null;if($m)$item['gallery'][]=['caption'=>$g['caption']??'','media'=>$m];}if(($e['type']??'')==='business')$business[]=$item;if(!empty($e['public_map'])||(!empty($e['paid_demo'])&&(int)($e['promoted_level']??0)>0))$mapEntities[]=$item;}
$activeMapPosts=[];$now=time();foreach($all as $p){if(empty($p['nearby']))continue;$until=(int)($p['map_until']??0);if($until<=0){$created=strtotime((string)($p['created_at']??''))?:0;$until=$created+86400;}if($until<$now)continue;$loc=(isset($p['map_lat'],$p['map_lng']))?['lat'=>(float)$p['map_lat'],'lng'=>(float)$p['map_lng']]:oyya_location((string)($p['user_id']??''));if(!$loc)continue;$p['map_lat']=$loc['lat'];$p['map_lng']=$loc['lng'];$p['map_until']=$until;$activeMapPosts[]=$p;}
echo json_encode(['ok'=>true,'viewer'=>['id'=>$uid,'name'=>$user['name'],'city'=>$user['city']],'feed'=>['general'=>$all,'following'=>$following,'nearby'=>$near],'map'=>['entities'=>$mapEntities,'posts'=>$activeMapPosts],'businesses'=>$business],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
