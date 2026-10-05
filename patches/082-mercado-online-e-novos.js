/* ================== v82: 6 Prismais animados (Baleiúda, Chifrossos, Geleporo, Joanela, Fogarilho, Rochassauro) + mercado online entre jogadores ================== */
/* ---------- 1. Prismais novos com animação quadro a quadro ---------- */
const CR82=[
 ['baleiuda','Baleiúda','mare','guardiao',2,[48,22,34,18],'costa','Jato de Espuma','Filhote de baleia que vive nas poças da Costa de Vidro. Espirra água quando está contente.','waterblubby'],
 ['chifrossos','Chifrossos','eter','sabotador',3,[36,46,24,40],'pantano','Garra Sepulcral','Esqueleto chifrudo que vaga no Pântano Lunar. Ri alto antes de atacar.','undeadskeleton'],
 ['geleporo','Geleporo','mare','fera',3,[34,46,22,44],'cume','Garra de Gelo','Lebre de cristal de gelo. Bravo por fora, sorri quando vence uma luta.','icerabbit'],
 ['joanela','Joanela','seiva','arauto',2,[38,24,26,32],'vale','Pólen Curativo','Potrinha com casco de joaninha. Bate as asinhas e espalha pólen que cura os amigos.','horseladybug'],
 ['fogarilho','Fogarilho','brasa','fera',1,[30,30,18,30],'picos','Bochecha Ardente','Hamster de fogo que guarda brasas nas bochechas. Esquenta quando fica animado.','firehamster'],
 ['rochassauro','Rochassauro','rocha','guardiao',3,[60,30,48,14],'bosque','Casco de Pedra','Dinossauro de pedra com folhas nas costas. Dorme tão parado que vira parte da trilha.','earthdino'],
 ['lontrovao','Lontrovão','tormenta','fera',3,[34,48,22,46],'charco','Garra Elétrica','Lontra azul com um raio no peito. Quando se irrita, as garras soltam faíscas.','lontrovao'],
 ['jacarrocha','Jacarrocha','rocha','fera',2,[40,40,30,22],'deserto','Mordida de Pedra','Jacarezinho de casca espinhosa que vive nas dunas. Ri com a boca toda aberta antes de morder.','jacarrocha'],
 ['brotim','Brotim','seiva','arauto',2,[40,22,26,30],'vale','Estrela Curativa','Bolinho alado com um broto na cabeça. A estrelinha da antena brilha quando ele cura os amigos.','brotim'],
 ['raposelo','Raposelo','mare','fera',3,[34,48,24,42],'cume','Soco Gélido','Raposinha de folhas de gelo. Parece fofa, mas fecha a cara e solta socos congelantes quando o time precisa.','raposelo']];
(function(){try{const W={1:9,2:6,3:3,4:1.2};CR82.forEach(([id,n,el,role,r,st,reg,sk,desc,f])=>{if(!SP[id])def(id,{n,el,role,r,st,reg,sk,desc});if(COLLECT.indexOf(id)<0)COLLECT.push(id);
  const R=REG[reg];if(R&&R.pool&&!R.pool.some(x=>x[0]===id))R.pool.push([id,W[r]||3,r>=3?3:1]);
  IMG[id]='cr82/'+f+'_icon.webp';IMGS.add(id);SHEET[id]='cr82/'+f+'_base.webp';});}catch(e){console.warn('v82 def',e);}})();
