<?php
declare(strict_types=1);

function oyya_seed_demo_world(): void {
    $entities=oyya_read('entities');
    $ids=[]; foreach($entities as $e)$ids[(string)($e['id']??'')]=true;
    $categories=[
      'restaurant'=>['مطعم السرايا','مذاق بنغازي','دار الشواء','مائدة البحر','ركن المدينة'],
      'cafe'=>['قهوة المرسى','كافيه 17','بنّ وورد','جلسة','كافيه الساحة'],
      'fashion'=>['دار لينا','Urban Libya','أناقة','بيت القماش','Mode 218'],
      'jewelry'=>['جواهر برقة','ألماس ليبيا','دار الذهب','لؤلؤة','مجوهرات التاج'],
    ];
    $coords=[
      [32.1167,20.0667],[32.1080,20.0820],[32.1250,20.0550],[32.0930,20.1030],[32.1320,20.0790],
      [32.8872,13.1913],[32.8950,13.1800],[32.8750,13.2050],[32.9050,13.1650],[32.8810,13.2250],
      [32.3775,15.0920],[32.3650,15.1050],[32.3900,15.0800],[32.3500,15.1200],[32.4050,15.0700],
      [32.7600,22.6400],[32.7450,22.6550],[32.7700,22.6250],[32.7350,22.6700],[32.7800,22.6150]
    ];
    $cities=['بنغازي','بنغازي','بنغازي','بنغازي','بنغازي','طرابلس','طرابلس','طرابلس','طرابلس','طرابلس','مصراتة','مصراتة','مصراتة','مصراتة','مصراتة','البيضاء','البيضاء','البيضاء','البيضاء','البيضاء'];
    $i=0;$changed=false;
    foreach($categories as $cat=>$names){foreach($names as $name){$id='demo-'.$cat.'-'.($i+1);[$lat,$lng]=$coords[$i];if(!isset($ids[$id])){$entities[]=['id'=>$id,'owner_id'=>OYYA_SYSTEM_USER_ID,'type'=>'business','category'=>$cat,'name'=>$name,'description'=>'صفحة تجريبية لعرض تجربة الأعمال داخل OYYA.','city'=>$cities[$i],'address'=>'موقع تجريبي داخل '.$cities[$i],'contact'=>'091000'.str_pad((string)($i+1),4,'0',STR_PAD_LEFT),'whatsapp'=>'21891000'.str_pad((string)($i+1),4,'0',STR_PAD_LEFT),'lat'=>$lat,'lng'=>$lng,'promoted_level'=>($i%3)+1,'paid_demo'=>true,'created_at'=>oyya_now()];$ids[$id]=true;$changed=true;}$i++;}}
    $public=[
      ['demo-public-1','ميدان الشجرة','place','بنغازي',32.1162,20.0681],['demo-public-2','كورنيش بنغازي','place','بنغازي',32.1197,20.0525],
      ['demo-public-3','فعالية OYYA المفتوحة','event','طرابلس',32.8875,13.1845],['demo-public-4','سوق ثقافي تجريبي','event','مصراتة',32.3769,15.0902],
      ['demo-public-5','مركز معلومات المدينة','place','البيضاء',32.7627,21.7551]
    ];
    foreach($public as [$id,$name,$type,$city,$lat,$lng])if(!isset($ids[$id])){$entities[]=['id'=>$id,'owner_id'=>OYYA_SYSTEM_USER_ID,'type'=>$type,'category'=>'public','name'=>$name,'description'=>'جهة أو حدث عام تجريبي على خريطة OYYA.','city'=>$city,'address'=>$city,'contact'=>'','lat'=>$lat,'lng'=>$lng,'promoted_level'=>0,'public_map'=>true,'created_at'=>oyya_now()];$ids[$id]=true;$changed=true;}
    if($changed)oyya_write('entities',$entities);

    $media=oyya_read('media');$mediaIds=[];foreach($media as $m)$mediaIds[(string)($m['id']??'')]=true;$gallery=oyya_read('entity_gallery');$galleryIds=[];foreach($gallery as $g)$galleryIds[(string)($g['id']??'')]=true;$mc=false;$gc=false;
    for($n=1;$n<=20;$n++){
      $cats=array_keys($categories);$cat=$cats[intdiv($n-1,5)];$eid='demo-'.$cat.'-'.$n;$eid='demo-'.$cat.'-'.(($n-1)%5+1 + intdiv($n-1,5)*5); // retained legacy-compatible numeric id
      // actual seeded ids are globally incremented: category blocks 1..5, 6..10, 11..15, 16..20
      $eid='demo-'.$cat.'-'.$n;
      for($g=1;$g<=2;$g++){$mid='demo-gallery-'.$n.'-'.$g;$gid='demo-gallery-link-'.$n.'-'.$g;if(!isset($mediaIds[$mid])){$media[]=['id'=>$mid,'user_id'=>OYYA_SYSTEM_USER_ID,'kind'=>'gallery','mime'=>'image/jpeg','url'=>'https://picsum.photos/seed/oyya-'.$n.'-'.$g.'/900/700','size'=>0,'remote'=>true,'created_at'=>oyya_now()];$mediaIds[$mid]=true;$mc=true;}if(!isset($galleryIds[$gid])){$gallery[]=['id'=>$gid,'entity_id'=>$eid,'media_id'=>$mid,'caption'=>$g===1?'واجهة ومعرض تجريبي':'منتجات مختارة','created_at'=>oyya_now()];$galleryIds[$gid]=true;$gc=true;}}
    }
    if($mc)oyya_write('media',$media);if($gc)oyya_write('entity_gallery',$gallery);

    $reels=oyya_read('reels');$rids=[];foreach($reels as $r)$rids[(string)($r['id']??'')]=true;$media=oyya_read('media');$mediaIds=[];foreach($media as $m)$mediaIds[(string)($m['id']??'')]=true;$rc=false;$mc=false;
    $videos=['ForBiggerBlazes.mp4','ForBiggerEscapes.mp4','ForBiggerFun.mp4','ForBiggerJoyrides.mp4'];
    for($n=1;$n<=8;$n++){$rid='demo-business-reel-'.$n;$mid='demo-business-video-'.$n;if(!isset($mediaIds[$mid])){$media[]=['id'=>$mid,'user_id'=>OYYA_SYSTEM_USER_ID,'kind'=>'reel','mime'=>'video/mp4','url'=>'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/'.$videos[($n-1)%4],'size'=>0,'remote'=>true,'created_at'=>oyya_now()];$mediaIds[$mid]=true;$mc=true;}if(!isset($rids[$rid])){$reels[]=['id'=>$rid,'user_id'=>OYYA_SYSTEM_USER_ID,'entity_id'=>null,'media_id'=>$mid,'caption'=>'عرض تجريبي من أحد أنشطة OYYA','created_at'=>oyya_now()];$rids[$rid]=true;$rc=true;}}
    if($mc)oyya_write('media',$media);if($rc)oyya_write('reels',$reels);
}
