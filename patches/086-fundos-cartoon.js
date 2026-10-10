/* ================== v86: cenários de batalha cartoon com perspectiva (imagens em bg86/) + profundidade das unidades ================== */
(function(){try{
  const BGK=['vale','bosque','charco','picos','costa','deserto','pantano','cume','recife','coracao','abismo','estelar','arena','torre'];
  const V='?v=2';
  BGK.forEach(k=>{IMG['bg_'+k]='bg86/'+k+'.webp'+V;});
  for(const r in REG){if(!BGK.includes(r))IMG['bg_'+r]='bg86/'+(BGK.includes(REG[r].bg)?REG[r].bg:'vale')+'.webp'+V;}
  const st=document.createElement('style');st.id='v86css';st.textContent=`html body #arena .bgimg,html body[data-tab] #arena .bgimg{background-size:cover!important;background-position:center bottom!important;background-repeat:no-repeat!important;filter:none!important;animation:none!important}
html body #arena.night .bgimg,html body[data-tab] #arena.night .bgimg{filter:brightness(.72) saturate(.9)!important}
html body #arena.storm .bgimg,html body[data-tab] #arena.storm .bgimg{filter:brightness(.84) saturate(.85)!important}
html body #arena.scene::after,html body[data-tab] #arena::after{opacity:.18!important}
html body #arena .vig{opacity:.2!important}html body #arena .fogl{opacity:.25!important}html body #arena .fog{opacity:.55!important}
body[data-tab="explorar"] #arena .unit .spr{scale:var(--dz,1);transform-origin:50% 100%}
body[data-tab="explorar"] #arena .unit .shadow{scale:var(--dz,1);opacity:.95}`;document.head.appendChild(st);
}catch(e){console.warn('v86',e);}})();
unitHTML=(function(o){return function(u,pos){let h=o.apply(this,arguments);try{if(typeof tab!=='undefined'&&tab==='explorar'&&pos){const b=+pos[1]||0;const dz=Math.max(.8,1-b*.003);h=h.replace('style="',`style="--dz:${dz.toFixed(3)};`);}}catch(e){}return h;};})(unitHTML);
