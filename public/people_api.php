<?php
declare(strict_types=1);
require __DIR__.'/app.php';
header('Content-Type: application/json; charset=utf-8');
if(!oyya_current_user()){http_response_code(401);echo json_encode(['ok'=>false],JSON_UNESCAPED_UNICODE);exit;}
$rows=[];
foreach(oyya_users() as $u){
  if(($u['id']??'')===OYYA_SYSTEM_USER_ID)continue;
  $rows[]=[
    'id'=>(string)($u['id']??''),'name'=>(string)($u['name']??''),'city'=>(string)($u['city']??''),'verified'=>!empty($u['verified']),
    'headline'=>(string)($u['headline']??($u['study_work']??'')),'bio'=>(string)($u['bio']??''),'skills'=>(string)($u['skills']??''),'interests'=>(string)($u['interests']??''),
    'hobbies'=>(string)($u['hobbies']??''),'offers'=>(string)($u['offers']??''),'seeks'=>(string)($u['seeks']??''),'avatar'=>(string)($u['avatar']??''),
    'company'=>(string)($u['company']??''),'education'=>(string)($u['education']??''),'experience'=>(string)($u['experience']??''),'demo'=>!empty($u['demo_profile'])
  ];
}
echo json_encode(['ok'=>true,'users'=>$rows],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
