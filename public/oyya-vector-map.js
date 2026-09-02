(()=>{
  const params=new URLSearchParams(location.search);
  if((params.get('view')||'feed')!=='map')return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();

  const food=(lock)=>`https://loremflickr.com/900/700/food,restaurant?lock=${lock}`;
  const restaurants=[
    {name:'مطعم النسيم',city:'فينيسيا · بنغازي',lat:32.10185,lng:20.08745,whatsapp:'218910001001',level:3,cover:food(101),gallery:Array.from({length:10},(_,i)=>food(110+i)),description:'أطباق شرقية ومشاوي · إعلان تجريبي على خريطة OYYA'},
    {name:'مطعم روما',city:'فينيسيا · بنغازي',lat:32.10262,lng:20.08910,whatsapp:'218910001002',level:2,cover:food(201),gallery:Array.from({length:10},(_,i)=>food(210+i)),description:'باستا وبيتزا وأطباق إيطالية · إعلان تجريبي على خريطة OYYA'},
    {name:'مطعم ميقانا',city:'فينيسيا · بنغازي',lat:32.10078,lng:20.09035,whatsapp:'218910001003',level:2,cover:food(301),gallery:Array.from({length:10},(_,i)=>food(310+i)),description:'وجبات متنوعة وأطباق يومية · إعلان تجريبي على خريطة OYYA'},
    {name:'مطعم شنابو',city:'فينيسيا · بنغازي',lat:32.10335,lng:20.08620,whatsapp:'218910001004',level:1,cover:food(401),gallery:Array.from({length:10},(_,i)=>food(410+i)),description:'ساندويتشات ووجبات سريعة · إعلان تجريبي على خريطة OYYA'}
  ];

  ready(()=>setTimeout(async()=>{
    const host=document.querySelector('.layout>section')||document.querySelector('.layout')||document.querySelector('.world');
    if(!host||!window.maplibregl)return;
    host.innerHTML='';
    const root=document.createElement('section');root.className='oyya-exp-root';host.appendChild(root);
    root.innerHTML='<div class="oyya-map-stage oyya-vector-stage"><div class="oyya-leaflet-map" id="oyyaVectorLibyaMap"></div><button class="oyya-my-location" type="button" aria-label="اذهب إلى موقعي" title="موقعي"><span>⌖</span></button><div class="oyya-location-status" aria-live="polite"></div><div class="oyya-map-card" aria-live="polite"></div></div>';
    const card=root.querySelector('.oyya-map-card'),locBtn=root.querySelector('.oyya-my-location'),status=root.querySelector('.oyya-location-status');

    const styleEl=document.createElement('style');
    styleEl.textContent=`
      .oyya-vector-stage{position:relative;background:#dfeee8!important}
      .oyya-vector-stage #oyyaVectorLibyaMap{position:absolute;inset:0;width:100%;height:100%}
      .oyya-my-location{position:absolute;z-index:15;right:14px;bottom:92px;width:48px;height:48px;border:0;border-radius:50%;background:#fff;color:#17191d;box-shadow:0 7px 24px #0003;font-size:25px;display:grid;place-items:center;cursor:pointer}
      .oyya-my-location.is-loading{opacity:.65;pointer-events:none}.oyya-my-location.is-active{background:#111;color:#fff}
      .oyya-location-status{position:absolute;z-index:14;right:70px;bottom:99px;background:#111d;color:#fff;border-radius:999px;padding:7px 10px;font:700 11px Tahoma,'Segoe UI',Arial,sans-serif;display:none}.oyya-location-status.on{display:block}
      .oyya-user-dot{width:22px;height:22px;border-radius:50%;background:#2288ff;border:4px solid #fff;box-shadow:0 0 0 5px #2288ff33,0 3px 12px #0004}
      .oyya-snap-ad{border:0;background:transparent;padding:0;cursor:pointer;filter:drop-shadow(0 5px 8px #0004);transform-origin:center bottom}
      .oyya-snap-ad .pic{width:58px;height:58px;border-radius:50%;object-fit:cover;border:4px solid #fff;display:block;background:#eee}
      .oyya-snap-ad .bubble{margin-top:-5px;background:#fff;color:#17191d;border-radius:999px;padding:5px 9px;white-space:nowrap;font:900 10px Tahoma,'Segoe UI',Arial,sans-serif;border:1px solid #e1e4e8;max-width:118px;overflow:hidden;text-overflow:ellipsis}
      .oyya-snap-ad.l3{transform:scale(1.16)}.oyya-snap-ad.l2{transform:scale(1.07)}
      .oyya-map-card{max-height:58vh;overflow:auto;padding:0!important;border-radius:22px!important;direction:rtl}
      .oyya-map-card .oyya-ad-hero{width:100%;height:170px;object-fit:cover;border-radius:22px 22px 0 0;display:block}
      .oyya-map-card .oyya-ad-body{padding:14px}.oyya-map-card .oyya-ad-body h3{margin:0 0 4px;font-size:21px}.oyya-map-card .oyya-ad-body small{color:#777}
      .oyya-ad-gallery{display:grid;grid-auto-flow:column;grid-auto-columns:92px;gap:7px;overflow-x:auto;padding:10px 0 4px;scroll-snap-type:x proximity}.oyya-ad-gallery img{width:92px;height:76px;object-fit:cover;border-radius:12px;scroll-snap-align:start;background:#eee}
      .oyya-map-actions{padding-top:8px}.oyya-map-actions a{display:inline-flex!important;align-items:center;justify-content:center;min-height:38px}
      @media(max-width:560px){.oyya-my-location{right:12px;bottom:88px}.oyya-location-status{right:66px;bottom:95px}.oyya-map-card .oyya-ad-hero{height:145px}}
    `;
    document.head.appendChild(styleEl);

    const map=new maplibregl.Map({
      container:'oyyaVectorLibyaMap',
      style:'https://tiles.openfreemap.org/styles/liberty',
      center:[20.0884,32.1021],zoom:14.6,minZoom:5,maxZoom:19,
      maxBounds:[[8.2,18.2],[26.3,34.3]],
      attributionControl:false,pitchWithRotate:false,dragRotate:false,touchPitch:false
    });
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-left');
    map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-left');

    const snapStyle=()=>{
      const style=map.getStyle();if(!style?.layers)return;
      for(const layer of style.layers){
        const id=String(layer.id||'').toLowerCase(),src=String(layer['source-layer']||'').toLowerCase(),key=id+' '+src;
        try{
          if(layer.type==='background')map.setPaintProperty(layer.id,'background-color','#eaf3f0');
          if(layer.type==='fill'){
            if(/water/.test(key))map.setPaintProperty(layer.id,'fill-color','#b7e6f4');
            else if(/park|green|wood|forest|grass|landcover/.test(key))map.setPaintProperty(layer.id,'fill-color','#cfe8c5');
            else if(/building/.test(key))map.setPaintProperty(layer.id,'fill-color','#e9e4dc');
            else map.setPaintProperty(layer.id,'fill-color','#eef1e9');
          }
          if(layer.type==='line'){
            if(/road|street|transport|motorway|trunk|primary|secondary|tertiary/.test(key)){
              map.setPaintProperty(layer.id,'line-color',/motorway|trunk|primary/.test(key)?'#f5ca69':'#ffffff');
              if(map.getPaintProperty(layer.id,'line-opacity')!==undefined)map.setPaintProperty(layer.id,'line-opacity',1);
            }else if(/boundary/.test(key))map.setPaintProperty(layer.id,'line-color','#c7cdd0');
          }
          if(layer.type==='symbol'){
            if(/poi|school|pharmacy|hospital|clinic|shop|amenity|university/.test(key))map.setLayoutProperty(layer.id,'visibility','none');
            else if(/place|city|town|village|road|street/.test(key)){
              if(map.getPaintProperty(layer.id,'text-color')!==undefined)map.setPaintProperty(layer.id,'text-color','#475159');
              if(map.getPaintProperty(layer.id,'text-halo-color')!==undefined)map.setPaintProperty(layer.id,'text-halo-color','#ffffff');
              if(map.getPaintProperty(layer.id,'text-halo-width')!==undefined)map.setPaintProperty(layer.id,'text-halo-width',1.5);
            }
          }
        }catch(e){}
      }
    };

    const showRestaurant=r=>{
      card.innerHTML=`<img class="oyya-ad-hero" src="${esc(r.cover)}" alt="${esc(r.name)}"><div class="oyya-ad-body"><h3>${esc(r.name)}</h3><small>إعلان ممول · ${esc(r.city)}</small><p>${esc(r.description)}</p><div class="oyya-ad-gallery">${r.gallery.map((u,i)=>`<img src="${esc(u)}" alt="${esc(r.name)} ${i+1}" loading="lazy">`).join('')}</div><div class="oyya-map-actions"><a href="https://wa.me/${esc(r.whatsapp)}" target="_blank" rel="noopener">واتساب</a><a href="/?view=messages">رسائل</a><a href="https://www.google.com/maps?q=${encodeURIComponent(r.lat+','+r.lng)}" target="_blank" rel="noopener">اتجاهات</a></div></div>`;
      card.classList.add('on');map.easeTo({center:[r.lng,r.lat],zoom:15.7,duration:500});
    };
    const addRestaurant=r=>{
      const el=document.createElement('button');el.type='button';el.className=`oyya-snap-ad l${r.level}`;el.innerHTML=`<img class="pic" src="${esc(r.cover)}" alt=""><div class="bubble">${esc(r.name)}</div>`;
      el.addEventListener('click',e=>{e.stopPropagation();showRestaurant(r)});
      new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([r.lng,r.lat]).addTo(map);
    };

    let userMarker=null;
    const tell=(msg)=>{status.textContent=msg;status.classList.add('on');clearTimeout(tell.t);tell.t=setTimeout(()=>status.classList.remove('on'),2600)};
    const locate=()=>{
      if(!navigator.geolocation){tell('الموقع غير مدعوم على هذا الجهاز');return;}
      locBtn.classList.add('is-loading');tell('جار تحديد موقعك…');
      navigator.geolocation.getCurrentPosition(pos=>{
        const lng=pos.coords.longitude,lat=pos.coords.latitude;
        if(userMarker)userMarker.remove();
        const dot=document.createElement('div');dot.className='oyya-user-dot';
        userMarker=new maplibregl.Marker({element:dot,anchor:'center'}).setLngLat([lng,lat]).addTo(map);
        locBtn.classList.remove('is-loading');locBtn.classList.add('is-active');
        map.easeTo({center:[lng,lat],zoom:16,duration:700});tell('هذا موقعك الحالي');
      },err=>{
        locBtn.classList.remove('is-loading');
        tell(err.code===1?'اسمح لـ OYYA بالوصول إلى موقعك':'تعذر تحديد موقعك الآن');
      },{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
    };
    locBtn.addEventListener('click',locate);

    map.on('load',()=>{
      snapStyle();restaurants.forEach(addRestaurant);
      setTimeout(locate,450);
    });
    map.on('styledata',snapStyle);
    map.on('click',()=>card.classList.remove('on'));
  },140));
})();
