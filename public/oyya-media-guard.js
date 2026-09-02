(()=>{
 const allowedSel=[
  '.oyya-exp-post','.post','.oyya-profile-page','.oyya-prof-card','.oyya-own-profile',
  '.oyya-production-viewer','.oyya-media-viewer','.oyya-tk-reel','.oyya-tk-comments','.oyya-tk-upload-modal',
  '.oyya-map-stage','.oyya-event-frame','.oyya-publish-modal','.oyya-business-card','.oyya-auth-page',
  '.oyya-theme-card','.oyya-install-modal','.oyya-top-profile-avatar','.oyya-reference-brand','.oyya-logo-badge'
 ].join(',');
 const view=new URLSearchParams(location.search).get('view')||'feed';
 function validMedia(el){
  if(!(el instanceof HTMLImageElement||el instanceof HTMLVideoElement||el instanceof HTMLPictureElement))return true;
  if(el.closest(allowedSel))return true;
  if(el.closest('#oyyaSmartNav,#oyyaBottomShell,#oyyaMoreSheet'))return true;
  return false;
 }
 function sweep(){
  document.querySelectorAll('img,video,picture').forEach(el=>{
   if(validMedia(el))return;
   const r=el.getBoundingClientRect();
   const huge=r.width>Math.max(320,innerWidth*.32)||r.height>Math.max(320,innerHeight*.45)||el.parentElement===document.body;
   if(huge){el.style.setProperty('display','none','important');el.setAttribute('data-oyya-rogue-media','1');}
  });
  if(view!=='reels')document.querySelectorAll('.oyya-tk-root,.oyya-tk-reel').forEach(x=>x.remove());
  if(view!=='feed')document.querySelectorAll('.oyya-exp-root .oyya-exp-posts,.oyya-publish-launcher,.oyya-exp-composer').forEach(x=>x.remove());
 }
 const ready=()=>{sweep();setTimeout(sweep,120);setTimeout(sweep,500);setTimeout(sweep,1400);new MutationObserver(()=>requestAnimationFrame(sweep)).observe(document.body,{childList:true,subtree:true});};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',ready,{once:true}):ready();
})();