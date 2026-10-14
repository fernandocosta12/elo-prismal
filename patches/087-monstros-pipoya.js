const A87ATLAS='pipoya_atlas.webp';
/* ================== v87: Monstros Pipoya (Pipoya RPG Monster Pack, uso livre) ==================
   20 inimigos colecionaveis + 4 chefes, distribuidos pelas 4 regioes. Arte: Pipoya. */
const PIP87=[
 ['morcevo','Morcevo','eter','sabotador',1,[28,22,18,34],'vale','Guincho','Morcego curioso que dorme de cabeca pra baixo nas grutas do vale.',0],
 ['lobsombrio','Lobsombrio','rocha','fera',2,[34,34,20,30],'vale','Mordida Feroz','Lobo peludo e arisco que uiva para a lua baixa do vale.',0],
 ['saporvalho','Saporvalho','mare','guardiao',1,[34,20,28,20],'vale','Coaxo','Sapo verdinho de boca enorme que vive nas pocas de orvalho.',0],
 ['besourao','Besourao','mare','guardiao',2,[36,24,32,22],'vale','Casco Azul','Besouro de carapaca brilhante que cava entre as raizes.',0],
 ['larveto','Larveto','seiva','arauto',1,[30,18,22,20],'vale','Broto','Larva amarela com um brotinho na cabeca; sonha em virar flor.',0],
 ['aurevo','Aurevo, Guarda do Vale','eter','guardiao',4,[66,36,50,18],'vale','Asa Radiante','Guardiao alado de cabelos brancos que protege a entrada do vale com uma aura rubra.',1],
 ['troncudo','Troncudo','seiva','guardiao',2,[44,24,38,16],'charco','Raiz Dura','Arvorezinha andante que range os galhos ao caminhar pelo brejo.',0],
 ['denteflor','Denteflor','seiva','fera',2,[34,34,20,28],'charco','Bocada','Planta carnivora de juba amarela e dentes afiados.',0],
 ['chapelim','Chapelim','seiva','guardiao',1,[36,18,30,16],'charco','Esporo Sonolento','Cogumelo verde de cara sonolenta que solta pos no ar.',0],
 ['gosmazul','Gosmazul','mare','mistico',1,[32,22,22,24],'charco','Pingo','Gosma azul tranquila que escorrega pelos juncos do charco.',0],
 ['fantasmim','Fantasmim','eter','mistico',3,[34,38,22,36],'charco','Assombracao','Fantasminha branco que brinca de assustar quem passa a noite.',0],
 ['vortigo','Vortigo, Senhor do Charco','eter','mistico',4,[70,42,34,30],'charco','Sucçao','Vortice sombrio que suga a bruma parada no fundo do brejo.',1],
 ['ogrilho','Ogrilho','rocha','fera',2,[40,32,28,22],'picos','Pancada','Ogro verde e rabugento que arremessa pedras dos penhascos.',0],
 ['brasavol','Brasavol','brasa','mistico',3,[34,42,22,36],'picos','Giro de Fogo','Chama viva que roda feito um pequeno sol sobre as cinzas.',0],
 ['diabrim','Diabrim','brasa','sabotador',2,[32,34,22,32],'picos','Travessura','Diabinho de chapeu pontudo que prega pecas com faiscas.',0],
 ['lobisco','Lobisco','rocha','fera',2,[34,34,24,30],'picos','Arranhao','Lobo cinzento de nariz vermelho que ronda as trilhas altas.',0],
 ['toralho','Toralho','seiva','guardiao',2,[44,26,40,16],'picos','Tronco','Bichinho de casco que carrega um toro de madeira nas costas.',0],
 ['abismuro','Abismuro, Furia dos Picos','eter','mistico',4,[74,48,38,26],'picos','Espiral Abissal','Nucleo escuro que gira como um vortice violeta sobre as montanhas.',1],
 ['cavalmar','Cavalmar','mare','mistico',2,[34,34,24,32],'costa','Jato Dagua','Cavalo-marinho esverdeado que dança nas correntes da costa.',0],
 ['assombro','Assombro','eter','sabotador',3,[34,44,22,40],'costa','Arrepio','Espirito cinzento e veloz que ronda as falesias de vidro.',0],
 ['guardilho','Guardilho','rocha','guardiao',3,[46,34,42,20],'costa','Escudo','Cavaleirinho de armadura e escudo que patrulha a praia.',0],
 ['diabrao','Diabrao','brasa','fera',3,[38,44,26,34],'costa','Tridentada','Diabo vermelho de garfo em brasa, briguento como ninguem.',0],
 ['ciclopo','Ciclopo','mare','guardiao',2,[42,30,34,22],'costa','Olhar Fixo','Ciclope azul de tridente que vigia os recifes de vidro.',0],
 ['dragovo','Dragovo, Oraculo da Costa','eter','mistico',4,[70,46,36,34],'costa','Sopro Prismatico','Dragao alado de escamas violetas que enxerga as mares do destino.',1]];
const PIP87W={1:9,2:6,3:3,4:1.5};
(function(){try{PIP87.forEach(([id,n,el,role,r,st,reg,sk,desc,bo])=>{
  if(SP[id])return;
  const o={n,el,role,r,st,reg,sk,desc:desc+' (Arte: Pipoya)'};
  if(bo)o.boss=true;
  def(id,o);
  if(typeof COLLECT!=='undefined'&&COLLECT.indexOf(id)<0)COLLECT.push(id);
  const R=REG[reg];
  if(R&&R.pool&&!R.pool.some(x=>x[0]===id)){R.pool.push([id, bo?1:(PIP87W[r]||3), r>=3?3:1]);}
});}catch(e){console.warn('v87',e);}})();
/* recorta o atlas (6 colunas, celulas de 200px) em imagens individuais */
(function(){const src=(typeof A87ATLAS!=='undefined')?A87ATLAS:(A63+'pipoya_atlas.webp');const im=new Image();im.onload=()=>{try{const C=200;PIP87.forEach(([id],i)=>{const c=document.createElement('canvas');c.width=C;c.height=C;c.getContext('2d').drawImage(im,(i%6)*C,Math.floor(i/6)*C,C,C,0,0,C,C);IMG[id]=c.toDataURL('image/png');IMGS.add(id);});if(typeof refreshTab==='function'&&S)refreshTab();}catch(e){console.warn('v87 atlas',e);}};im.src=src;})();
