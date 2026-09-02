(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const params=new URLSearchParams(location.search), current=params.get('view')||'feed';
  const usageKey='oyya_nav_usage_v2';
  let usage={};try{usage=JSON.parse(localStorage.getItem(usageKey)||'{}')||{}}catch(e){usage={}};
  const labels={feed:'الرئيسية',nearby:'حولك',reels:'ريلز',people:'الناس',map:'حولك',communities:'المجتمعات',events:'الأحداث',opportunities:'الفرص',games:'الألعاب',pages:'الصفحات',messages:'الرسائل',notifications:'النشاط',saved:'المحفوظات',albums:'الألبومات',explore:'اكتشف',profile:'ملفي',ads:'الإعلانات',memories:'الذكريات'};
  const icons={feed:'⌂',nearby:'⌖',reels:'▶',people:'☺',map:'⌖',communities:'◌',events:'◉',opportunities:'✦',games:'♠',pages:'▣',messages:'✉',notifications:'🔔',saved:'☆',albums:'▧',explore:'✦',profile:'◉',ads:'↗',memories:'◷'};

  const style=document.createElement('style');
  style.textContent=`
    .nav{display:none!important}
    .shell>header.top,.top.oyya-legacy-top{display:none!important}
    .oyya-top-actions{position:relative}
    .oyya-ui-popover{position:absolute;top:48px;left:0;width:min(330px,calc(100vw - 28px));background:#fff;border:1px solid #e4e6e9;border-radius:18px;box-shadow:0 18px 55px #0002;padding:10px;z-index:180;display:none;direction:rtl;color:#17191d}
    .oyya-ui-popover.is-open{display:block}
    .oyya-ui-popover h3{margin:4px 6px 10px;font-size:17px}
    .oyya-ui-popover a{display:block;text-decoration:none;color:#17191d;padding:11px 10px;border-radius:12px}
    .oyya-ui-popover a:hover,.oyya-profile-logout:hover{background:#f3f4f6}
    .oyya-ui-popover small{display:block;color:#858b94;margin-top:3px}
    .oyya-ui-popover .oyya-menu-sep{height:1px;background:#eceef0;margin:6px 0}
    .oyya-profile-logout{width:100%;border:0;background:transparent;color:#a12222;padding:11px 10px;border-radius:12px;text-align:right;font:700 14px/1.5 Tahoma,'Segoe UI',Arial,sans-serif;cursor:pointer}
    .oyya-bell-svg,.oyya-message-svg{width:19px;height:19px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .oyya-circle[data-oyya-bell],.oyya-circle[data-oyya-messages],.oyya-circle[data-oyya-profile]{cursor:pointer}
    .oyya-music-panel{position:fixed;z-index:190;left:50%;bottom:82px;transform:translateX(-50%);width:min(720px,calc(100% - 20px));max-height:min(70vh,560px);overflow:auto;background:#fff;border:1px solid #e2e4e7;border-radius:22px;box-shadow:0 20px 60px #0003;padding:12px;display:none;direction:rtl}
    .oyya-music-panel.is-open{display:block}
    .oyya-music-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 4px 10px}
    .oyya-music-head strong{font-size:19px}.oyya-music-head button{width:34px;height:34px;border-radius:50%;border:1px solid #e2e4e7;background:#f6f6f7;font-size:20px}
    .oyya-track{display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;border-top:1px solid #f0f1f2}
    .oyya-track:first-of-type{border-top:0}.oyya-track button{width:38px;height:38px;border-radius:50%;border:0;background:#111;color:#fff;flex:0 0 auto}.oyya-track-info{min-width:0;flex:1}.oyya-track-info b,.oyya-track-info small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.oyya-track-info small{color:#858b94;margin-top:3px}
    .oyya-track.is-playing{background:#f3f4f6}
    .oyya-now-playing{padding:9px 10px;margin-bottom:8px;border-radius:14px;background:linear-gradient(115deg,#2410a8,#0877dc 28%,#09d7ef 49%,#7d63e8 70%,#e51bc4);color:#fff;display:none}
    .oyya-now-playing.is-on{display:block}
  `;
  document.head.appendChild(style);

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

  const topActions=qs('.oyya-top-actions');
  if(topActions){
    const closeTopMenus=except=>qsa('.oyya-ui-popover',topActions).forEach(p=>{if(p!==except)p.classList.remove('is-open')});
    const wireMenu=(button,pop)=>{
      button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const willOpen=!pop.classList.contains('is-open');closeTopMenus(pop);pop.classList.toggle('is-open',willOpen)});
    };

    const links=qsa('.oyya-circle',topActions);
    const oldNotice=links.find(a=>(a.getAttribute('href')||'').includes('notifications'));
    if(oldNotice){
      oldNotice.removeAttribute('href');oldNotice.setAttribute('role','button');oldNotice.setAttribute('aria-label','الإشعارات');oldNotice.dataset.oyyaBell='1';
      oldNotice.innerHTML='<svg class="oyya-bell-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg>';
      const pop=document.createElement('div');pop.className='oyya-ui-popover';pop.innerHTML='<h3>الإشعارات</h3><a href="/?view=notifications"><b>فتح الإشعارات</b><small>الطلبات والتفاعلات والتنبيهات الجديدة</small></a>';
      topActions.appendChild(pop);wireMenu(oldNotice,pop);

      const messages=document.createElement('button');messages.type='button';messages.className='oyya-circle';messages.dataset.oyyaMessages='1';messages.setAttribute('aria-label','الرسائل');messages.innerHTML='<svg class="oyya-message-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path></svg>';
      const avatar=qs('.oyya-circle.avatar',topActions);topActions.insertBefore(messages,oldNotice.nextSibling);
      const msgPop=document.createElement('div');msgPop.className='oyya-ui-popover';msgPop.innerHTML='<h3>الرسائل</h3><a href="/?view=messages"><b>فتح الرسائل</b><small>المحادثات والرسائل الخاصة</small></a>';
      topActions.appendChild(msgPop);wireMenu(messages,msgPop);

      if(avatar){
        avatar.removeAttribute('href');avatar.setAttribute('role','button');avatar.setAttribute('aria-label','حسابي');avatar.dataset.oyyaProfile='1';
        const profilePop=document.createElement('div');profilePop.className='oyya-ui-popover';profilePop.innerHTML='<h3>حسابي</h3><a href="/?view=profile"><b>ملفي الشخصي والإعدادات</b><small>بياناتك واهتماماتك وإعدادات الحساب</small></a><a href="/?view=notifications"><b>النشاط</b><small>طلباتك وتفاعلاتك السابقة</small></a><a href="/?view=saved"><b>المحفوظات</b><small>المنشورات التي حفظتها</small></a><div class="oyya-menu-sep"></div><form method="post"><input type="hidden" name="action" value="logout"><button class="oyya-profile-logout" type="submit">تسجيل الخروج</button></form>';
        topActions.appendChild(profilePop);wireMenu(avatar,profilePop);
      }
    }
    document.addEventListener('click',e=>{if(!topActions.contains(e.target))closeTopMenus(null)});
  }

  const sheet=qs('#oyyaMoreSheet'),backdrop=qs('#oyyaMoreBackdrop'),more=qs('#oyyaMoreButton'),close=qs('#oyyaMoreClose');
  const openSheet=()=>{sheet?.classList.add('is-open');sheet?.setAttribute('aria-hidden','false');if(backdrop)backdrop.hidden=false;more?.setAttribute('aria-expanded','true')};
  const closeSheet=()=>{sheet?.classList.remove('is-open');sheet?.setAttribute('aria-hidden','true');if(backdrop)backdrop.hidden=true;more?.setAttribute('aria-expanded','false')};
  more?.addEventListener('click',openSheet);close?.addEventListener('click',closeSheet);backdrop?.addEventListener('click',closeSheet);addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheet();qsa('.oyya-ui-popover').forEach(p=>p.classList.remove('is-open'))}});

  const songs=Array.from({length:10},(_,i)=>({title:'OYYA Music '+(i+1),artist:'موسيقى تجريبية',src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-'+(i+1)+'.mp3'}));
  const audio=new Audio();audio.preload='none';let currentSong=-1;
  const musicPanel=document.createElement('section');musicPanel.className='oyya-music-panel';musicPanel.innerHTML='<div class="oyya-music-head"><div><strong>موسيقى OYYA</strong><small style="display:block;color:#858b94;margin-top:3px">10 مقاطع تجريبية</small></div><button type="button" data-close-music>×</button></div><div class="oyya-now-playing" id="oyyaNowPlaying"></div><div id="oyyaTrackList"></div>';
  document.body.appendChild(musicPanel);
  const list=qs('#oyyaTrackList',musicPanel),now=qs('#oyyaNowPlaying',musicPanel);
  songs.forEach((song,i)=>{const row=document.createElement('div');row.className='oyya-track';row.dataset.song=String(i);row.innerHTML='<button type="button">▶</button><div class="oyya-track-info"><b>'+song.title+'</b><small>'+song.artist+'</small></div>';list.appendChild(row);qs('button',row).addEventListener('click',()=>playSong(i));});
  const syncSongs=()=>qsa('.oyya-track',musicPanel).forEach((r,i)=>{const on=i===currentSong&&!audio.paused;r.classList.toggle('is-playing',on);const b=qs('button',r);if(b)b.textContent=on?'❚❚':'▶'});
  const playSong=i=>{if(currentSong===i&&!audio.paused){audio.pause();syncSongs();return}currentSong=i;audio.src=songs[i].src;audio.play().catch(()=>{});if(now){now.textContent='يعمل الآن: '+songs[i].title;now.classList.add('is-on')}syncSongs()};
  audio.addEventListener('play',syncSongs);audio.addEventListener('pause',syncSongs);audio.addEventListener('ended',()=>{const next=(currentSong+1)%songs.length;playSong(next)});
  const toggleMusic=()=>musicPanel.classList.toggle('is-open');
  qs('[data-close-music]',musicPanel)?.addEventListener('click',()=>musicPanel.classList.remove('is-open'));

  const radioNav=qs('#oyyaRadioNav');
  if(radioNav){const label=radioNav.querySelector('span:last-child');if(label)label.textContent='موسيقى';radioNav.addEventListener('click',e=>{e.preventDefault();toggleMusic()});}

  const adhan=qs('#adhanToggle');if(adhan){const grid=qs('#oyyaMoreGrid'),card=document.createElement('button');card.type='button';card.className='oyya-adhan-card';card.innerHTML='<b>الأذان</b><small>'+(adhan.checked?'مفعّل':'متوقف')+' · اضغط للتبديل</small>';card.addEventListener('click',()=>{adhan.checked=!adhan.checked;adhan.dispatchEvent(new Event('change'));qs('small',card).textContent=(adhan.checked?'مفعّل':'متوقف')+' · اضغط للتبديل'});grid?.appendChild(card)}
  const tick=()=>fetch('/tick.php',{cache:'no-store',credentials:'same-origin'}).catch(()=>{});setTimeout(tick,5000);setInterval(tick,5000);
})();