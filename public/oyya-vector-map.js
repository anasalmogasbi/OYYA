(()=>{
  const params=new URLSearchParams(location.search);
  if((params.get('view')||'feed')!=='map')return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>setTimeout(async()=>{
    const host=document.querySelector('.layout>section')||document.querySelector('.layout')||document.querySelector('.world');
    if(!host||!window.maplibregl)return;
    let data;try{const r=await fetch('/experience.php',{credentials:'same-origin',cache:'no-store'});data=await r.json();}catch(e){return;}if(!data?.ok)return;
    host.innerHTML='';
    const root=document.createElement('section');root.className='oyya-exp-root';host.appendChild(root);
    root.innerHTML='<div class="oyya-map-stage oyya-vector-stage"><div class="oyya-leaflet-map" id="oyyaVectorLibyaMap"></div><div class="oyya-map-title">خريطة الأحداث · ليبيا</div><div class="oyya-map-card" aria-live="polite"></div><div class="oyya-map-zoom-note">اسحب وكبّر لرؤية ما يحدث</div></div>';
    const card=root.querySelector('.oyya-map-card');
    const map=new maplibregl.Map({
      container:'oyyaVectorLibyaMap',
      style:'https://tiles.openfreemap.org/styles/liberty',
      center:[17.2,27.3],zoom:4.75,minZoom:4.5,maxZoom:18,
      maxBounds:[[8.2,18.2],[26.3,34.3]],
      attributionControl:false,pitchWithRotate:false,dragRotate:false,touchPitch:false
    });
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-left');
    map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-left');

    const snapStyle=()=>{
      const style=map.getStyle();if(!style?.layers)return;
      for(const layer of style.layers){
        const id=String(layer.id||'').toLowerCase();
        const src=String(layer['source-layer']||'').toLowerCase();
        try{
          if(layer.type==='background')map.setPaintProperty(layer.id,'background-color','#eef3f5');
          if(layer.type==='fill'){
            if(/water/.test(id+' '+src))map.setPaintProperty(layer.id,'fill-color','#b9e8f6');
            else if(/park|green|wood|forest|grass|landcover/.test(id+' '+src))map.setPaintProperty(layer.id,'fill-color','#cfe8c4');
            else if(/building/.test(id+' '+src))map.setPaintProperty(layer.id,'fill-color','#e5e0d8');
            else map.setPaintProperty(layer.id,'fill-color','#edf0e9');
            if(map.getPaintProperty(layer.id,'fill-opacity')!==undefined)map.setPaintProperty(layer.id,'fill-opacity',0.92);
          }
          if(layer.type==='line'){
            if(/road|street|transport|motorway|trunk|primary|secondary|tertiary/.test(id+' '+src)){
              map.setPaintProperty(layer.id,'line-color',/motorway|trunk|primary/.test(id)?'#f7cf73':'#ffffff');
              if(map.getPaintProperty(layer.id,'line-opacity')!==undefined)map.setPaintProperty(layer.id,'line-opacity',1);
            } else if(/boundary/.test(id+' '+src)){
              map.setPaintProperty(layer.id,'line-color','#c5cbd0');
            }
          }
          if(layer.type==='symbol'){
            if(/poi|school|pharmacy|hospital|clinic|shop|amenity/.test(id+' '+src))map.setLayoutProperty(layer.id,'visibility','none');
            else if(/place|city|town|village/.test(id+' '+src)){
              if(map.getPaintProperty(layer.id,'text-color')!==undefined)map.setPaintProperty(layer.id,'text-color','#4b5359');
              if(map.getPaintProperty(layer.id,'text-halo-color')!==undefined)map.setPaintProperty(layer.id,'text-halo-color','#ffffff');
            }
          }
        }catch(e){}
      }
    };

    const markerEl=(item,type)=>{
      const el=document.createElement('button');el.type='button';
      if(type==='public'){el.className='oyya-map-marker public';el.textContent='●';}
      else if(type==='post'){el.className='oyya-map-marker post';el.textContent='◆';}
      else{const lvl=Math.max(1,Math.min(3,Number(item.promoted_level||1)));el.className='oyya-map-marker promo l'+lvl;el.textContent=item.name||'إعلان';}
      return el;
    };
    const show=(it,type)=>{
      const isBiz=type==='promo',title=isBiz?it.name:(type==='post'?(it.user?.name||'منشور حولك'):it.name),text=isBiz?it.description:(type==='post'?it.text:it.description),lat=Number(it.lat??it.map_lat),lng=Number(it.lng??it.map_lng);
      card.innerHTML=`<h3>${esc(title)}</h3><div>${esc(text||'')}</div><small>${esc(it.city||'')}</small><div class="oyya-map-actions">${isBiz&&it.whatsapp?`<a href="https://wa.me/${esc(it.whatsapp)}" target="_blank" rel="noopener">واتساب</a>`:''}<a href="/?view=messages">رسائل</a><a href="https://www.google.com/maps?q=${encodeURIComponent(lat+','+lng)}" target="_blank" rel="noopener">اتجاهات</a></div>`;
      card.classList.add('on');map.easeTo({center:[lng,lat],duration:450});
    };
    const add=(item,type)=>{const lat=Number(item.lat??item.map_lat),lng=Number(item.lng??item.map_lng);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;const el=markerEl(item,type);el.addEventListener('click',e=>{e.stopPropagation();show(item,type)});new maplibregl.Marker({element:el,anchor:'center'}).setLngLat([lng,lat]).addTo(map);};

    map.on('load',()=>{
      snapStyle();
      const official=[
        {name:'جامعة بنغازي',description:'جامعة حكومية',city:'بنغازي',lat:32.05687,lng:20.05308},
        {name:'جامعة العرب الطبية',description:'جامعة طبية',city:'بنغازي',lat:32.1071573267,lng:20.1335959328},
        {name:'مركز بنغازي الطبي',description:'مستشفى تابع للدولة',city:'بنغازي',lat:32.07914,lng:20.09857},
        {name:'مستشفى الجلاء للجراحة والحوادث',description:'مستشفى تابع للدولة',city:'بنغازي',lat:32.11025,lng:20.09041}
      ];
      official.forEach(x=>add(x,'public'));
      (data.map.entities||[]).filter(e=>!['school','pharmacy','university','hospital','clinic'].includes(String(e.category||''))).forEach(e=>add(e,e.public_map?'public':'promo'));
      (data.map.posts||[]).forEach(p=>add(p,'post'));
    });
    map.on('styledata',snapStyle);
    map.on('click',()=>card.classList.remove('on'));
  },140));
})();
