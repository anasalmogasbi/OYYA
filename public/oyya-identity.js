(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 async function load(){
  let d;try{d=await fetch('/social_api.php',{credentials:'same-origin',cache:'no-store'}).then(r=>r.json())}catch(e){return}
  if(!d?.ok||!d.me)return;
  const me=d.me;
  const candidates=[
   ...document.querySelectorAll('.oyya-top-actions .avatar,.oyya-circle.avatar,.oyya-reference-top .avatar,a[href*="view=profile"].oyya-circle')
  ];
  candidates.forEach(el=>{
   el.classList.add('oyya-top-profile-avatar');
   el.setAttribute('aria-label',me.name||'الملف الشخصي');
   if(me.avatar){
    el.innerHTML=`<img src="${esc(me.avatar)}" alt="${esc(me.name||'الملف الشخصي')}">`;
   }else{
    el.textContent=(me.name||'أ').trim().slice(0,1)||'أ';
   }
  });
 }
 const run=()=>{load();setTimeout(load,400);setTimeout(load,1300)};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run,{once:true}):run();
})();