const CR82H=new Set(['lontrovao','jacarrocha','brotim','raposelo']);const CR82F={};CR82.forEach(c=>CR82F[c[0]]=c[9]);
(function(){const st=document.createElement('style');st.textContent=`
.unit:not(.dead) .sheet.cr82:not(.pose),.walker .sheet.cr82,.hstage .sheet.cr82{background-image:var(--i)!important;background-size:1500% 100%!important;animation:cr82 1.7s steps(15,jump-none) infinite!important}
.unit .sheet.cr82.h82{background-image:var(--h)!important;background-size:1500% 100%!important;animation:cr82 .55s steps(15,jump-none) 1 forwards!important}
.unit .sheet.cr82.a82{background-image:var(--k)!important;background-size:1500% 100%!important;animation:cr82 .75s steps(15,jump-none) 1 forwards!important}
@keyframes cr82{from{background-position:0% 0}to{background-position:100% 0}}`;document.head.appendChild(st);
  /* pré-carrega as tiras para não piscar */
  CR82.forEach(c=>['idle','atk'].forEach(k=>{const i=new Image();i.src='cr82/'+c[9]+'_'+k+'.webp';}));})();
sheetArt=(function(o){return function(id,g){let h=o.apply(this,arguments);const f=CR82F[id];if(f&&h.indexOf('art sheet')>=0)h=h.replace('class="art sheet','class="art sheet cr82').replace('style="',`style="--i:url(cr82/${f}_idle.webp);--k:url(cr82/${f}_atk.webp);${CR82H.has(f)?`--h:url(cr82/${f}_hit.webp);`:''}`);return h;};})(sheetArt);
pose=(function(o){return function(u,frame,ms){o.apply(this,arguments);try{const el=uel(u);const sh=el&&el.querySelector('.sheet.cr82');if(!sh)return;
  if(frame===2){sh.classList.remove('a82');void sh.offsetWidth;sh.classList.add('a82');clearTimeout(sh._a);sh._a=setTimeout(()=>sh.classList.remove('a82'),650);}
  else if(frame===4&&CR82H.has(CR82F[u.sp])){sh.classList.remove('a82','h82');void sh.offsetWidth;sh.classList.add('h82');clearTimeout(sh._h);sh._h=setTimeout(()=>sh.classList.remove('h82'),600);}
  else if(frame!==3)sh.classList.remove('a82');}catch(e){}};})(pose);

/* ---------- 2. Mercado online: anúncios guardados no servidor ---------- */
const MK82={rows:null,mine:null,err:null,busy:false,lastClaim:0,f:0};
let mkTab82='play';
function mkSlot82(){return CUR.sid+'_'+CUR.slot;}
function mkErr82(e){const m=String(e&&(e.message||e.details)||e||'');if(/indisponivel/.test(m))return 'Esse anúncio já foi vendido ou cancelado.';if(/limite_anuncios/.test(m))return 'Você já tem 5 anúncios abertos.';if(/preco/.test(m))return 'Preço inválido.';if(/sem_login|JWT|auth/i.test(m))return 'Entre na sua conta para usar o mercado.';return 'Sem conexão com o mercado agora. Tente de novo.';}
async function mkLoad82(){const c=await sbReady();const uid=CLOUD.uid;
  let q=c.from('market').select('id,nick,sp,lvl,pot,r,price,created_at,seller').eq('srv',CUR.sid).eq('status','open').order('created_at',{ascending:false}).limit(60);
  if(MK82.f)q=q.eq('r',MK82.f);
  const [a,b]=await Promise.all([q,c.from('market').select('id,slot,sp,lvl,pot,price,status,buyer_nick,created_at,sold_at,claimed').eq('srv',CUR.sid).eq('slot',mkSlot82()).order('created_at',{ascending:false}).limit(30)]);
  if(a.error)throw a.error;if(b.error)throw b.error;
  const me=(await c.auth.getUser()).data.user;const myId=me&&me.id;
  MK82.rows=(a.data||[]).filter(r=>r.seller!==myId);MK82.mine=b.data||[];MK82.err=null;}
