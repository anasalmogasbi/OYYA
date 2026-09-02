(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const params=new URLSearchParams(location.search), current=params.get('view')||'feed';
  const usageKey='oyya_nav_usage_v2';
  let usage={};try{usage=JSON.parse(localStorage.getItem(usageKey)||'{}')||{}}catch(e){usage={}};
  const labels={feed:'الرئيسية',nearby:'حولك',reels:'ريلز',people:'الناس',map:'حولك',communities:'المجتمعات',events:'الأحداث',opportunities:'الفرص',games:'الألعاب',pages:'الصفحات',messages:'الرسائل',notifications:'النشاط',saved:'المحفوظات',albums:'الألبومات',explore:'اكتشف',profile:'ملفي',ads:'الإعلانات',memories:'الذكريات'};
  const icons={feed:'⌂',nearby:'⌖',reels:'▶',people:'☺',map:'⌖',communities:'◌',events:'◉',opportunities:'✦',games:'♠',pages:'▣',messages:'✉',notifications:'♡',saved:'☆',albums:'▧',explore:'✦',profile:'◉',ads:'↗',memories:'◷'};
  const track=view=>{if(!view)return;usage[view]=(usage[view]||0)+1;try{localStorage.setItem(usageKey,JSON.stringify(usage))}catch(e){}};
  track(current);qsa('a[data-view]').forEach(a=>a.addEventListener('click',()=>track(a.dataset.view)));
  const nav=qs('#oyyaSmartNav');
  if(nav){
    const slot=qs('.oyya-smart-slot',nav);
    const candidates=['explore','people','communities','events','opportunities','games','pages','messages','notifications','saved','albums','profile'];
    candidates.sort((a,b)=>(usage[b]||0)-(usage[a]||0));
    const slotView=(usage[candidates[0]]||0)>1?candidates[0]:'explore';
    if(slot){slot.dataset.view=slotView;slot.href='/?view='+encodeURIComponent(slotView);const i=qs('.oyya-nav-icon',slot),l=qs('.oyya-smart-label',slot);if(i)i.textContent=icons[slotView]||'✦';if(l)l.textContent=labels[slotView]||slotView;}
    qsa('.oyya-nav-item',nav).forEach(el=>{if(el.dataset.view===current||(current==='nearby'&&el.dataset.view==='map'))el.classList.add('is-active')});
  }
  const sheet=qs('#oyyaMoreSheet'),backdrop=qs('#oyyaMoreBackdrop'),more=qs('#oyyaMoreButton'),close=qs('#oyyaMoreClose');
  const openSheet=()=>{sheet?.classList.add('is-open');sheet?.setAttribute('aria-hidden','false');if(backdrop)backdrop.hidden=false;more?.setAttribute('aria-expanded','true')};
  const closeSheet=()=>{sheet?.classList.remove('is-open');sheet?.setAttribute('aria-hidden','true');if(backdrop)backdrop.hidden=true;more?.setAttribute('aria-expanded','false')};
  more?.addEventListener('click',openSheet);close?.addEventListener('click',closeSheet);backdrop?.addEventListener('click',closeSheet);addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
  const radioNav=qs('#oyyaRadioNav'),oldRadio=qs('#radioToggle');let mini=null;
  const ensureMini=()=>{if(mini)return mini;mini=document.createElement('div');mini.className='oyya-mini-player';mini.innerHTML='<button type="button">❚❚</button><div class="oyya-mini-text"><b>راديو OYYA</b><small>يستمر أثناء تنقلك داخل العالم</small></div><span>♫</span>';document.body.appendChild(mini);qs('button',mini)?.addEventListener('click',()=>radioNav?.click());return mini};
  const syncRadio=()=>{if(!radioNav)return;const playing=oldRadio?oldRadio.textContent.includes('❚'):radioNav.classList.contains('is-playing');radioNav.classList.toggle('is-playing',playing);const label=radioNav.querySelector('span:last-child');if(label)label.textContent=playing?'يعمل':'تشغيل';ensureMini().classList.toggle('is-on',playing)};
  radioNav?.addEventListener('click',()=>{if(oldRadio){oldRadio.click();setTimeout(syncRadio,80)}else{radioNav.classList.toggle('is-playing');syncRadio()}});if(oldRadio){oldRadio.addEventListener('click',()=>setTimeout(syncRadio,50));syncRadio()}
  const adhan=qs('#adhanToggle');if(adhan){const grid=qs('#oyyaMoreGrid'),card=document.createElement('button');card.type='button';card.className='oyya-adhan-card';card.innerHTML='<b>الأذان</b><small>'+(adhan.checked?'مفعّل':'متوقف')+' · اضغط للتبديل</small>';card.addEventListener('click',()=>{adhan.checked=!adhan.checked;adhan.dispatchEvent(new Event('change'));qs('small',card).textContent=(adhan.checked?'مفعّل':'متوقف')+' · اضغط للتبديل'});grid?.appendChild(card)}
  const tick=()=>fetch('/tick.php',{cache:'no-store',credentials:'same-origin'}).catch(()=>{});setTimeout(tick,5000);setInterval(tick,5000);
})();