(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const params=new URLSearchParams(location.search), current=params.get('view')||'feed';
  const usageKey='oyya_nav_usage_v1';
  let usage={}; try{usage=JSON.parse(localStorage.getItem(usageKey)||'{}')||{}}catch(e){usage={}};
  const labels={feed:'الرئيسية',nearby:'حولك',reels:'Reels',people:'الأشخاص',map:'الخريطة',communities:'المجتمعات',events:'الأحداث',opportunities:'الفرص',games:'الألعاب',pages:'الصفحات',messages:'الرسائل',notifications:'النشاط',saved:'المحفوظات',albums:'الألبومات',explore:'استكشف',profile:'ملفي',ads:'الإعلانات'};
  const icons={feed:'⌂',nearby:'◎',reels:'▶',people:'◉',map:'⌖',communities:'◌',events:'◷',opportunities:'✦',games:'♣',pages:'▦',messages:'✉',notifications:'●',saved:'★',albums:'▣',explore:'✧',profile:'◍',ads:'↗'};
  const track=(view)=>{if(!view)return;usage[view]=(usage[view]||0)+1;try{localStorage.setItem(usageKey,JSON.stringify(usage))}catch(e){}};
  track(current);
  qsa('a[data-view]').forEach(a=>a.addEventListener('click',()=>track(a.dataset.view)));

  const nav=qs('#oyyaSmartNav');
  if(nav){
    const candidates=Object.keys(labels).filter(v=>!['feed','reels'].includes(v));
    candidates.sort((a,b)=>(usage[b]||0)-(usage[a]||0));
    const dynamic=candidates.filter(v=>(usage[v]||0)>0).slice(0,1);
    const slotView=dynamic[0]||'nearby';
    const second=nav.querySelector('[data-view="nearby"]');
    if(second&&slotView!=='nearby'){
      second.dataset.view=slotView;second.href='/?view='+encodeURIComponent(slotView);
      const ic=second.querySelector('.oyya-nav-icon');if(ic)ic.textContent=icons[slotView]||'•';
      const spans=second.querySelectorAll('span');if(spans[1])spans[1].textContent=labels[slotView]||slotView;
    }
    qsa('.oyya-nav-item',nav).forEach(el=>{if(el.dataset.view===current)el.classList.add('is-active')});
  }

  const sheet=qs('#oyyaMoreSheet'), backdrop=qs('#oyyaMoreBackdrop'), more=qs('#oyyaMoreButton'), close=qs('#oyyaMoreClose');
  const openSheet=()=>{if(!sheet)return;sheet.classList.add('is-open');sheet.setAttribute('aria-hidden','false');if(backdrop)backdrop.hidden=false;if(more)more.setAttribute('aria-expanded','true');};
  const closeSheet=()=>{if(!sheet)return;sheet.classList.remove('is-open');sheet.setAttribute('aria-hidden','true');if(backdrop)backdrop.hidden=true;if(more)more.setAttribute('aria-expanded','false');};
  more?.addEventListener('click',openSheet);close?.addEventListener('click',closeSheet);backdrop?.addEventListener('click',closeSheet);
  addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});

  const most=Object.entries(usage).filter(([v,n])=>labels[v]&&n>1&&!['feed','reels'].includes(v)).sort((a,b)=>b[1]-a[1]).slice(0,2);
  if(most.length&&document.body){
    const bar=document.createElement('div');bar.className='oyya-most-used';bar.setAttribute('aria-label','الأكثر دخولًا');
    most.forEach(([v])=>{const a=document.createElement('a');a.className='oyya-most-chip';a.href='/?view='+encodeURIComponent(v);a.dataset.view=v;a.innerHTML='<strong>'+labels[v]+'</strong> · الأكثر دخولًا';a.addEventListener('click',()=>track(v));bar.appendChild(a)});
    document.body.appendChild(bar);
  }

  const radioNav=qs('#oyyaRadioNav');
  const oldRadio=qs('#radioToggle');
  let mini=null;
  const ensureMini=()=>{
    if(mini)return mini;
    mini=document.createElement('div');mini.className='oyya-mini-player';mini.innerHTML='<button type="button" aria-label="إيقاف أو تشغيل">❚❚</button><div class="oyya-mini-text"><b>راديو OYYA</b><small>يعمل أثناء تنقلك داخل العالم</small></div><span>♫</span>';
    document.body.appendChild(mini);
    mini.querySelector('button').addEventListener('click',()=>radioNav?.click());
    return mini;
  };
  const syncRadioState=()=>{
    if(!radioNav)return;
    const playing=oldRadio ? oldRadio.textContent.includes('❚') : radioNav.classList.contains('is-playing');
    radioNav.classList.toggle('is-playing',playing);
    const label=radioNav.querySelector('span:last-child');if(label)label.textContent=playing?'يعمل':'تشغيل';
    const m=ensureMini();m.classList.toggle('is-on',playing);
  };
  radioNav?.addEventListener('click',()=>{
    if(oldRadio){oldRadio.click();setTimeout(syncRadioState,80)}
    else{radioNav.classList.toggle('is-playing');syncRadioState()}
  });
  if(oldRadio){oldRadio.addEventListener('click',()=>setTimeout(syncRadioState,50));syncRadioState();}

  const adhan=qs('#adhanToggle');
  if(adhan){
    const moreGrid=qs('#oyyaMoreGrid');
    const card=document.createElement('button');card.type='button';card.className='oyya-adhan-card';card.style.cssText='text-align:right;min-width:0;padding:16px;border-radius:20px;color:#eef4ff;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);font:inherit;cursor:pointer';
    card.innerHTML='<b style="display:block">الأذان</b><small style="display:block;color:#91a0b6;margin-top:5px">'+(adhan.checked?'مفعّل':'متوقف')+' · اضغط للتبديل</small>';
    card.addEventListener('click',()=>{adhan.checked=!adhan.checked;adhan.dispatchEvent(new Event('change'));card.querySelector('small').textContent=(adhan.checked?'مفعّل':'متوقف')+' · اضغط للتبديل'});
    moreGrid?.appendChild(card);
  }

  const tick=()=>fetch('/tick.php',{cache:'no-store',credentials:'same-origin'}).catch(()=>{});
  setTimeout(tick,5000);
  setInterval(tick,5000);
})();