<?php
declare(strict_types=1);

$source=(string)file_get_contents(__DIR__.'/main.php');
$bad="foreach(['skills'=>'مهارات','interests'=>'اهتمامات','study_work'=>'دراسة/عمل','offers'=>'أقدم','seeks'=>'أبحث'] as \$k=>\$lab)if(!empty(\$u[\$k])):?><span class=\"chip\"><?=\$lab?>: <?=h((string)\$u[\$k])?></span><?php endforeach;?>";
$good="foreach(['skills'=>'مهارات','interests'=>'اهتمامات','study_work'=>'دراسة/عمل','offers'=>'أقدم','seeks'=>'أبحث'] as \$k=>\$lab):if(!empty(\$u[\$k])):?><span class=\"chip\"><?=\$lab?>: <?=h((string)\$u[\$k])?></span><?php endif;endforeach;?>";
$source=str_replace($bad,$good,$source,$count);
if($count!==1){http_response_code(500);echo 'OYYA compile guard failed.';exit;}
$source=str_replace('__DIR__',var_export(__DIR__,true),$source);
$tmp=sys_get_temp_dir().'/oyya-main-'.sha1($source).'.php';
file_put_contents($tmp,$source,LOCK_EX);
require $tmp;
