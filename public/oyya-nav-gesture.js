(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>setTimeout(()=>{
    const nav=document.querySelector('#oyyaSmartNav');
    const shell=document.querySelector('#oyyaBottomShell');
    const sheet=document.querySelector('#oyyaMoreSheet');
    const backdrop=document.querySelector('#oyyaMoreBackdrop');
    if(!nav||!shell||!sheet)return;

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
    nav.querySelector('#oyyaRadioNav')?.remove();
    nav.querySelector('#oyyaMoreButton')?.remove();

    const items=[
      ['games','♠','الألعاب'],
      ['communities','◌','المجتمعات'],
      ['pages','▣','الصفحات'],
      ['opportunities','✦','الفرص'],
      ['events','◉','الأحداث'],
      ['explore','⌕','اكتشف'],
      ['saved','☆','المحفوظات'],
      ['albums','▧','الألبومات']
    ];
    sheet.innerHTML='<div class="oyya-expand-grip"></div><div class="oyya-expand-grid"></div>';
    const grid=sheet.querySelector('.oyya-expand-grid');
    items.forEach(([view,icon,label])=>{
      const a=document.createElement('a');
      a.href='/?view='+view;
      a.className='oyya-expand-item';
      a.innerHTML='<span class="oyya-expand-icon">'+icon+'</span><span class="oyya-expand-label">'+label+'</span>';
      grid.appendChild(a);
    });

    const style=document.createElement('style');
    style.textContent=`
      #oyyaBottomShell{touch-action:none;user-select:none;z-index:120!important;border-radius:0!important;background:#fff!important;transition:height .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s!important;overflow:visible!important}
      #oyyaSmartNav{display:grid!important;grid-template-columns:repeat(4,1fr)!important;width:100%!important;height:72px!important;position:relative!important;z-index:2!important;background:#fff!important}
      #oyyaSmartNav>.oyya-nav-item{width:auto!important;max-width:none!important;flex:none!important}
      #oyyaBottomShell:before{content:'';position:absolute;top:4px;left:50%;transform:translateX(-50%);width:34px;height:3px;border-radius:999px;background:#d8dbe0;z-index:4;pointer-events:none}
      #oyyaMoreBackdrop{display:none!important}
      #oyyaMoreSheet{position:fixed!important;left:50%!important;bottom:72px!important;transform:translate(-50%,100%)!important;width:min(760px,100%)!important;height:auto!important;max-height:none!important;padding:12px 16px 18px!important;border:0!important;border-radius:24px 24px 0 0!important;background:#fff!important;box-shadow:0 -18px 50px #0002!important;z-index:119!important;opacity:0!important;pointer-events:none!important;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .18s!important;overflow:hidden!important;touch-action:none!important}
      #oyyaMoreSheet.is-open{transform:translate(-50%,0)!important;opacity:1!important;pointer-events:auto!important}
      .oyya-expand-grip{width:46px;height:5px;border-radius:999px;background:#d4d7dc;margin:0 auto 16px}
      .oyya-expand-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px 10px;padding:4px 0 2px}
      .oyya-expand-item{text-decoration:none;color:#17191d;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;min-width:0}
      .oyya-expand-icon{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#f0f2f4;border:1px solid #e3e6e9;font-size:22px;font-weight:800}
      .oyya-expand-label{font:700 11px/1.35 Tahoma,'Segoe UI',Arial,sans-serif;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:78px}
      body.oyya-drawer-open #oyyaBottomShell{box-shadow:0 -10px 30px #00000010!important}
      body.oyya-drawer-open #oyyaBottomShell:before{background:#858b94}
      @media(max-width:520px){.oyya-expand-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:16px 6px}.oyya-expand-icon{width:44px;height:44px}.oyya-expand-label{font-size:10px;max-width:68px}}
    `;
    document.head.appendChild(style);

    const open=()=>{sheet.classList.add('is-open');sheet.setAttribute('aria-hidden','false');document.body.classList.add('oyya-drawer-open');};
    const shut=()=>{sheet.classList.remove('is-open');sheet.setAttribute('aria-hidden','true');document.body.classList.remove('oyya-drawer-open');sheet.style.transform='';};

    let startY=0,lastY=0,dragging=false,fromSheet=false;
    const begin=(y,isSheet)=>{startY=lastY=y;dragging=true;fromSheet=isSheet;};
    const move=y=>{if(!dragging)return;lastY=y;};
    const end=()=>{if(!dragging)return;const dy=lastY-startY;if(fromSheet){if(dy>38)shut();}else if(dy<-34)open();dragging=false;};

    shell.addEventListener('touchstart',e=>{if(e.touches[0])begin(e.touches[0].clientY,false)},{passive:true});
    shell.addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientY)},{passive:true});
    shell.addEventListener('touchend',end,{passive:true});
    sheet.addEventListener('touchstart',e=>{if(e.touches[0])begin(e.touches[0].clientY,true)},{passive:true});
    sheet.addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientY)},{passive:true});
    sheet.addEventListener('touchend',end,{passive:true});
    shell.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'){begin(e.clientY,false);shell.setPointerCapture?.(e.pointerId)}});
    shell.addEventListener('pointermove',e=>{if(dragging&&!fromSheet)move(e.clientY)});
    shell.addEventListener('pointerup',end);
    sheet.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'){begin(e.clientY,true);sheet.setPointerCapture?.(e.pointerId)}});
    sheet.addEventListener('pointermove',e=>{if(dragging&&fromSheet)move(e.clientY)});
    sheet.addEventListener('pointerup',end);
  },80));
})();
