(()=>{
  const q=new URLSearchParams(location.search),view=q.get('view')||'feed';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const split=s=>String(s||'').split(/[،,]/).map(x=>x.trim()).filter(Boolean);
  const host=()=>document.querySelector('.layout>section')||document.querySelector('.layout')||document.querySelector('.world');
  const api=(fd)=>fetch('/social_api.php',{method:'POST',body:fd,credentials:'same-origin'}).then(r=>r.json());
  const get=()=>fetch('/social_api.php',{credentials:'same-origin',cache:'no-store'}).then(r=>r.json());
  const toast=m=>{let e=document.querySelector('.oyya-social-toast');if(!e){e=document.createElement('div');e.className='oyya-social-toast';document.body.appendChild(e)}e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)};
  const media=m=>!m?'':String(m.mime||'').startsWith('image/')?`<img class="oyya-social-media" src="${esc(m.url)}" alt="">`:String(m.mime||'').startsWith('video/')?`<video class="oyya-social-media" src="${esc(m.url)}" controls playsinline></video>`:'';
  const avatar=u=>u?.avatar?`<img src="${esc(u.avatar)}" alt="${esc(u.name||'')}">`:`<span>${esc((u?.name||'?').slice(0,1))}</span>`;

  function bindNearbyComposer(){
    document.querySelectorAll('form').forEach(f=>{
      const near=f.querySelector('input[name="nearby"]');const action=f.querySelector('input[name="action"][value="post"]');if(!near||!action||f.dataset.geoBound)return;f.dataset.geoBound='1';
      f.addEventListener('submit',e=>{if(!near.checked||f.dataset.geoReady==='1')return;e.preventDefault();if(!navigator.geolocation){f.submit();return;}toast('نحدد موقع المنشور حولك…');navigator.geolocation.getCurrentPosition(p=>{['lat','lng'].forEach(k=>f.querySelector(`input[name="${k}"]`)?.remove());const lat=document.createElement('input'),lng=document.createElement('input');lat.type=lng.type='hidden';lat.name='lat';lng.name='lng';lat.value=p.coords.latitude;lng.value=p.coords.longitude;f.append(lat,lng);f.dataset.geoReady='1';f.requestSubmit();},()=>{toast('تعذر تحديد الموقع، سنستخدم آخر موقع محفوظ');f.dataset.geoReady='1';f.requestSubmit();},{enableHighAccuracy:true,timeout:9000,maximumAge:30000});});
    });
  }

  function commentHtml(c){return `<div class="oyya-comment-row"><div class="oyya-comment-avatar">${avatar(c.user)}</div><div class="oyya-comment-body"><b>${esc(c.user?.name||'مستخدم')}</b>${c.text?`<p>${esc(c.text)}</p>`:''}${c.media&&String(c.media.mime||'').startsWith('audio/')?`<audio controls preload="metadata" src="${esc(c.media.url)}"></audio>`:''}</div></div>`}
  function enhanceFeed(data){
    const postsById=new Map(data.posts.map(p=>[String(p.id),p]));
    document.querySelectorAll('.oyya-exp-post').forEach(card=>{
      const pid=card.querySelector('input[name="post_id"]')?.value;if(!pid||card.dataset.socialBound)return;const p=postsById.get(String(pid));if(!p)return;card.dataset.socialBound='1';
      const userHead=card.querySelector('.oyya-exp-user');if(userHead){userHead.style.cursor='pointer';userHead.addEventListener('click',()=>location.href='/?view=profile&user='+encodeURIComponent(p.user_id));}
      const comments=document.createElement('div');comments.className='oyya-social-comments';comments.innerHTML=(p.comments||[]).map(commentHtml).join('');card.appendChild(comments);
      const tools=document.createElement('div');tools.className='oyya-social-comment-tools';tools.innerHTML=`<form class="oyya-inline-comment"><input name="text" placeholder="اكتب تعليقًا"><button>إرسال</button></form><button class="oyya-voice-btn" type="button" title="تعليق صوتي">🎙️</button>`;card.appendChild(tools);
      const cf=tools.querySelector('form');cf.addEventListener('submit',async e=>{e.preventDefault();const text=cf.elements.text.value.trim();if(!text)return;const fd=new FormData();fd.append('action','comment');fd.append('post_id',pid);fd.append('text',text);const r=await api(fd);if(r.ok){toast('تم التعليق');location.reload()}else toast(r.message||'تعذر التعليق')});
      const vb=tools.querySelector('.oyya-voice-btn');let rec=null,chunks=[];vb.addEventListener('click',async()=>{try{if(rec&&rec.state==='recording'){rec.stop();vb.classList.remove('recording');vb.textContent='🎙️';return;}const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];rec=new MediaRecorder(stream);rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});const fd=new FormData();fd.append('action','voice_comment');fd.append('post_id',pid);fd.append('voice',blob,'voice.webm');const r=await api(fd);toast(r.ok?'تم إرسال التعليق الصوتي':(r.message||'تعذر الإرسال'));if(r.ok)location.reload()};rec.start();vb.classList.add('recording');vb.textContent='■';toast('يتم التسجيل… اضغط للإرسال');}catch(e){toast('اسمح للميكروفون لإرسال تعليق صوتي')}});
    });
  }

  function renderOwnProfile(data){
    if(view!=='profile'||q.get('user'))return;const h=host(),u=data.me;if(!h||!u)return;
    const mine=data.posts.filter(p=>p.user_id===u.id);
    h.innerHTML=`<section class="oyya-own-profile"><div class="oyya-own-cover">${u.cover?`<img src="${esc(u.cover)}" alt="">`:''}<label>تغيير الغلاف<input type="file" accept="image/*" data-upload="cover_upload"></label></div><div class="oyya-own-head"><div class="oyya-own-avatar">${avatar(u)}<label>✎<input type="file" accept="image/*" data-upload="avatar_upload"></label></div><div><h1>${esc(u.name)}</h1><p>${esc(u.headline||'أضف مسماك أو تعريفك')}</p><small>${esc(u.city||'')}</small></div><button class="oyya-edit-profile" type="button">تعديل الملف</button></div><div class="oyya-own-layout"><main><section class="oyya-profile-block"><h3>نبذة</h3><p>${esc(u.bio||'أضف نبذة تعرف الناس بك.')}</p></section><section class="oyya-profile-block"><h3>منشوراتي</h3><div class="oyya-own-posts">${mine.map(p=>`<article><div>${esc(p.text||'')}</div>${media(p.media)}${p.nearby?'<small>📍 ظهر على خريطة الأحداث 24 ساعة</small>':''}<span>♥ ${p.likes_count||0} · ${(p.comments||[]).length} تعليق</span></article>`).join('')||'<p class="muted">لم تنشر شيئًا بعد.</p>'}</div></section></main><aside><section class="oyya-profile-block"><h3>المهارات</h3><div class="oyya-profile-tags">${split(u.skills).map(x=>`<span>${esc(x)}</span>`).join('')}</div></section><section class="oyya-profile-block"><h3>أقدم</h3><p>${esc(u.offers||'—')}</p></section><section class="oyya-profile-block"><h3>أبحث عن</h3><p>${esc(u.seeks||'—')}</p></section></aside></div></section>`;
    h.querySelectorAll('input[data-upload]').forEach(inp=>inp.addEventListener('change',async()=>{if(!inp.files[0])return;const fd=new FormData();fd.append('action',inp.dataset.upload);fd.append('image',inp.files[0]);const r=await api(fd);toast(r.ok?'تم تحديث الصورة':(r.message||'تعذر الرفع'));if(r.ok)location.reload()}));
    h.querySelector('.oyya-edit-profile')?.addEventListener('click',()=>openEditor(u));
  }
  function openEditor(u){const d=document.createElement('div');d.className='oyya-edit-modal';d.innerHTML=`<form class="oyya-edit-card"><button type="button" class="x">×</button><h2>تعديل ملفك</h2>${[['name','الاسم'],['headline','المسمى/التعريف'],['city','المدينة'],['company','الشركة أو الجهة'],['education','التعليم'],['experience','الخبرة'],['skills','المهارات'],['interests','الاهتمامات'],['hobbies','الهوايات'],['offers','أقدم'],['seeks','أبحث عن']].map(([k,l])=>`<label>${l}<input name="${k}" value="${esc(u[k]||'')}"></label>`).join('')}<label>نبذة<textarea name="bio">${esc(u.bio||'')}</textarea></label><button class="save">حفظ التعديلات</button></form>`;document.body.appendChild(d);d.querySelector('.x').onclick=()=>d.remove();d.addEventListener('click',e=>{if(e.target===d)d.remove()});d.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);fd.append('action','profile_save');const r=await api(fd);toast(r.ok?'تم حفظ الملف':(r.message||'تعذر الحفظ'));if(r.ok)location.reload()});}

  get().then(data=>{if(!data.ok)return;setTimeout(()=>{bindNearbyComposer();if(view==='feed')enhanceFeed(data);renderOwnProfile(data)},220)}).catch(()=>{});
})();
