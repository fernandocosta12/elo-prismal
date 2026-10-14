/* ================== v88: batalha mais calma (x1 = metade do ritmo antigo) e Prismais menores na batalha ================== */
const SPD88={1:.5,2:.75,3:1,4:1.3};
loop=(function(o){return function(){try{if(typeof S!=='undefined'&&S&&typeof B!=='undefined'&&B&&!(B.hsUntil&&performance.now()<B.hsUntil)&&!(B.hold>0&&!B.paused&&!B.over)){const inc=S.speed>=2?1.5:1;B.acc=(B.acc||0)-(inc-(SPD88[S.spd4||1]||.5));}}catch(e){}return o.apply(this,arguments);};})(loop);
fxK=function(){const k=(typeof S!=='undefined'&&S&&S.spd4)||1;return k>=4?.6:k>=3?.8:1;};
(function(){const st=document.createElement('style');st.id='v88css';st.textContent=`
html body[data-tab="explorar"] #arena .unit[class*="sp-"]:not(.pl):not(.big) .spr{width:76px!important;height:76px!important}
html body[data-tab="explorar"] #arena .unit.e[class*="sp-"]:not(.big) .spr{width:86px!important;height:86px!important}
html body[data-tab="explorar"] #arena .unit.big[class*="sp-"] .spr{width:124px!important;height:124px!important}
html body[data-tab="explorar"] #arena .unit[class*="sp-"]:not(.big) .shadow{width:56px!important}
@media (max-height:760px){html body[data-tab="explorar"] #arena .unit[class*="sp-"]:not(.pl):not(.big) .spr{width:62px!important;height:62px!important}
html body[data-tab="explorar"] #arena .unit.e[class*="sp-"]:not(.big) .spr{width:70px!important;height:70px!important}
html body[data-tab="explorar"] #arena .unit.big[class*="sp-"] .spr{width:108px!important;height:108px!important}}`;document.head.appendChild(st);})();
