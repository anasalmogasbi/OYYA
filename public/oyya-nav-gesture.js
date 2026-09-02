(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>setTimeout(()=>{
    const nav=document.querySelector('#oyyaSmartNav');
    const shell=document.querySelector('#oyyaBottomShell');
    const sheet=document.querySelector('#oyyaMoreSheet');
    const backdrop=document.querySelector('#oyyaMoreBackdrop');
    const close=document.querySelector('#oyyaMoreClose');
    if(!nav||!shell||!sheet)return;

    // Four permanent destinations only: Home, Reels, Event Map, People.
    const smart=nav.querySelector('.oyya-smart-slot');
    if(smart){
      smart.dataset.view='people';
      smart.href='/?view=people';
      smart.classList.remove('oyya-smart-slot');
      const icon=smart.querySelector('.oyya-nav-icon');
      const label=smart.querySelector('.oyya-smart-label');
      if(icon)icon.textContent='☺';
      if(label){label.textContent='الناس';label.classList.remove('oyya-smart-label');}
    }
    const mapLabel=nav.querySelector('[data-view="map"] span:last-child');
    if(mapLabel)mapLabel.textContent='خريطة الأحداث';

    // Music and More no longer occupy permanent navigation slots.
    nav.querySelector('#oyyaRadioNav')?.remove();
    nav.querySelector('#oyyaMoreButton')?.remove();

    // The lower curtain carries every secondary destination, starting with Games.
    const grid=sheet.querySelector('#oyyaMoreGrid');
    if(grid)grid.innerHTML='\
      <a href="/?view=games"><b>الألعاب</b><small>القعدة والطاولات والتحديات</small></a>\
      <a href="/?view=communities"><b>المجتمعات</b><small>المجموعات ودوائر الاهتمام</small></a>\
      <a href="/?view=pages"><b>الصفحات والأعمال</b><small>الأنشطة والمعارض والخدمات</small></a>\
      <a href="/?view=opportunities"><b>الفرص والعمل</b><small>فرص واحتياجات قريبة منك</small></a>\
      <a href="/?view=events"><b>الأحداث</b><small>الفعاليات الحالية والقادمة</small></a>\
      <a href="/?view=explore"><b>اكتشف</b><small>بحث وترند ومحتوى جديد</small></a>';

    const head=sheet.querySelector('.oyya-sheet-head');
    if(head){
      const title=head.querySelector('strong');if(title)title.textContent='اسحب للتنقل';
      const sub=head.querySelector('small');if(sub)sub.textContent='باقي عالم OYYA';
    }

    const style=document.createElement('style');
    style.textContent=`
      #oyyaBottomShell{touch-action:none;user-select:none;z-index:120!important;border-radius:0!important}
      #oyyaSmartNav{display:grid!important;grid-template-columns:repeat(4,1fr)!important;width:100%!important}
      #oyyaSmartNav>.oyya-nav-item{width:auto!important;max-width:none!important;flex:none!important}
      #oyyaMoreSheet{z-index:119!important;bottom:72px!important;width:min(760px,100%)!important;max-height:min(66vh,560px)!important;padding:8px 14px 18px!important;border-radius:25px 25px 0 0!important;will-change:transform;transition:transform .28s cubic-bezier(.2,.8,.2,1);touch-action:none;box-shadow:0 -12px 38px #0002!important}
      #oyyaMoreSheet.oyya-dragging{transition:none!important}
      #oyyaMoreSheet .oyya-sheet-grip{width:54px!important;height:5px!important;cursor:grab;margin-top:2px!important}
      #oyyaMoreBackdrop{z-index:118!important}
      #oyyaBottomShell:before{content:'';position:absolute;top:4px;left:50%;transform:translateX(-50%);width:34px;height:3px;border-radius:999px;background:#d8dbe0;opacity:.9;pointer-events:none}
      body.oyya-drawer-open #oyyaBottomShell:before{background:#858b94}
      @media(min-width:800px){#oyyaMoreSheet{bottom:72px!important}}
    `;
    document.head.appendChild(style);

    const open=()=>{
      sheet.classList.add('is-open');
      sheet.setAttribute('aria-hidden','false');
      if(backdrop)backdrop.hidden=false;
      document.body.classList.add('oyya-drawer-open');
      sheet.style.transform='';
    };
    const shut=()=>{
      sheet.classList.remove('is-open');
      sheet.setAttribute('aria-hidden','true');
      if(backdrop)backdrop.hidden=true;
      document.body.classList.remove('oyya-drawer-open');
      sheet.style.transform='';
    };
    if(close)close.onclick=shut;
    if(backdrop)backdrop.onclick=shut;

    let startY=0,lastY=0,dragging=false,fromSheet=false;
    const begin=(y,isSheet)=>{startY=lastY=y;dragging=true;fromSheet=isSheet;if(isSheet)sheet.classList.add('oyya-dragging');};
    const move=y=>{
      if(!dragging)return;
      lastY=y;
      const dy=y-startY;
      if(fromSheet&&sheet.classList.contains('is-open')&&dy>0)sheet.style.transform=`translate(-50%, ${Math.min(dy,240)}px)`;
    };
    const end=()=>{
      if(!dragging)return;
      const dy=lastY-startY;
      if(fromSheet){sheet.classList.remove('oyya-dragging');sheet.style.transform='';if(dy>60)shut();}
      else if(dy<-38)open();
      dragging=false;
    };

    shell.addEventListener('touchstart',e=>{if(e.touches[0])begin(e.touches[0].clientY,false)},{passive:true});
    shell.addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientY)},{passive:true});
    shell.addEventListener('touchend',end,{passive:true});
    sheet.addEventListener('touchstart',e=>{if(e.touches[0])begin(e.touches[0].clientY,true)},{passive:true});
    sheet.addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientY)},{passive:true});
    sheet.addEventListener('touchend',end,{passive:true});

    // Desktop/pen testing uses the same physical gesture on the bar itself.
    shell.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'){begin(e.clientY,false);shell.setPointerCapture?.(e.pointerId)}});
    shell.addEventListener('pointermove',e=>{if(dragging&&!fromSheet)move(e.clientY)});
    shell.addEventListener('pointerup',end);
    const grip=sheet.querySelector('.oyya-sheet-grip');
    grip?.addEventListener('pointerdown',e=>{begin(e.clientY,true);grip.setPointerCapture?.(e.pointerId)});
    grip?.addEventListener('pointermove',e=>{if(dragging&&fromSheet)move(e.clientY)});
    grip?.addEventListener('pointerup',end);
  },80));
})();
