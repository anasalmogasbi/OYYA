<?php
declare(strict_types=1);

$source=(string)file_get_contents(__DIR__.'/main.php');
$bad="foreach(['skills'=>'مهارات','interests'=>'اهتمامات','study_work'=>'دراسة/عمل','offers'=>'أقدم','seeks'=>'أبحث'] as \$k=>\$lab)if(!empty(\$u[\$k])):?><span class=\"chip\"><?=\$lab?>: <?=h((string)\$u[\$k])?></span><?php endforeach;?>";
$good="foreach(['skills'=>'مهارات','interests'=>'اهتمامات','study_work'=>'دراسة/عمل','offers'=>'أقدم','seeks'=>'أبحث'] as \$k=>\$lab):if(!empty(\$u[\$k])):?><span class=\"chip\"><?=\$lab?>: <?=h((string)\$u[\$k])?></span><?php endif;endforeach;?>";
$source=str_replace($bad,$good,$source,$count);
if($count!==1){http_response_code(500);echo 'OYYA compile guard failed.';exit;}
$source=str_replace('$usersCount=count($users);','$usersCount=count(oyya_test_users());',$source);
$source=str_replace('__DIR__',var_export(__DIR__,true),$source);
$tmp=sys_get_temp_dir().'/oyya-main-'.sha1($source).'.php';
file_put_contents($tmp,$source,LOCK_EX);
ob_start();
require $tmp;
$out=(string)ob_get_clean();
$assets='<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.7.0/dist/maplibre-gl.css"><link rel="stylesheet" href="/oyya-experience.css?v=2"><script defer src="https://unpkg.com/maplibre-gl@5.7.0/dist/maplibre-gl.js"></script><script defer src="/oyya-experience.js?v=4"></script><script defer src="/oyya-nav-gesture.js?v=2"></script>';
if(stripos($out,'</head>')!==false)$out=str_ireplace('</head>',$assets.'</head>',$out);
echo $out;
