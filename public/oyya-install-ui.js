(()=>{
 let promptEvent=null;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;window.__oyyaInstallPrompt=e;});
 const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
 const isAndroid=/android/i.test(navigator.userAgent);
 const isStandalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
 function close(){document.querySelector('.oyya-install-modal')?.remove();document.body.classList.remove('oyya-install-open')}
 function showInstructions(auto=false){
   if(isStandalone||document.querySelector('.oyya-install-modal'))return;
   const m=document.createElement('div');m.className='oyya-install-modal';
   const title=auto?'نزّل تطبيق OYYA':isIOS?'تثبيت OYYA على الآيفون':isAndroid?'تثبيت OYYA على الهاتف':'تثبيت OYYA كتطبيق';
   const intro=auto?'خلي عالمك معك طول الوقت. ثبّت OYYA كتطبيق مستقل على جهازك.':'هذه هي طريقة التثبيت الصحيحة لهذا الجهاز.';
   const steps=isIOS
    ?['افتح OYYA من Safari.','اضغط زر المشاركة.','اختر «إضافة إلى الشاشة الرئيسية».','اضغط «إضافة» وسيظهر OYYA كتطبيق مستقل.']
    :isAndroid
    ?['افتح قائمة Chrome ⋮.','اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».','أكد التثبيت، وبعدها افتح OYYA من أيقونته.']
    :['في Chrome أو Edge ابحث عن رمز التثبيت بجانب شريط العنوان.','أو افتح قائمة المتصفح واختر «تثبيت OYYA».','بعد التثبيت يفتح OYYA في نافذة مستقلة مثل التطبيق.'];
   const primary=(window.__oyyaInstallPrompt||promptEvent)?'<button class="oyya-install-primary" type="button">تثبيت الآن</button>':'';
   m.innerHTML=`<div class="oyya-install-sheet" role="dialog" aria-modal="true"><button class="oyya-install-x" type="button" aria-label="إغلاق">×</button><div class="oyya-install-mark">OYYA</div><h2>${title}</h2><p>${intro}</p>${primary}<div class="oyya-install-steps">${steps.map((s,i)=>`<div><b>${i+1}</b><span>${s}</span></div>`).join('')}</div><button class="oyya-install-later" type="button">لاحقًا</button></div>`;
   document.body.appendChild(m);document.body.classList.add('oyya-install-open');
   m.querySelector('.oyya-install-x').onclick=close;m.querySelector('.oyya-install-later').onclick=close;m.onclick=e=>{if(e.target===m)close()};
   m.querySelector('.oyya-install-primary')?.addEventListener('click',async()=>{await install();close()});
 }
 async function install(){
   const p=window.__oyyaInstallPrompt||promptEvent;
   if(p){try{p.prompt();await p.userChoice;promptEvent=null;window.__oyyaInstallPrompt=null;return}catch(e){}}
   showInstructions(false);
 }
 function bind(){document.querySelectorAll('[data-install-oyya]').forEach(b=>{if(b.dataset.oyyaInstallModern==='1')return;b.dataset.oyyaInstallModern='1';b.onclick=e=>{e.preventDefault();e.stopPropagation();install()};if(isStandalone){b.textContent='OYYA مثبت';b.disabled=true}})}
 const css=document.createElement('style');css.textContent=`
 .oyya-install-open{overflow:hidden!important}.oyya-install-modal{position:fixed;inset:0;z-index:10050;background:rgba(6,8,12,.58);backdrop-filter:blur(8px);display:grid;place-items:center;padding:18px;direction:rtl}.oyya-install-sheet{position:relative;width:min(480px,100%);background:var(--oyya-surface,#fff);color:var(--oyya-text,#15171a);border:1px solid var(--oyya-line,#e6e8ec);border-radius:28px;padding:28px;box-shadow:0 30px 100px rgba(0,0,0,.28)}.oyya-install-x{position:absolute;left:16px;top:16px;width:38px;height:38px;border:0;border-radius:50%;background:var(--oyya-bg,#f1f3f5);color:inherit;font-size:26px;cursor:pointer}.oyya-install-mark{display:inline-flex;align-items:center;justify-content:center;min-width:92px;height:44px;padding:0 18px;border-radius:14px;background:linear-gradient(135deg,var(--oyya-accent,#fffc00),var(--oyya-accent-2,#ffd400));color:var(--oyya-accent-ink,#111);font:1000 22px Arial,sans-serif;letter-spacing:2px}.oyya-install-sheet h2{margin:18px 0 7px;font-size:25px}.oyya-install-sheet>p{margin:0;color:var(--oyya-muted,#727883);font-size:13px;line-height:1.8}.oyya-install-primary,.oyya-install-later{width:100%;height:46px;border:0;border-radius:14px;font-weight:900;cursor:pointer}.oyya-install-primary{margin-top:18px;background:linear-gradient(135deg,var(--oyya-accent,#fffc00),var(--oyya-accent-2,#ffd400));color:var(--oyya-accent-ink,#111)}.oyya-install-later{background:#111;color:#fff}.oyya-install-steps{display:grid;gap:9px;margin:20px 0}.oyya-install-steps>div{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;padding:11px 12px;border-radius:15px;background:var(--oyya-bg,#f5f6f8)}.oyya-install-steps b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--oyya-accent,#fffc00),var(--oyya-accent-2,#ffd400));color:var(--oyya-accent-ink,#111)}.oyya-install-steps span{font-size:13px;line-height:1.6}@media(max-width:560px){.oyya-install-modal{align-items:end;padding:0}.oyya-install-sheet{width:100%;border-radius:26px 26px 0 0;padding:24px 18px max(22px,env(safe-area-inset-bottom))}.oyya-install-sheet h2{font-size:22px}}
 `;document.head.appendChild(css);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 const ready=()=>{bind();setTimeout(bind,700);setTimeout(bind,1800);if(!isStandalone){const delay=10000+Math.floor(Math.random()*20001);setTimeout(()=>showInstructions(true),delay)}};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',ready,{once:true}):ready();
})();