(()=>{
  const KEY='oyya_theme_v1';
  const allowed=['yellow','neon','purple','pink','gold','cyan','dark'];
  const saved=localStorage.getItem(KEY);
  const current=allowed.includes(saved)?saved:'yellow';
  document.documentElement.setAttribute('data-oyya-theme',current);
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const view=new URLSearchParams(location.search).get('view')||'feed';
    if(view!=='profile')return;
    const host=document.querySelector('.layout>section')||document.querySelector('.layout')||document.querySelector('.world');
    if(!host||document.querySelector('.oyya-theme-card'))return;
    const card=document.createElement('section');
    card.className='oyya-theme-card';
    card.innerHTML='<h3>ثيم OYYA</h3><p>اختر لون عالمك. الخريطة تبقى صفراء، والتفاعلات تبقى حمراء، والرموز الطبيعية تحتفظ بألوانها.</p><div class="oyya-theme-grid"></div>';
    const options=[
      ['yellow','أصفر OYYA'],['neon','أخضر فاقع'],['purple','أرجواني'],['pink','بينك'],['gold','قولد'],['cyan','سماوي'],['dark','داكن']
    ];
    const grid=card.querySelector('.oyya-theme-grid');
    options.forEach(([id,label])=>{
      const b=document.createElement('button');
      b.type='button';b.className='oyya-theme-option';b.dataset.theme=id;b.setAttribute('aria-pressed',id===current?'true':'false');
      b.innerHTML='<span class="swatch"></span><span>'+label+'</span>';
      b.addEventListener('click',()=>{
        localStorage.setItem(KEY,id);document.documentElement.setAttribute('data-oyya-theme',id);
        grid.querySelectorAll('.oyya-theme-option').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
      });
      grid.appendChild(b);
    });
    host.prepend(card);
  });
})();
