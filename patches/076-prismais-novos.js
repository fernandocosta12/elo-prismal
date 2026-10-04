const A76ATLAS='cms_atlas.webp';
/* ================== v76: 24 Prismais novos (Cute Monster Set #2 por TrulyMalicious, CC-BY 4.0) ================== */
const CMS76=[
 ['basilisco','Basilisco','seiva','sabotador',3,[38,40,28,40],'bosque','Olhar de Pedra','Serpente de escamas de jade. Um olhar dela deixa qualquer um parado.'],
 ['galisco','Galisco','rocha','sabotador',2,[34,28,30,28],'picos','Bicada Pétrea','Meio galo, meio coruja. Pia tão alto que as pedras tremem.'],
 ['genio','Gênio Azul','eter','mistico',4,[48,50,34,46],'costa','Desejo Prismático','Nasceu de uma lâmpada esquecida na praia. Realiza desejos pequenos.'],
 ['fada','Fada da Flor','eter','arauto',3,[40,32,30,40],'vale','Pó de Pétala','Dorme dentro de flores e cura feridas com pó de pétala.'],
 ['gosmabrasa','Gosma Brasa','brasa','mistico',1,[30,30,18,26],'picos','Gota Fervente','Gosminha quente que borbulha quando está feliz.'],
 ['gargula','Gárgula','rocha','guardiao',3,[56,30,50,16],'picos','Pele de Granito','Estátua que acorda à noite para vigiar os telhados.'],
 ['gobrim','Gobrim','rocha','fera',2,[32,34,22,34],'bosque','Golpe de Espada','Goblin espadachim que treina sozinho no bosque.'],
 ['gorgona','Górgona','seiva','mistico',4,[46,52,32,44],'pantano','Cabelos de Serpente','Suas cobrinhas de cabelo cochicham segredos do pântano.'],
 ['harpia','Harpia','tormenta','fera',2,[30,34,18,38],'costa','Garra do Vento','Ave de penas vermelhas que mergulha das falésias.'],
 ['lebrichifre','Lebrichifre','seiva','fera',1,[30,26,18,30],'vale','Chifrada','Coelho de chifre que adora correr pelos campos de orvalho.'],
 ['medusula','Medúsula','mare','mistico',2,[32,36,20,32],'charco','Toque Ardente','Água-viva translúcida que brilha nas noites de chuva.'],
 ['mimico','Mímico','rocha','guardiao',3,[54,32,48,18],'deserto','Mordida de Baú','Parece um baú de tesouro. Não é.'],
 ['tourobal','Tourobal','rocha','guardiao',3,[58,32,46,14],'picos','Investida','Minotauro peludo que protege os desfiladeiros.'],
 ['enfaixado','Enfaixado','eter','guardiao',2,[44,22,38,16],'deserto','Faixas Antigas','Múmia tímida que se esconde atrás das próprias faixas.'],
 ['cogumelim','Cogumelim','seiva','guardiao',1,[40,16,30,14],'vale','Esporos','Cogumelo andante que solta esporos sonolentos.'],
 ['gosmaverde','Gosma Verde','seiva','arauto',1,[36,18,22,22],'vale','Gosma Curativa','Gosminha de folhas que gruda nos amigos para curá-los.'],
 ['roedim','Roedim','rocha','fera',1,[28,28,16,32],'charco','Roída','Rato esperto que rói qualquer coisa, até pedra.'],
 ['ceifadinho','Ceifadinho','eter','sabotador',4,[42,52,30,48],'bosque','Foice Sombria','Pequeno ceifador que só leva embora o cansaço dos outros.'],
 ['lavarrasto','Lavarrasto','brasa','fera',2,[32,34,22,30],'picos','Rastro de Lava','Salamandra de lava que deixa pegadas quentes.'],
 ['escorpino','Escorpino','rocha','sabotador',2,[32,32,30,26],'deserto','Ferrão Venenoso','Escorpião de carapaça azul que se esconde nas dunas.'],
 ['tengu','Tengu','tormenta','sabotador',3,[36,40,26,44],'cume','Máscara do Vento','Guardião mascarado dos picos tempestuosos.'],
 ['gosmatrovao','Gosma Trovão','tormenta','mistico',2,[30,36,18,32],'charco','Choque Gosmento','Gosma elétrica que dá choquinhos quando abraçada.'],
 ['vespao','Vespão','tormenta','fera',2,[28,36,16,40],'charco','Ferroada','Vespa veloz de asas de vidro.'],
 ['fatuo','Fátuo','eter','mistico',2,[30,36,20,36],'costa','Luz Errante','Chaminha fantasma que guia viajantes perdidos.']];
const CMS76W={1:9,2:6,3:3,4:1.2};
(function(){try{CMS76.forEach(([id,n,el,role,r,st,reg,sk,desc])=>{if(SP[id])return;def(id,{n,el,role,r,st,reg,sk,desc:desc+' (Arte: TrulyMalicious, CC-BY 4.0)'});if(COLLECT.indexOf(id)<0)COLLECT.push(id);
  const R=REG[reg];if(R&&R.pool&&!R.pool.some(x=>x[0]===id))R.pool.push([id,CMS76W[r]||3,r>=3?3:1]);});}catch(e){console.warn('v76',e);}})();
/* recorta o atlas em imagens individuais */
(function(){const src=(typeof A76ATLAS!=='undefined')?A76ATLAS:(A63+'cms_atlas.webp');const im=new Image();im.onload=()=>{try{const C=200;CMS76.forEach(([id],i)=>{const c=document.createElement('canvas');c.width=C;c.height=C;c.getContext('2d').drawImage(im,(i%6)*C,Math.floor(i/6)*C,C,C,0,0,C,C);IMG[id]=c.toDataURL('image/png');IMGS.add(id);});if(typeof refreshTab==='function'&&S)refreshTab();}catch(e){console.warn('v76 atlas',e);}};im.src=src;})();
