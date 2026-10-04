/* ================== v81: animação viva, sem auto-equipar + avisos, tela de item clara, joias novas, poder 40/60, maestria, evoluir em lote com prévia, mercado, velocidades ================== */
/* ---------- selo da Lovable fora ---------- */
(function(){const st=document.createElement('style');st.textContent='#lovable-badge,[id^="lovable-badge"],a[href*="lovable.dev"][style*="fixed"]{display:none!important}';document.head.appendChild(st);setInterval(()=>{try{const b=document.getElementById('lovable-badge');if(b)b.remove();}catch(e){}},1500);})();

/* ---------- 1. (animação em duas partes removida a pedido do usuário) ---------- */
(function(){const st=document.createElement('style');st.id='v81anim';st.textContent=`
.orb73.hit{animation-duration:.2s!important}
`;document.head.appendChild(st);})();

/* ---------- 2. sem equipar sozinho + bolinhas de equipamento melhor ---------- */
function better81(){try{return ensureGear().inv.filter(betterThanEq);}catch(e){return [];}}
setInterval(()=>{try{const G=ensureGear();if(G.auto)G.auto=false;}catch(e){}},1000);
function dot81(el,on){if(!el)return;let d=el.querySelector(':scope > .d81');if(on&&!d){d=document.createElement('i');d.className='d81';el.appendChild(d);}if(!on&&d)d.remove();}
function dots81(){try{const bt=better81(),slots=new Set(bt.map(g=>g.slot));
  dot81(document.querySelector('nav.tabs [data-tab="personagem"]'),bt.length>0);
  document.querySelectorAll('[data-mt="equip"]').forEach(b=>dot81(b,bt.length>0));
  document.querySelectorAll('.gslot[data-gs]').forEach(b=>dot81(b,slots.has(b.dataset.gs)));
  const evs=imp81();document.querySelectorAll('[data-bt="time"]').forEach(b=>{const d=b.querySelector('.d75');if(!d)dot81(b,evs.length>0);else dot81(b,false);});
  document.querySelectorAll('main .teamcard .slot[data-sw]').forEach(s=>{const p=S.prim.find(x=>x.id===S.team[+s.dataset.sw]);const on=!!(p&&evs.includes(p));if(!s.querySelector('.d75'))dot81(s,on);});
  const nv=document.querySelector('nav.tabs [data-tab="bestiario"]');if(nv&&evs.length&&!nv.querySelector('.d75'))dot81(nv,true);}catch(e){}}
setInterval(dots81,1200);

