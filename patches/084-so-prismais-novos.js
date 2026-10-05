/* ================== v84: tira os Prismais antigos da natureza, do Bestiário e das lojas (só os novos animados aparecem) ================== */
(function(){try{const NEW=new Set(Object.keys(CR82F));
  Object.keys(SP).forEach(k=>{const s=SP[k];if(!NEW.has(k)&&!s.boss)s.retired=true;});
  for(let i=COLLECT.length-1;i>=0;i--)if(!NEW.has(COLLECT[i]))COLLECT.splice(i,1);
  const P={
   vale:[['mangustim',25,1],['fogarilho',18,1],['tamanduco',16,1],['flamaflor',16,2],['joanela',12,3],['brotim',12,4]],
   charco:[['garcaferro',22,1],['baleiuda',18,1],['tamanduco',18,1],['mangustim',14,1],['pandurao',10,2],['lontrovao',3,3]],
   picos:[['fogarilho',24,1],['palmudo',14,1],['flamaflor',14,1],['garcaferro',12,1],['cristalossauro',3,3],['fenixim',3,3]],
   costa:[['baleiuda',22,1],['palmudo',20,1],['garcaferro',14,1],['joanela',12,2],['lontrovao',3,3],['raposelo',3,4]],
   bosque:[['cangurrama',20,1],['pandurao',20,1],['tamanduco',16,1],['mangustim',14,1],['rochassauro',3,3],['mascarim',1.2,5]],
   deserto:[['jacarrocha',22,1],['fogarilho',18,1],['palmudo',14,1],['louvabrasa',3,3],['touraurum',1.2,5]],
   pantano:[['tamanduco',22,1],['garcaferro',16,1],['cangurrama',14,1],['chifrossos',3,3],['vespurpura',3,3]],
   cume:[['baleiuda',18,1],['garcaferro',16,1],['flamaflor',12,1],['javaraio',3,1],['geleporo',3,1],['raposelo',3,2]],
   recife:[['baleiuda',20,1],['palmudo',16,1],['jacarrocha',14,1],['lontrovao',4,1],['raposelo',4,2],['geleporo',4,2]],
   coracao:[['brotim',16,1],['joanela',16,1],['fenixim',4,1],['cristalossauro',4,1],['mascarim',1.5,3],['touraurum',1.5,3]],
   abismo:[['pandurao',18,1],['cangurrama',16,1],['louvabrasa',5,1],['chifrossos',5,1],['vespurpura',5,2],['mascarim',2,3]],
   estelar:[['flamaflor',16,1],['brotim',16,1],['javaraio',5,1],['fenixim',5,1],['geleporo',5,2],['touraurum',2,3],['mascarim',2,3]]};
  const MIN={vale:'mangustim',charco:'garcaferro',picos:'fogarilho',costa:'baleiuda',bosque:'pandurao',deserto:'jacarrocha',pantano:'tamanduco',cume:'garcaferro',recife:'baleiuda',coracao:'brotim',abismo:'pandurao',estelar:'flamaflor'};
  Object.keys(REG).forEach(k=>{const R=REG[k];if(P[k])R.pool=P[k].filter(x=>SP[x[0]]);else if(R.pool)R.pool=R.pool.filter(x=>NEW.has(x[0]));if(!R.pool||!R.pool.length)R.pool=P.vale;if(MIN[k])R.minion=MIN[k];});
  if(S&&S.mk&&S.mk.offers)S.mk.offers=S.mk.offers.filter(o=>NEW.has(o.sp));
}catch(e){console.warn('v84',e);}})();