async function mkClaim82(silent){if(!online()||!S||!CUR.sid)return;try{const c=await sbReady();const {data,error}=await c.rpc('market_claim',{p_srv:CUR.sid,p_slot:mkSlot82()});if(error)throw error;
  let tot=0;(data||[]).forEach(v=>{const net=Math.floor(v.price*.95);tot+=net;});
  if(tot>0){S.gold+=tot;save();if(typeof cloudSave==='function')cloudSave(true);updateTop();toast(`Mercado: ${data.length>1?data.length+' Prismais vendidos':SP[data[0].sp]?SP[data[0].sp].n+' vendido':'venda concluída'}! +${fmt(tot)} ouro`);}}catch(e){if(!silent)toast(mkErr82(e));}}
setInterval(()=>{try{if(S&&CUR.sid&&online()&&Date.now()-MK82.lastClaim>60000){MK82.lastClaim=Date.now();mkClaim82(true);}}catch(e){}},5000);
function mkCard82(sp,lv,extra){const s=SP[sp];if(!s)return `<div class="mk81c"><div class="mk81t"><b>Prismal desconhecido</b></div></div>`;return `<div class="mk81c"><span class="fart">${art(sp)}</span><div class="mk81t"><b>${s.n}</b><span class="small muted">${RAR[s.r].n} · ${EL[s.el].n} · Nv ${lv}</span>${extra||''}</div></div>`;}
function mkSellable82(){return S.prim.filter(p=>!S.team.includes(p.id)&&!(typeof onExp==='function'&&onExp(p.id))&&SP[p.sp]).sort((a,b)=>SP[b.sp].r-SP[a.sp].r||b.lvl-a.lvl);}
openMarket=function(t){if(t)mkTab82=t;if(!S)return;
  const T=[['play','Jogadores'],['buy','Vila'],['sell','Anunciar'],['ads','Meus anúncios']];let body='';const on=online();
  const off=`<p class="small">O mercado entre jogadores precisa de internet e da sua conta. ${MK82.err?esc(MK82.err):''}</p>`;
  if(mkTab82==='play'){
    const fl=`<div class="filters mk82f">${[[0,'Todas'],[1,'Comum'],[2,'Incomum'],[3,'Rara'],[4,'Épica'],[5,'Lendária']].map(([r,n])=>`<button data-mkf="${r}" aria-pressed="${MK82.f===r}">${n}</button>`).join('')}</div>`;
    if(!on)body=off;else if(MK82.rows===null)body=fl+'<p class="small muted">Carregando anúncios…</p>';
    else body=fl+`<p class="small muted">Prismais anunciados por outros jogadores deste servidor. Quem compra paga o preço; o vendedor recebe 95% (5% de taxa).</p><div class="mk81l">${MK82.rows.map(o=>`<div class="mk81r">${mkCard82(o.sp,o.lvl,`<span class="small">Pot ${o.pot}/100 · por ${esc(o.nick||'Master')}</span>`)}<button class="btn sm gold" data-mk2b="${o.id}" ${S.gold>=o.price?'':'disabled'}>${fmt(o.price)} ouro</button></div>`).join('')||'<p class="small">Nenhum anúncio agora. Seja o primeiro a anunciar!</p>'}</div>`;}
  else if(mkTab82==='buy'){const M=mk81();body=`<p class="small muted">Moradores da vila vendem Prismais. As ofertas mudam a cada 4h.</p><div class="mk81l">${M.offers.map(o=>`<div class="mk81r">${mkCard82(o.sp,o.lvl,`<span class="small">Potencial ${o.pot}/100</span>`)}<button class="btn sm gold" data-mkb="${o.id}" ${(o.cur==='cris'?S.cris>=o.price:S.gold>=o.price)?'':'disabled'}>${o.cur==='cris'?o.price+' Cristais':fmt(o.price)+' ouro'}</button></div>`).join('')||'<p class="small">Sem ofertas agora.</p>'}</div>`;}
  else if(mkTab82==='sell'){if(!on)body=off;else{const l=mkSellable82();const open=(MK82.mine||[]).filter(a=>a.status==='open').length;
    body=`<p class="small muted">Escolha um Prismal fora do time e o preço. Ele sai do seu estábulo e fica à venda para todos do servidor. Se ninguém comprar, você pode cancelar e ele volta. Máx. 5 anúncios (${open}/5).</p><div class="mk81l">${l.map(p=>{const v=mkVal(p.sp,p.lvl);return `<div class="mk81r col">${mkCard82(p.sp,p.lvl,`<span class="small">Pot ${p.pot}/100 · sugerido ${fmt(v)}</span>`)}<div class="row mk82p"><input type="number" inputmode="numeric" min="${Math.ceil(v*.3)}" max="${v*3}" value="${v}" id="mkp${p.id}"><button class="btn sm gold" data-mk2s="${p.id}" ${open>=5?'disabled':''}>Anunciar</button></div></div>`;}).join('')||'<p class="small">Nenhum Prismal fora do time.</p>'}</div>`;}}
  else{if(!on)body=off;else if(MK82.mine===null)body='<p class="small muted">Carregando…</p>';else{const st=a=>a.status==='open'?'À venda':a.status==='sold'?`<b style="color:#2f8a3a">Vendido${a.buyer_nick?' para '+esc(a.buyer_nick):''}</b>${a.claimed?'':' · ouro chegando'}`:'Cancelado';
    body=`<div class="mk81l">${MK82.mine.map(a=>`<div class="mk81r">${mkCard82(a.sp,a.lvl,`<span class="small">${fmt(a.price)} ouro · ${st(a)}</span>`)}${a.status==='open'?`<button class="btn sm" data-mk2c="${a.id}">Cancelar</button>`:''}</div>`).join('')||'<p class="small">Nenhum anúncio ainda.</p>'}</div>`;}}
  const sc=document.querySelector('.modal.mk82')?document.querySelector('.modal.mk82 .mk81l'):null;const top=sc?sc.scrollTop:0;
  showModal(`<div class="row between"><h3 style="margin:0">Mercado de Prismais</h3><button class="btn sm" data-close>Fechar</button></div><div class="filters mk81tabs">${T.map(([k,n])=>`<button data-mkt="${k}" aria-pressed="${k===mkTab82}">${n}</button>`).join('')}</div>${body}`,{fresh:true,cls:'mk82'});
  const sc2=document.querySelector('.modal.mk82 .mk81l');if(sc2&&top)sc2.scrollTop=top;
  document.querySelectorAll('[data-mkt]').forEach(b=>b.onclick=()=>{mkTab82=b.dataset.mkt;openMarket();if(mkTab82!=='buy')mkRefresh82();});
  document.querySelectorAll('[data-mkf]').forEach(b=>b.onclick=()=>{MK82.f=+b.dataset.mkf;MK82.rows=null;openMarket();mkRefresh82();});
  document.querySelectorAll('[data-mkb]').forEach(b=>b.onclick=()=>{const M=mk81();const o=M.offers.find(x=>x.id===b.dataset.mkb);if(!o)return;if(o.cur==='cris'){if(S.cris<o.price)return;S.cris-=o.price;}else{if(S.gold<o.price)return;S.gold-=o.price;}
    addPrimal(o.sp,o.lvl,o.pot);M.offers=M.offers.filter(x=>x!==o);save();updateTop();toast(`${SP[o.sp].n} comprado!`);openMarket();});
  document.querySelectorAll('[data-mk2b]').forEach(b=>b.onclick=async()=>{if(MK82.busy)return;const o=(MK82.rows||[]).find(x=>x.id===b.dataset.mk2b);if(!o)return;
    if(S.gold<o.price){toast('Ouro insuficiente.');return;}if(S.prim.length>=60){toast('Estábulo cheio. Libere espaço antes de comprar.');return;}
    MK82.busy=true;b.disabled=true;try{const c=await sbReady();const {data,error}=await c.rpc('market_buy',{p_id:o.id,p_nick:S.nick||tname()});if(error)throw error;
      const pr=data.prim||{};S.gold-=data.price;const np=addPrimal(pr.sp||data.sp,pr.lvl||1,pr.pot||0,pr.gen||0);if(np){const id=np.id;Object.assign(np,pr,{id});}
      save();if(typeof cloudSave==='function')cloudSave(true);updateTop();toast(`${SP[data.sp]?SP[data.sp].n:'Prismal'} comprado!`);}
    catch(e){toast(mkErr82(e));}finally{MK82.busy=false;}MK82.rows=null;openMarket();mkRefresh82();});
  document.querySelectorAll('[data-mk2s]').forEach(b=>b.onclick=async()=>{if(MK82.busy)return;const p=S.prim.find(x=>x.id===+b.dataset.mk2s);if(!p)return;const v=mkVal(p.sp,p.lvl);
    const inp=document.getElementById('mkp'+p.id);let price=Math.round(+(inp&&inp.value)||0);const lo=Math.ceil(v*.3),hi=v*3;
    if(!(price>=lo&&price<=hi)){toast(`Escolha um preço entre ${fmt(lo)} e ${fmt(hi)}.`);return;}
    MK82.busy=true;b.disabled=true;const copy=JSON.parse(JSON.stringify(p));delete copy.id;
    S.prim=S.prim.filter(x=>x!==p);save();
    try{const c=await sbReady();const {error}=await c.rpc('market_list',{p_srv:CUR.sid,p_slot:mkSlot82(),p_nick:S.nick||tname(),p_sp:p.sp,p_lvl:p.lvl,p_pot:p.pot||0,p_r:SP[p.sp].r,p_prim:copy,p_price:price});if(error)throw error;
      if(typeof cloudSave==='function')cloudSave(true);toast(`${SP[p.sp].n} anunciado por ${fmt(price)} ouro!`);mkTab82='ads';}
    catch(e){S.prim.push(p);save();toast(mkErr82(e));}finally{MK82.busy=false;}MK82.mine=null;openMarket();mkRefresh82();});
  document.querySelectorAll('[data-mk2c]').forEach(b=>b.onclick=async()=>{if(MK82.busy)return;if(S.prim.length>=60){toast('Estábulo cheio. Libere espaço antes de cancelar.');return;}
    MK82.busy=true;b.disabled=true;try{const c=await sbReady();const {data,error}=await c.rpc('market_cancel',{p_id:b.dataset.mk2c});if(error)throw error;
      const pr=data.prim||{};const np=addPrimal(pr.sp,pr.lvl||1,pr.pot||0,pr.gen||0);if(np){const id=np.id;Object.assign(np,pr,{id});}save();if(typeof cloudSave==='function')cloudSave(true);toast('Anúncio cancelado. O Prismal voltou para você.');}
    catch(e){toast(mkErr82(e));}finally{MK82.busy=false;}openMarket();mkRefresh82();});
};
async function mkRefresh82(){if(!online())return;try{await mkLoad82();}catch(e){MK82.err=mkErr82(e);}if(document.querySelector('.modal.mk82'))openMarket();}
(function(){const o=openMarket;openMarket=function(t){const first=!document.querySelector('.modal.mk82');if(first&&!t)mkTab82='play';o(t);if(first){mkRefresh82();mkClaim82(true);}};})();
(function(){const st=document.createElement('style');st.textContent=`.mk82f{flex-wrap:wrap;gap:4px;margin:6px 0}.mk82f button{font-size:11px;padding:4px 8px}
.mk82p{gap:6px;align-items:center;margin-top:6px}.mk82p input{flex:1;min-width:0;padding:8px 10px;border-radius:10px;border:2px solid #b08850;background:#fff8ea;color:#4a2a12;font:inherit;font-weight:700}
.modal.mk82 .mk81tabs{display:flex;flex-wrap:wrap;gap:4px}.modal.mk82 .mk81tabs button{flex:1 1 22%;font-size:12px}`;document.head.appendChild(st);})();
