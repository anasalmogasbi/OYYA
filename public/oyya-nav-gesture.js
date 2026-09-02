(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>setTimeout(()=>{
    const nav=document.querySelector('#oyyaSmartNav');
    const shell=document.querySelector('#oyyaBottomShell');
    const sheet=document.querySelector('#oyyaMoreSheet');
    const backdrop=document.querySelector('#oyyaMoreBackdrop');
    const more=document.querySelector('#oyyaMoreButton');
    const close=document.querySelector('#oyyaMoreClose');
    if(!nav||!shell||!sheet||!more)return;

    // Primary bar: Home, Reels, Event Map, People, Games, compact overflow.
    const smart=nav.querySelector('.oyya-smart-slot');
    if(smart){
      smart.dataset.view='people';
      smart.href='/?view=people';
      const icon=smart.querySelector('.oyya-nav-icon');
      const label=smart.querySelector('.oyya-smart-label');
      if(icon)icon.textContent='☺';
      if(label)label.textContent='الناس';
    }
    const radio=nav.querySelector('#oyyaRadioNav');
    if(radio){
      const games=document.createElement('a');
      games.className='oyya-nav-item';
      games.dataset.view='games';
      games.href='/?view=games';
      games.innerHTML='<span class="oyya-nav-icon">♠</span><span>الألعاب</span>';
      radio.replaceWith(games);
    }
    const map=nav.querySelector('[data-view="map"] span:last-child');
    if(map)map.textContent='خريطة الأحداث';

    more.setAttribute('aria-label','المزيد');
    more.innerHTML='<span class="oyya-nav-icon oyya-more-dots">⋮</span>';
    more.classList.add('oyya-more-compact');

    // Keep the drawer useful but not crowded with things already in the main bar/profile.
    const grid=sheet.querySelector('#oyyaMoreGrid');
    if(grid)grid.innerHTML='\
      <a href="/?view=communities"><b>المجتمعات</b><small>المجموعات ودوائر الاهتمام</small></a>\
      <a href="/?view=pages"><b>الصفحات والأعمال</b><small>الأنشطة والمعارض والخدمات</small></a>\
      <a href="/?view=opportunities"><b>الفرص والعمل</b><small>فرص واحتياجات قريبة منك</small></a>\
      <a href="/?view=events"><b>الأحداث</b><small>الفعاليات الحالية والقادمة</small></a>';

    const style=document.createElement('style');
    style.textContent=`
      #oyyaBottomShell{touch-action:none;user-select:none}
      #oyyaMoreSheet{will-change:transform;transition:transform .28s cubic-bezier(.2,.8,.2,1);touch-action:none}
      #oyyaMoreSheet.oyya-dragging{transition:none!important}
      #oyyaMoreButton.oyya-more-compact{flex:0 0 42px;max-width:42px;padding:0!important}
      #oyyaMoreButton.oyya-more-compact .oyya-more-dots{font-size:26px;line-height:1;letter-spacing:0}
      #oyyaMoreSheet .oyya-sheet-grip{width:48px;height:5px;cursor:grab}
      @media(max-width:560px){#oyyaMoreButton.oyya-more-compact{flex-basis:36px;max-width:36px}}
    `;
    document.head.appendChild(style);

    const open=()=>{
      sheet.classList.add('is-open');
      sheet.setAttribute('aria-hidden','false');
      if(backdrop)backdrop.hidden=false;
      more.setAttribute('aria-expanded','true');
      sheet.style.transform='';
    };
    const shut=()=>{
      sheet.classList.remove('is-open');
      sheet.setAttribute('aria-hidden','true');
      if(backdrop)backdrop.hidden=true;
      more.setAttribute('aria-expanded','false');
      sheet.style.transform='';
    };
    more.onclick=e=>{e.preventDefault();open();};
    if(close)close.onclick=shut;
    if(backdrop)backdrop.onclick=shut;

    let startY=0,lastY=0,dragging=false,fromSheet=false;
    const begin=(y,isSheet)=>{startY=lastY=y;dragging=true;fromSheet=isSheet;if(isSheet)sheet.classList.add('oyya-dragging');};
    const move=y=>{
      if(!dragging)return;
      lastY=y;
      const dy=y-startY;
      if(fromSheet&&sheet.classList.contains('is-open')&&dy>0){sheet.style.transform=`translate(-50%, ${Math.min(dy,220)}px)`;}
    };
    const end=()=>{
      if(!dragging)return;
      const dy=lastY-startY;
      if(fromSheet){sheet.classList.remove('oyya-dragging');sheet.style.transform='';if(dy>70)shut();}
      else if(dy<-45)open();
      dragging=false;
    };

    shell.addEventListener('touchstart',e=>{if(e.touches[0])begin(e.touches[0].clientY,false)},{passive:true});
    shell.addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientY)},{passive:true});
    shell.addEventListener('touchend',end,{passive:true});
    sheet.addEventListener('touchstart',e=>{if(e.touches[0])begin(e.touches[0].clientY,true)},{passive:true});
    sheet.addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientY)},{passive:true});
    sheet.addEventListener('touchend',end,{passive:true});

    // Mouse/pen support for desktop testing: drag the bottom bar upward.
    shell.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'){begin(e.clientY,false);shell.setPointerCapture?.(e.pointerId)}});
    shell.addEventListener('pointermove',e=>{if(dragging&&!fromSheet)move(e.clientY)});
    shell.addEventListener('pointerup',end);
    const grip=sheet.querySelector('.oyya-sheet-grip');
    grip?.addEventListener('pointerdown',e=>{begin(e.clientY,true);grip.setPointerCapture?.(e.pointerId)});
    grip?.addEventListener('pointermove',e=>{if(dragging&&fromSheet)move(e.clientY)});
    grip?.addEventListener('pointerup',end);
  },80));
})();
