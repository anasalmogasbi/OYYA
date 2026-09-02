<?php
declare(strict_types=1);
$root=dirname(__DIR__);
require $root.'/public/app.php';
require $root.'/public/world.php';
require $root.'/public/world_extra.php';
require $root.'/public/proximity.php';

function ok(bool $v,string $m): void {if(!$v){fwrite(STDERR,"FAIL: $m\n");exit(1);}echo "PASS: $m\n";}
foreach(glob($root.'/public/data/*.json')?:[] as $f)@unlink($f);
oyya_boot();oyya_world_boot();oyya_extra_boot();

$users=[];
for($i=1;$i<=20;$i++){
  $id=oyya_id();$users[]=['id'=>$id,'name'=>'User '.$i,'phone'=>'+2189'.str_pad((string)$i,8,'0',STR_PAD_LEFT),'password_hash'=>password_hash('secret1',PASSWORD_DEFAULT),'city'=>$i%2?'بنغازي':'طرابلس','skills'=>'تصوير','interests'=>'تقنية','study_work'=>'عمل','hobbies'=>'كرة','offers'=>'خدمة','seeks'=>'فرصة','bio'=>'test','location_visibility'=>'approx','verified'=>false,'created_at'=>oyya_now()];
}
ok(oyya_save_users($users),'persist 20 users');
ok(count(oyya_users())===20,'20 user capacity data');
$u1=$users[0]['id'];$u2=$users[1]['id'];

[$s,$m]=oyya_create_media_post($u1,['text'=>'hello world','nearby'=>'1']);ok($s,'create post');$post=oyya_read('posts')[0]['id'];
oyya_toggle_like($u2,$post);ok(oyya_post_likes($post)===1,'cross-user like');
[$s,$m]=oyya_add_comment($u2,$post,'nice');ok($s&&count(oyya_post_comments($post))===1,'cross-user comment');
oyya_toggle_follow($u2,$u1);ok(oyya_is_following($u2,$u1),'follow graph');
oyya_toggle_save($u2,$post);ok(oyya_is_saved($u2,$post),'save post');
[$s,$m]=oyya_send_message($u1,$u2,'hi');ok($s&&count(oyya_read('messages'))===1,'message delivery persistence');
[$s,$m]=oyya_friend_request($u1,$u2);ok($s,'friend request');$req=oyya_read('friend_requests')[0]['id'];oyya_friend_respond($u2,$req,'accepted');ok(oyya_is_following($u1,$u2)&&oyya_is_following($u2,$u1),'accepted request creates mutual graph');
[$s,$m]=oyya_location_set($u1,32.116,20.068);ok($s,'store private location 1');[$s,$m]=oyya_location_set($u2,32.12,20.07);ok($s,'store private location 2');ok((oyya_approx_distance($u1,$u2)??999)<5,'proximity calculation');ok(count(oyya_nearby_posts($u2,50))===1,'nearby feed distribution');
[$s,$id]=oyya_create_game_room($u1,'table',2);ok($s,'create shared game room');[$s,$m]=oyya_join_game($u2,$id);ok($s,'second user joins room');[$s,$m]=oyya_game_play($u1,$id);ok($s,'shared turn action');
[$s,$m]=oyya_create_ad($u1,['title'=>'Campaign','text'=>'Hello Libya','city'=>'بنغازي','days'=>3]);ok($s&&count(oyya_read('ads'))===1,'campaign persistence');
$r=oyya_read('entities');$r[]=['id'=>oyya_id(),'owner_id'=>$u1,'type'=>'business','name'=>'Store','description'=>'x','city'=>'بنغازي','address'=>'Center','contact'=>'091','lat'=>32.1,'lng'=>20.1,'created_at'=>oyya_now()];oyya_write('entities',$r);ok(count(oyya_read('entities'))===1,'business/place entity persistence');
$search=oyya_search_world('User 1');ok(count($search['users'])>=1,'world search');
ok(count(oyya_creator_scores())===20,'creator ranking engine');
ok(count(oyya_read('notifications'))>=3,'activity notifications generated');

ok(oyya_delete_account($u2),'delete account');ok(count(oyya_users())===19,'deleted account frees one slot');
echo "OYYA SMOKE: PASS\n";