/* ---------- 3. tela do equipamento mais clara ---------- */
openInv=(function(o){return function(slot){o.apply(this,arguments);try{const m=document.querySelector('#modalRoot .modal');if(!m)return;const G=ensureGear();
  const lab=m.querySelector('#gAuto');if(lab&&lab.closest('label'))lab.closest('label').style.display='none';
  if(!m.querySelector('.i81help')){const h=document.createElement('div');h.className='i81help';h.innerHTML=`<b>Como funciona</b><span>Toque em <b>Equipar</b> para usar o item. <b>+1</b> deixa o item mais forte com ouro. <b>Refinar</b> sobe o nível do item até o seu. <b>Vender</b> dá ouro e <b>Dissolver</b> dá Pó. Itens com <i class="up81">▲</i> são melhores que o equipado.</span>`;const gl=m.querySelector('.glist');if(gl)gl.before(h);}
  m.querySelectorAll('.gitem').forEach(it=>{if(it.dataset.i81)return;it.dataset.i81=1;const bb=it.querySelector('[data-eq],[data-up],[data-sell],[data-dis],[data-rf]');if(!bb)return;const id=+(bb.dataset.eq||bb.dataset.up||bb.dataset.sell||bb.dataset.dis||bb.dataset.rf);const g=G.inv.find(x=>x.id===id);if(!g)return;
   const cur=G.inv.find(x=>x.id===G.eq[g.slot]);const on=cur&&cur.id===g.id;const diff=cur&&!on?gearPower(g)-gearPower(cur):0;
   const tx=it.querySelector('.gtx');if(tx&&!on&&cur){const s=document.createElement('span');s.className='cmp81 '+(diff>0?'pos':diff<0?'neg':'');s.textContent=diff>0?`▲ +${fmt(diff)} de poder se equipar`:diff<0?`▼ ${fmt(diff)} de poder (mais fraco)`:'Mesmo poder do equipado';tx.appendChild(s);}
   if(on){it.classList.add('on81');}
   const act=it.querySelector('.gact');if(!act)return;const main=act.querySelector('[data-eq]')||act.querySelector('.chip');const rest=[...act.children].filter(x=>x!==main);
   if(rest.length){const more=document.createElement('div');more.className='more81';rest.forEach(x=>more.appendChild(x));const tg=document.createElement('button');tg.className='btn sm tg81';tg.textContent='Mais ações ▾';tg.onclick=()=>{it.classList.toggle('open81');tg.textContent=it.classList.contains('open81')?'Fechar ▴':'Mais ações ▾';};act.appendChild(tg);act.after(more);}
   const up=it.querySelector('[data-up]');if(up)up.innerHTML=up.innerHTML.replace(/^\+1 · /,'Melhorar +1 · ');const sl=it.querySelector('[data-sell]');if(sl&&!/Vender ·/.test(sl.textContent))sl.textContent=sl.textContent.replace('Vender ','Vender · ');});}catch(e){}};})(openInv);

/* ---------- 4. joias desenhadas ---------- */
const GEMSVG81={
 rubi:(c,d,l)=>`<polygon points="12,2 19,5.5 22,12 19,18.5 12,22 5,18.5 2,12 5,5.5" fill="url(#g${l})" stroke="${d}" stroke-width="1"/><polygon points="12,6 16.5,8.5 18,12 16.5,15.5 12,18 7.5,15.5 6,12 7.5,8.5" fill="${c}" opacity=".85"/><path d="M12 2v4M22 12h-4M12 22v-4M2 12h4M5 5.5l2.5 3M19 5.5l-2.5 3M19 18.5l-2.5-3M5 18.5l2.5-3" stroke="${d}" stroke-width=".6" opacity=".6"/>`,
 safira:(c,d,l)=>`<path d="M12 2 C16 7 19.5 10.5 19.5 14.5 A7.5 7.5 0 0 1 4.5 14.5 C4.5 10.5 8 7 12 2Z" fill="url(#g${l})" stroke="${d}" stroke-width="1"/><path d="M12 7 C14.5 10 16 12 16 14.5 A4 4 0 0 1 8 14.5 C8 12 9.5 10 12 7Z" fill="${c}" opacity=".8"/><path d="M12 2v5M4.6 14.5H8M19.4 14.5H16M12 22v-3.5" stroke="${d}" stroke-width=".6" opacity=".55"/>`,
 esmeralda:(c,d,l)=>`<polygon points="7,3 17,3 21,7 21,17 17,21 7,21 3,17 3,7" fill="url(#g${l})" stroke="${d}" stroke-width="1"/><polygon points="9,6.5 15,6.5 17.5,9 17.5,15 15,17.5 9,17.5 6.5,15 6.5,9" fill="${c}" opacity=".75" stroke="${d}" stroke-width=".5"/><rect x="9.5" y="9.5" width="5" height="5" fill="${c}" opacity=".9"/>`,
 topazio:(c,d,l)=>`<polygon points="12,2 20.5,7 20.5,17 12,22 3.5,17 3.5,7" fill="url(#g${l})" stroke="${d}" stroke-width="1"/><polygon points="12,6.5 16.5,9.3 16.5,14.7 12,17.5 7.5,14.7 7.5,9.3" fill="${c}" opacity=".8"/><path d="M12 2v4.5M20.5 7l-4 2.3M20.5 17l-4-2.3M12 22v-4.5M3.5 17l4-2.3M3.5 7l4 2.3" stroke="${d}" stroke-width=".6" opacity=".6"/>`};
