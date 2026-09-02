(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>setTimeout(init,180));
  function init(){
    const params=new URLSearchParams(location.search);if((params.get('view')||'feed')!=='feed')return;
    const form=document.querySelector('.oyya-exp-composer');if(!form||document.querySelector('.oyya-publish-launcher'))return;
    const textarea=form.querySelector('textarea[name="text"]');
    const file=form.querySelector('input[type="file"][name="media"]');
    const nearby=form.querySelector('input[name="nearby"]');
    const submit=form.querySelector('button[type="submit"]');
    if(!textarea||!file||!nearby||!submit)return;

    let lat=form.querySelector('input[name="lat"]'),lng=form.querySelector('input[name="lng"]');
    if(!lat){lat=document.createElement('input');lat.type='hidden';lat.name='lat';form.appendChild(lat)}
    if(!lng){lng=document.createElement('input');lng.type='hidden';lng.name='lng';form.appendChild(lng)}

    const launcher=document.createElement('section');launcher.className='oyya-publish-launcher';
    launcher.innerHTML=`<button type="button" class="oyya-publish-avatar" aria-label="إنشاء منشور">أ</button><button type="button" class="oyya-publish-prompt">بم تفكر؟</button><button type="button" class="oyya-publish-quick" data-kind="video" aria-label="فيديو">●</button><button type="button" class="oyya-publish-quick" data-kind="photo" aria-label="صورة">▣</button>`;
    form.parentNode.insertBefore(launcher,form);form.style.display='none';

    const modal=document.createElement('div');modal.className='oyya-publish-modal';modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="oyya-publish-sheet" role="dialog" aria-modal="true" aria-label="إنشاء منشور"><div class="oyya-publish-head"><button type="button" class="oyya-publish-close">×</button><strong>إنشاء منشور</strong><span></span></div><div class="oyya-publish-user"><div class="oyya-publish-avatar big">أ</div><div><b>OYYA</b><div class="oyya-publish-chips"><span>🌐 العامة</span></div></div></div><textarea class="oyya-publish-text" placeholder="بم تفكر؟"></textarea><div class="oyya-publish-tools"><button type="button" data-action="emoji">☺</button><button type="button" data-action="style">Aa</button></div><div class="oyya-publish-add"><b>إضافة إلى منشورك</b><div><button type="button" data-action="photo">▣</button><button type="button" data-action="location">⌖</button><button type="button" data-action="feeling">☺</button><button type="button" data-action="more">•••</button></div></div><label class="oyya-publish-nearby"><input type="checkbox"> <span>حولك</span><small>يظهر كحدث على الخريطة لمدة 24 ساعة</small></label><div class="oyya-publish-location-state"></div><div class="oyya-publish-file-name"></div><button type="button" class="oyya-publish-next" disabled>نشر</button></div>`;
    document.body.appendChild(modal);

    const modalText=modal.querySelector('.oyya-publish-text'),modalNearby=modal.querySelector('.oyya-publish-nearby input'),next=modal.querySelector('.oyya-publish-next'),fileName=modal.querySelector('.oyya-publish-file-name'),locState=modal.querySelector('.oyya-publish-location-state');
    const sync=()=>{const active=modalText.value.trim()!==''||file.files.length>0;next.disabled=!active;next.classList.toggle('on',active);};
    const open=()=>{modal.classList.add('on');modal.setAttribute('aria-hidden','false');document.body.classList.add('oyya-publish-open');modalText.value=textarea.value||'';modalNearby.checked=nearby.checked;locState.textContent='';sync();setTimeout(()=>modalText.focus(),80)};
    const close=()=>{modal.classList.remove('on');modal.setAttribute('aria-hidden','true');document.body.classList.remove('oyya-publish-open')};
    const chooseMedia=()=>file.click();

    launcher.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{if(e.currentTarget.dataset.kind){open();setTimeout(chooseMedia,100);}else open();}));
    modal.querySelector('.oyya-publish-close').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});
    modal.querySelector('[data-action="photo"]').addEventListener('click',chooseMedia);
    modal.querySelector('[data-action="location"]').addEventListener('click',()=>{modalNearby.checked=!modalNearby.checked;locState.textContent=modalNearby.checked?'سيتم استخدام موقعك الحالي عند النشر':'';sync();});
    modalNearby.addEventListener('change',()=>{locState.textContent=modalNearby.checked?'سيتم استخدام موقعك الحالي عند النشر':'';});
    modal.querySelector('[data-action="feeling"]').addEventListener('click',()=>{modalText.value+=(modalText.value?' ':'')+'🙂';sync();modalText.focus();});
    modal.querySelector('[data-action="emoji"]').addEventListener('click',()=>{modalText.value+=(modalText.value?' ':'')+'🙂';sync();modalText.focus();});
    modal.querySelector('[data-action="style"]').addEventListener('click',()=>modalText.classList.toggle('oyya-publish-large-text'));
    modal.querySelector('[data-action="more"]').addEventListener('click',chooseMedia);
    modalText.addEventListener('input',sync);file.addEventListener('change',()=>{fileName.textContent=file.files[0]?.name||'';sync();});
    next.addEventListener('click',()=>{
      textarea.value=modalText.value;nearby.checked=modalNearby.checked;
      if(!modalNearby.checked){lat.value='';lng.value='';submit.click();return;}
      if(!navigator.geolocation){locState.textContent='الموقع غير مدعوم على هذا الجهاز';return;}
      next.disabled=true;locState.textContent='جار تحديد موقع الحدث…';
      navigator.geolocation.getCurrentPosition(pos=>{lat.value=String(pos.coords.latitude);lng.value=String(pos.coords.longitude);locState.textContent='تم تحديد موقع الحدث';submit.click();},err=>{next.disabled=false;locState.textContent=err.code===1?'اسمح لـ OYYA بالموقع حتى يظهر الحدث على الخريطة':'تعذر تحديد موقعك، حاول مرة أخرى';},{enableHighAccuracy:true,timeout:12000,maximumAge:10000});
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('on'))close()});

    const style=document.createElement('style');style.textContent=`
      .oyya-publish-launcher{width:min(720px,calc(100% - 24px));margin:12px auto;background:#fff;border:1px solid #e3e5e8;border-radius:17px;padding:10px 12px;display:flex;align-items:center;gap:9px;direction:rtl;box-shadow:0 1px 2px #0000000a}.oyya-publish-avatar{width:42px;height:42px;min-width:42px;border-radius:50%;border:0;background:#111;color:#fff;font-weight:900}.oyya-publish-avatar.big{display:grid;place-items:center;font-size:16px}.oyya-publish-prompt{flex:1;height:42px;border:0;border-radius:999px;background:#f0f2f5;color:#626871;text-align:right;padding:0 18px;font:500 14px Tahoma,'Segoe UI',Arial,sans-serif;cursor:text}.oyya-publish-quick{width:38px;height:38px;border:0;background:transparent;font-size:21px;font-weight:900}.oyya-publish-quick[data-kind="video"]{color:#f04466}.oyya-publish-quick[data-kind="photo"]{color:#36a852}.oyya-publish-modal{position:fixed;inset:0;z-index:500;background:#0007;display:none;align-items:center;justify-content:center;padding:18px;direction:rtl}.oyya-publish-modal.on{display:flex}.oyya-publish-open{overflow:hidden}.oyya-publish-sheet{width:min(560px,100%);max-height:min(88vh,760px);overflow:auto;background:#fff;border-radius:18px;box-shadow:0 24px 80px #0004;padding-bottom:14px}.oyya-publish-head{height:58px;border-bottom:1px solid #e4e6e9;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;padding:0 12px}.oyya-publish-head strong{text-align:center;font-size:20px}.oyya-publish-close{width:36px;height:36px;border-radius:50%;border:0;background:#e9ecef;font-size:27px;line-height:1}.oyya-publish-user{display:flex;align-items:flex-start;gap:10px;padding:14px}.oyya-publish-user b{display:block;margin-bottom:5px}.oyya-publish-chips{display:flex;gap:6px;flex-wrap:wrap}.oyya-publish-chips span{font-size:11px;background:#eef0f2;padding:5px 8px;border-radius:8px}.oyya-publish-text{width:100%;min-height:170px;border:0!important;outline:0!important;resize:none;padding:8px 18px 18px;background:#fff!important;color:#17191d!important;font:500 20px/1.7 Tahoma,'Segoe UI',Arial,sans-serif!important;box-shadow:none!important}.oyya-publish-text.oyya-publish-large-text{font-size:30px!important;text-align:center;padding-top:45px}.oyya-publish-tools{display:flex;justify-content:space-between;padding:0 16px 12px}.oyya-publish-tools button{border:0;background:transparent;font-size:23px}.oyya-publish-tools [data-action="style"]{width:34px;height:34px;border-radius:8px;color:#fff;background:linear-gradient(135deg,#ff6e52,#ef2fad,#655bff);font-size:15px;font-weight:900}.oyya-publish-add{margin:0 16px 12px;border:1px solid #d9dde2;border-radius:12px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:8px}.oyya-publish-add>b{font-size:13px}.oyya-publish-add>div{display:flex;gap:5px}.oyya-publish-add button{width:34px;height:34px;border:0;background:transparent;font-size:20px}.oyya-publish-add [data-action="photo"]{color:#36a852}.oyya-publish-add [data-action="location"]{color:#f04c5d}.oyya-publish-nearby{margin:0 16px 6px;padding:10px 12px;background:#fffbd0;border:1px solid #f0e76c;border-radius:10px;display:grid;grid-template-columns:auto auto 1fr;gap:6px;align-items:center;font-size:13px}.oyya-publish-nearby small{grid-column:2/4;color:#7b7015;font-size:11px}.oyya-publish-location-state{margin:0 18px 8px;color:#6d6511;font-size:11px}.oyya-publish-file-name{margin:0 16px 8px;font-size:12px;color:#67707a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.oyya-publish-next{display:block;width:calc(100% - 32px);height:43px;margin:8px 16px 0;border:0;border-radius:9px;background:#e2e5e9;color:#a0a6ad;font-weight:900;font-size:14px}.oyya-publish-next.on{background:#fffc00;color:#111;cursor:pointer}@media(max-width:600px){.oyya-publish-modal{padding:0;align-items:stretch}.oyya-publish-sheet{width:100%;max-height:none;height:100%;border-radius:0}.oyya-publish-launcher{border-radius:14px}.oyya-publish-prompt{font-size:13px}}
    `;document.head.appendChild(style);
  }
})();