function shade81(h,a){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,t=Math.abs(a);r=Math.round((f-r)*t+r);g=Math.round((f-g)*t+g);b=Math.round((f-b)*t+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
let gid81=0;
gemIc=function(t,l,small){const G=GEMS[t];if(!G)return '';const c=G.c,lt=shade81(c,.55),dk=shade81(c,-.5),id='q'+(++gid81);const lv=Math.max(1,Math.min(5,l||1));
  const shape=(GEMSVG81[t]||GEMSVG81.rubi)(c,dk,id);const glow=lv>=4?`<circle cx="12" cy="12" r="11" fill="url(#h${id})"/>`:'';
  return `<span class="gem81 ${small?'sm':''} lv${lv}" title="${G.n} Nv ${lv}"><svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="g${id}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${lt}"/><stop offset=".65" stop-color="${c}"/><stop offset="1" stop-color="${dk}"/></radialGradient><radialGradient id="h${id}"><stop offset=".55" stop-color="${c}" stop-opacity=".0"/><stop offset="1" stop-color="${c}" stop-opacity=".35"/></radialGradient></defs>${glow}${shape}<path d="M7 7.5 Q9 5.5 11.5 5.2" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="16.5" cy="8" r=".9" fill="#fff" opacity=".9"/></svg>${l?`<b class="num">${l}</b>`:''}</span>`;};
(function(){const st=document.createElement('style');st.textContent=`
.gem81{position:relative;display:inline-flex;width:34px;height:34px;align-items:center;justify-content:center;vertical-align:middle;filter:drop-shadow(0 2px 2px rgba(60,30,5,.3))}
.gem81 svg{width:100%;height:100%}
.gem81.sm{width:22px;height:22px}
.gem81 b{position:absolute;right:-3px;bottom:-3px;min-width:15px;height:15px;padding:0 3px;border-radius:8px;background:#4a2a12;color:#fff7e6;font-size:10px;line-height:15px;text-align:center;border:1.5px solid #fff6e2;font-family:Nunito,system-ui,sans-serif;font-weight:800}
.gem81.sm b{min-width:12px;height:12px;line-height:12px;font-size:8.5px;right:-4px;bottom:-4px}
.gem81.lv5 svg{animation:gs81 2.4s ease-in-out infinite}@keyframes gs81{50%{filter:brightness(1.25) drop-shadow(0 0 3px #fff8)}}`;document.head.appendChild(st);})();

/* ---------- 5. poder: 40% equipamentos / 60% Prismais ---------- */
primPower=(function(o){return function(p){const v=o.apply(this,arguments);try{return Math.round(v*(1.6+0.102*(p.lvl||1)));}catch(e){return v;}};})(primPower);

/* ---------- 6. Maestria: pontos de talento depois do máximo ---------- */
const MAST81=[['tAtk','Maestria da Fúria','+1% ATQ do time',.01],['tHp','Maestria do Vigor','+1% HP do time',.01],['tDef','Maestria da Muralha','+1% DEF do time',.01],['tGold','Maestria do Bolso','+2% ouro',.02],['tXp','Maestria do Estudo','+2% XP',.02],['tDrop','Maestria do Faro','+1% chance de drop',.01]];
function mastSpent(){return Object.values(S.mast||{}).reduce((a,b)=>a+b,0);}
function talMaxed(){return Object.values(TAL).every(b=>b.t.every(t=>(S.tal[t[0]]||0)>=5));}
talSpent=(function(o){return function(){return o()+mastSpent();};})(talSpent);
tv=(function(o){return function(k){let v=o(k);try{const m=MAST81.find(x=>x[0]===k);if(m&&S.mast&&S.mast[k])v+=S.mast[k]*m[3];}catch(e){}return v;};})(tv);
talentsHTML=(function(o){return function(){S.mast=S.mast||{};const h=o();const left=talPts()-talSpent(),ok=talMaxed();
  return h+`<section class="card mast81"><div class="row between"><h3 style="margin:0">Maestria</h3><span class="chip num">${left} ponto${left===1?'':'s'}</span></div>
  <p class="small muted" style="margin:4px 0 8px">${ok?'Todos os talentos estão no máximo. Cada ponto extra vira Maestria, sem limite.':'Libera quando todos os talentos chegarem a 5/5.'}</p>
  <div class="m81g">${MAST81.map(m=>`<button class="tnode m81" data-m81="${m[0]}" ${ok&&left>0?'':'disabled'}><b>${m[1]}</b><span>${m[2]} por ponto</span><i class="num">Nv ${S.mast[m[0]]||0}</i></button>`).join('')}</div></section>`;};})(talentsHTML);
document.addEventListener('click',e=>{const b=e.target.closest('[data-m81]');if(!b||b.disabled)return;S.mast=S.mast||{};if(talPts()-talSpent()<=0||!talMaxed())return;const k=b.dataset.m81;S.mast[k]=(S.mast[k]||0)+1;save();try{refreshMaster();}catch(e){}refreshTab();},true);
bindTalents=(function(o){return function(){o();const r=$('#talReset');if(r){const f=r.onclick;r.onclick=function(){S.mast={};return f&&f.apply(this,arguments);};}};})(bindTalents);

/* ---------- 7. Evoluir todos com prévia (igual Fundir todos) + bolinha de Melhorar ---------- */
function imp81(){try{return (S.prim||[]).filter(p=>{const c=canEvolve(p);if(c&&c.ok)return true;const d=S.prim.some(q=>q.id!==p.id&&q.sp===p.sp&&!S.team.includes(q.id));return d&&((p.res||1)<5||starOf(p)<5)&&S.team.includes(p.id);});}catch(e){return [];}}
evolveAll75=function(){const l=evo75List();if(!l.length){toast('Nenhum Prismal pronto para evoluir.');return;}
  let g=0,es={},cr={};l.forEach(p=>{const c=canEvolve(p);g+=c.g;const el=SP[p.sp].el;es[el]=(es[el]||0)+10;cr[c.t]=(cr[c.t]||0)+1;});
  const card=(sp,lv)=>`<div class="fcard"><span class="fart">${art(sp)}</span><b>${SP[sp].n}</b><small>Nv ${lv}</small></div>`;
  showModal(`<div class="row between"><h3 style="margin:0">Evoluir todos</h3><button class="btn sm" data-close>Fechar</button></div>
   <p class="small muted" style="margin:4px 0 8px">${l.length} Prismal(is) pronto(s). O nível é mantido e os atributos sobem 25%.</p>
   <div class="fsec">Antes · ${l.length}</div><div class="fgrid">${l.map(p=>card(p.sp,p.lvl)).join('')}</div>
   <div class="fsec">Depois · ${l.length}</div><div class="fgrid got">${l.map(p=>card(SP[p.sp].evo,p.lvl)).join('')}</div>
   <p class="small" style="margin:8px 0">Custo: ${RI('gold')} ${fmt(g)} ouro · ${Object.entries(es).map(([e,n])=>n+' Ess. '+EL[e].n).join(' · ')} · ${Object.entries(cr).map(([t,n])=>n+' Cristal de Elo '+['','I','II','III'][t]).join(' · ')}</p>
   <div class="row" style="gap:8px"><button class="btn" id="evNo" style="flex:1">Recusar</button><button class="btn gold" id="evYes" style="flex:1">Aceitar</button></div>`,{cls:'mfuse',fresh:true});
  $('#evNo').onclick=closeModal;$('#evYes').onclick=()=>{closeModal();const done=[];let k=0;while(k++<60){const p=evo75List()[0];if(!p)break;const from=SP[p.sp].n;evolve(p);closeModal();done.push(from+' → '+SP[p.sp].n);}save();refreshAll();toast(done.length+' Prismal(is) evoluído(s)!');};};

/* ---------- 8. Mercado de Prismais (moradores da vila compram e vendem) ---------- */
const MK81_BASE={1:300,2:900,3:2800,4:9000,5:28000};
function mkVal(sp,lvl){const r=SP[sp].r;return Math.round(MK81_BASE[r]*(1+lvl/18));}
function mk81(){S.mk=S.mk||{offers:[],t:0,ads:[]};const M=S.mk;const now=Date.now();
  if(!M.offers.length||now-M.t>4*3600e3){M.t=now;M.offers=[];const pool=COLLECT.filter(id=>SP[id]&&!SP[id].fusion&&!SP[id].boss&&SP[id].stage!==2);
    for(let i=0;i<6;i++){const sp=pick(pool.filter(id=>rnd()<[0,1,.7,.35,.12,.04][SP[id].r]))||pick(pool);const lvl=Math.max(1,S.lvl-ri(0,8));const pot=ri(35,95);const cur=SP[sp].r>=4&&rnd()<.5?'cris':'gold';
      const price=cur==='cris'?Math.max(20,Math.round(mkVal(sp,lvl)/220)):Math.round(mkVal(sp,lvl)*(.9+rnd()*.4));M.offers.push({id:now+'_'+i,sp,lvl,pot,cur,price});}}
  M.ads.forEach(a=>{if(!a.done&&now>=a.end){a.done=true;if(rnd()<a.ok){S.gold+=a.price;a.sold=true;toast(`Mercado: ${SP[a.p.sp].n} vendido por ${fmt(a.price)} ouro!`);}else{S.prim.push(a.p);a.sold=false;toast(`Mercado: ninguém comprou ${SP[a.p.sp].n}. Ele voltou para você.`);}}});
  M.ads=M.ads.filter(a=>!a.done||now-a.end<6*3600e3);return M;}
let mkTab='buy';
function openMarket(t){if(t)mkTab=t;const M=mk81();save();const now=Date.now();
  const T=[['buy','Comprar'],['sell','Anunciar'],['ads','Meus anúncios']];let body='';
  const pc=(sp,lv,extra)=>`<div class="mk81c"><span class="fart">${art(sp)}</span><div class="mk81t"><b>${SP[sp].n}</b><span class="small muted">${RAR[SP[sp].r].n} · ${EL[SP[sp].el].n} · Nv ${lv}</span>${extra||''}</div></div>`;
  if(mkTab==='buy')body=`<p class="small muted">Moradores da vila vendem Prismais. As ofertas mudam a cada 4h (próximas em ${Math.max(1,Math.ceil((M.t+4*3600e3-now)/60000))} min).</p><div class="mk81l">${M.offers.map(o=>`<div class="mk81r">${pc(o.sp,o.lvl,`<span class="small">Potencial ${o.pot}/100</span>`)}<button class="btn sm gold" data-mkb="${o.id}" ${(o.cur==='cris'?S.cris>=o.price:S.gold>=o.price)?'':'disabled'}>${o.cur==='cris'?o.price+' Cristais':fmt(o.price)+' ouro'}</button></div>`).join('')||'<p class="small">Sem ofertas agora.</p>'}</div>`;
  else if(mkTab==='sell'){const l=S.prim.filter(p=>!S.team.includes(p.id)&&!(typeof onExp==='function'&&onExp(p.id))).sort((a,b)=>SP[b.sp].r-SP[a.sp].r||b.lvl-a.lvl);const act=M.ads.filter(a=>!a.done).length;
    body=`<p class="small muted">Escolha um Prismal fora do time e o preço. Preço baixo vende rápido e sempre; preço alto demora e pode não vender (aí ele volta para você). Até 3 anúncios ao mesmo tempo (${act}/3).</p><div class="mk81l">${l.map(p=>{const v=mkVal(p.sp,p.lvl);return `<div class="mk81r col">${pc(p.sp,p.lvl)}<div class="row mk81p">${[['b','Rápido',.7,30,1],['j','Justo',1,120,.9],['c','Alto',1.5,360,.6]].map(([k,n,f,min,ok])=>`<button class="btn sm" data-mks="${p.id}:${k}" ${act>=3?'disabled':''}>${n}<small>${fmt(Math.round(v*f))} · ${min<60?min+' min':(min/60)+' h'}</small></button>`).join('')}</div></div>`;}).join('')||'<p class="small">Nenhum Prismal fora do time.</p>'}</div>`;}
  else body=`<div class="mk81l">${M.ads.slice().reverse().map(a=>`<div class="mk81r">${pc(a.p.sp,a.p.lvl,`<span class="small">${fmt(a.price)} ouro · ${a.done?(a.sold?'<b style="color:#2f8a3a">Vendido</b>':'Não vendeu (voltou)'):'termina em '+Math.max(1,Math.ceil((a.end-now)/60000))+' min'}</span>`)}${a.done?'':`<button class="btn sm" data-mkc="${a.id}">Cancelar</button>`}</div>`).join('')||'<p class="small">Nenhum anúncio ainda.</p>'}</div>`;
  showModal(`<div class="row between"><h3 style="margin:0">Mercado de Prismais</h3><button class="btn sm" data-close>Fechar</button></div><div class="filters mk81tabs">${T.map(([k,n])=>`<button data-mkt="${k}" aria-pressed="${k===mkTab}">${n}</button>`).join('')}</div>${body}`,{fresh:true});
  document.querySelectorAll('[data-mkt]').forEach(b=>b.onclick=()=>openMarket(b.dataset.mkt));
  document.querySelectorAll('[data-mkb]').forEach(b=>b.onclick=()=>{const o=M.offers.find(x=>x.id===b.dataset.mkb);if(!o)return;if(o.cur==='cris'){if(S.cris<o.price)return;S.cris-=o.price;}else{if(S.gold<o.price)return;S.gold-=o.price;}
    addPrimal(o.sp,o.lvl,o.pot);M.offers=M.offers.filter(x=>x!==o);save();updateTop();toast(`${SP[o.sp].n} comprado!`);openMarket();});
  document.querySelectorAll('[data-mks]').forEach(b=>b.onclick=()=>{const [id,k]=b.dataset.mks.split(':');const p=S.prim.find(x=>x.id===+id);if(!p||M.ads.filter(a=>!a.done).length>=3)return;const v=mkVal(p.sp,p.lvl);const cfg={b:[.7,30,1],j:[1,120,.9],c:[1.5,360,.6]}[k];
    S.prim=S.prim.filter(x=>x!==p);M.ads.push({id:Date.now()+'',p,price:Math.round(v*cfg[0]),end:Date.now()+cfg[1]*60000,ok:cfg[2]});save();toast(`${SP[p.sp].n} anunciado!`);openMarket('ads');});
  document.querySelectorAll('[data-mkc]').forEach(b=>b.onclick=()=>{const a=M.ads.find(x=>x.id===b.dataset.mkc);if(!a||a.done)return;S.prim.push(a.p);M.ads=M.ads.filter(x=>x!==a);save();toast('Anúncio cancelado.');openMarket('ads');});}
setInterval(()=>{try{if(S&&S.mk)mk81();}catch(e){}},30000);
setInterval(()=>{try{const cs=document.querySelector('.cityscene');if(cs&&!cs.querySelector('[data-bld="mercado81"]')){const b=document.createElement('button');b.className='cb';b.dataset.bld='mercado81';b.style.left='30%';b.style.top='83%';b.innerHTML='<span class="cblab">Mercado</span>';b.onclick=()=>openMarket();cs.appendChild(b);}}catch(e){}},800);

/* ---------- 9. velocidades 1 a 4 (o 4 é o antigo 2) ---------- */
const SPD81={1:1,2:1.17,3:1.33,4:1.5};
function spdLbl81(){const v='x'+(S.spd4||1);const a=document.getElementById('t69spdv');if(a&&a.textContent!==v)a.textContent=v;const b=document.getElementById('spdTxt');if(b&&b.textContent!==(S.spd4||1)+'×')b.textContent=(S.spd4||1)+'×';}
setInterval(()=>{try{if(!S)return;if(!S.spd4)S.spd4=S.speed>=2?2:1;S.speed=S.spd4>1?2:1;if(typeof B!=='undefined'&&B&&!B.paused&&!B.over&&S.spd4>1){B.acc=(B.acc||0)-(1.5-SPD81[S.spd4]);}
  const sb=document.getElementById('spdBtn');if(sb&&!sb.dataset.s81){sb.dataset.s81=1;sb.onclick=()=>{S.spd4=(S.spd4||1)%4+1;S.speed=S.spd4>1?2:1;spdLbl81();save();toast('Velocidade x'+S.spd4);};}spdLbl81();}catch(e){}},100);

/* ---------- estilos ---------- */
(function(){const st=document.createElement('style');st.id='v81css';st.textContent=`
.d81{position:absolute!important;top:3px;right:4px;width:11px;height:11px;border-radius:50%;background:#e0352b;border:1.5px solid #fff6e2;z-index:5;pointer-events:none}
nav.tabs [data-tab] .d81{top:6px;right:10px;width:13px;height:13px}
.gslot[data-gs]{position:relative}
html body .invc:has(.upar)::after,html body .gitem:has(.upar) .gslot::after{content:"";position:absolute;top:3px;right:3px;width:11px;height:11px;border-radius:50%;background:#e0352b;border:1.5px solid #fff6e2;z-index:4}
html body .invc,html body .gitem .gslot{position:relative}
.i81help{display:flex;flex-direction:column;gap:2px;background:#fff6e2;border:1.5px dashed #c99a5e;border-radius:12px;padding:8px 10px;margin:6px 0 8px;color:#4a2a12;font-size:12.5px;line-height:1.35}.i81help>b{font-family:"Lilita One",system-ui,sans-serif;font-weight:400;font-size:14px}
.up81{color:#2f8a3a;font-style:normal;font-weight:900}
.cmp81{display:block;font-size:12px;font-weight:800;margin-top:2px;color:#7a5230}.cmp81.pos{color:#2f8a3a}.cmp81.neg{color:#b5432f}
html body.ui70 .modal .gitem{flex-wrap:wrap!important}
html body.ui70 .modal .gitem .gact{display:flex!important;flex-direction:column!important;gap:5px!important;min-width:104px}
html body.ui70 .modal .gitem.on81{border-color:#2f8a3a!important;box-shadow:0 0 0 2px rgba(47,138,58,.25)!important}
.more81{display:none;width:100%;gap:6px;flex-wrap:wrap;padding-top:6px;margin-top:6px;border-top:1px dashed #d9b98a}
.gitem.open81 .more81{display:flex}
.more81 .btn{flex:1 1 45%}
.tg81{font-size:12px!important}
html body .tnode b{color:#4a2a12!important;-webkit-text-fill-color:#4a2a12!important;text-shadow:none!important}
.mast81 .m81g{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
.mk81tabs{display:flex;gap:6px;margin:6px 0 8px}
.mk81l{display:flex;flex-direction:column;gap:8px;max-height:58vh;overflow:auto}
.mk81r{display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(180deg,#fffaf0,#f3e3c3);border:1.5px solid #d9b98a;border-radius:14px;padding:8px}
.mk81r.col{flex-direction:column;align-items:stretch}
.mk81c{display:flex;align-items:center;gap:8px;min-width:0}.mk81c .fart{width:52px;height:52px;flex:0 0 52px;display:flex;align-items:center;justify-content:center}.mk81c .fart .art{max-width:52px;max-height:52px}
.mk81t{display:flex;flex-direction:column;min-width:0}.mk81t b{color:#4a2a12}
.mk81p{gap:6px}.mk81p .btn{flex:1;display:flex;flex-direction:column;line-height:1.15}.mk81p small{font-size:10.5px;opacity:.85}`;document.head.appendChild(st);})();
