/* ================== v86: cenários de batalha em estilo cartoon (contorno escuro, cores chapadas), combinando com os Prismais novos ================== */
const BG86=(function(){
 const W=840,H=900,O='#2e1f14',SW=5,TAU=Math.PI*2;
 let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
 const wrap=(x,w,f)=>{let s=f(x);if(x-w<0)s+=f(x+W);if(x+w>W)s+=f(x-W);return s;};
 /* bolha contornada: círculos escuros maiores por baixo, coloridos por cima */
 const blob=(cs,fill,hi)=>cs.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+SW}" fill="${O}"/>`).join('')+cs.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join('')+(hi?cs.slice(0,2).map(([x,y,r])=>`<circle cx="${x-r*.3}" cy="${y-r*.35}" r="${r*.35}" fill="${hi}" opacity=".55"/>`).join(''):'');
 const hill=(yb,amp,k1,k2,ph,fill,top)=>{let d=`M0 ${H} `;for(let x=0;x<=W;x+=10){const y=yb-amp*(.6*Math.sin(TAU*k1*x/W+ph)+.4*Math.sin(TAU*k2*x/W+ph*2.1));d+=`L${x} ${y.toFixed(1)} `;}d+=`L${W} ${H} Z`;
   return `<path d="${d}" fill="${fill}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`+(top?`<path d="${d}" fill="none" stroke="${top}" stroke-width="10" stroke-dasharray="0" transform="translate(0,9)" opacity=".5" clip-path="url(#c)"/>`:'');};
 const peaks=(yb,h,n,fill,snow)=>{let s='';const step=W/n;for(let i=0;i<n;i++){const x=i*step+step/2,hh=h*(.75+.5*((i*37)%10)/10),ww=step*.75;const p=x2=>`M${x2-ww} ${yb} L${x2} ${yb-hh} L${x2+ww} ${yb} Z`;
   s+=wrap(x,ww,x2=>`<path d="${p(x2)}" fill="${fill}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`+(snow?`<path d="M${x2-ww*.28} ${yb-hh*.72} L${x2} ${yb-hh} L${x2+ww*.28} ${yb-hh*.72} L${x2+ww*.12} ${yb-hh*.64} L${x2} ${yb-hh*.74} L${x2-ww*.14} ${yb-hh*.63} Z" fill="${snow}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`:''));}return s;};
 const cloud=(x,y,s,c)=>wrap(x,90*s,x2=>blob([[x2,y,26*s],[x2+30*s,y-12*s,32*s],[x2+64*s,y,24*s],[x2+32*s,y+8*s,24*s]],c||'#fff'));
 const tree=(x,y,s,leaf,hi)=>wrap(x,60*s,x2=>`<rect x="${x2-7*s}" y="${y-40*s}" width="${14*s}" height="${44*s}" rx="${4*s}" fill="#8a5a2e" stroke="${O}" stroke-width="${SW}"/>`+blob([[x2,y-62*s,30*s],[x2-24*s,y-44*s,22*s],[x2+24*s,y-46*s,22*s]],leaf,hi));
 const pine=(x,y,s,c)=>wrap(x,45*s,x2=>`<rect x="${x2-6*s}" y="${y-22*s}" width="${12*s}" height="${26*s}" fill="#7a4a24" stroke="${O}" stroke-width="${SW}"/>`+[0,1,2].map(i=>`<path d="M${x2-(40-i*9)*s} ${y-(20+i*30)*s} L${x2} ${y-(70+i*30)*s} L${x2+(40-i*9)*s} ${y-(20+i*30)*s} Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`).join(''));
 const palm=(x,y,s)=>wrap(x,80*s,x2=>`<path d="M${x2} ${y} Q${x2+14*s} ${y-60*s} ${x2+4*s} ${y-120*s}" fill="none" stroke="${O}" stroke-width="${16*s+SW}" stroke-linecap="round"/><path d="M${x2} ${y} Q${x2+14*s} ${y-60*s} ${x2+4*s} ${y-120*s}" fill="none" stroke="#b07a3e" stroke-width="${16*s}" stroke-linecap="round"/>`+[-150,-110,-60,-20,20].map(a=>{const r=a*Math.PI/180,ex=x2+4*s+Math.cos(r)*70*s,ey=y-120*s+Math.sin(r)*40*s+20*s;return `<path d="M${x2+4*s} ${y-120*s} Q${(x2+4*s+ex)/2} ${y-150*s} ${ex} ${ey}" fill="none" stroke="${O}" stroke-width="${18*s}" stroke-linecap="round"/><path d="M${x2+4*s} ${y-120*s} Q${(x2+4*s+ex)/2} ${y-150*s} ${ex} ${ey}" fill="none" stroke="#4fb04a" stroke-width="${11*s}" stroke-linecap="round"/>`;}).join(''));
 const cactus=(x,y,s)=>wrap(x,40*s,x2=>{const c='#5aa04a';const arm=(dx,h)=>`<path d="M${x2} ${y-50*s} h${dx*22*s} v-${h*s}" fill="none" stroke="${O}" stroke-width="${16*s+SW*2}" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x2} ${y-50*s} h${dx*22*s} v-${h*s}" fill="none" stroke="${c}" stroke-width="${16*s}" stroke-linecap="round" stroke-linejoin="round"/>`;return arm(-1,30)+arm(1,45)+`<rect x="${x2-11*s}" y="${y-110*s}" width="${22*s}" height="${112*s}" rx="${11*s}" fill="${c}" stroke="${O}" stroke-width="${SW}"/>`;});
 const rock=(x,y,s,c)=>wrap(x,40*s,x2=>`<path d="M${x2-34*s} ${y} Q${x2-36*s} ${y-26*s} ${x2-10*s} ${y-34*s} Q${x2+20*s} ${y-40*s} ${x2+32*s} ${y-12*s} L${x2+36*s} ${y} Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M${x2-16*s} ${y-24*s} q10 -8 22 -6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>`);
 const flower=(x,y,c)=>wrap(x,12,x2=>`<path d="M${x2} ${y} v-14" stroke="${O}" stroke-width="4"/>`+blob([[x2-5,y-18,5],[x2+5,y-18,5],[x2,y-23,5],[x2,y-13,5]],c)+`<circle cx="${x2}" cy="${y-18}" r="3.5" fill="#ffd84a"/>`);
 const reed=(x,y,c)=>wrap(x,14,x2=>`<path d="M${x2} ${y} q-4 -40 2 -70" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M${x2} ${y} q-4 -40 2 -70" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><rect x="${x2-4}" y="${y-86}" width="11" height="24" rx="5" fill="#7a4a24" stroke="${O}" stroke-width="3"/>`);
 const crystal=(x,y,s,c)=>wrap(x,30*s,x2=>`<path d="M${x2-14*s} ${y} L${x2-18*s} ${y-40*s} L${x2} ${y-70*s} L${x2+18*s} ${y-40*s} L${x2+14*s} ${y} Z" fill="${c}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M${x2} ${y-70*s} L${x2+4*s} ${y-6*s}" stroke="#fff" stroke-width="3" opacity=".6"/>`);
 const star=(x,y,r)=>`<path d="M${x} ${y-r} L${x+r*.3} ${y-r*.3} L${x+r} ${y} L${x+r*.3} ${y+r*.3} L${x} ${y+r} L${x-r*.3} ${y+r*.3} L${x-r} ${y} L${x-r*.3} ${y-r*.3} Z" fill="#fff6c8"/>`;
 const sky=(a,b,c)=>`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c||b}"/></linearGradient><clipPath id="c"><rect width="${W}" height="${H}"/></clipPath></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`;
 const sun=(x,y,r,c,ring)=>`<circle cx="${x}" cy="${y}" r="${r+18}" fill="${ring||c}" opacity=".25"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${O}" stroke-width="${SW}"/>`;
 const ground=(y,c,band)=>`<path d="M0 ${y} H${W} V${H} H0 Z" fill="${c}" stroke="${O}" stroke-width="${SW}"/><rect y="${y+3}" width="${W}" height="16" fill="${band}" opacity=".6"/>`;
 const path=(y,c)=>`<path d="M0 ${y+70} C210 ${y+40} 420 ${y+110} 630 ${y+70} S840 ${y+70} 840 ${y+70} L840 ${y+130} C630 ${y+170} 420 ${y+100} 210 ${y+140} S0 ${y+130} 0 ${y+130} Z" fill="${c}" stroke="${O}" stroke-width="4" opacity=".9"/>`;
 const water=(y,c,l)=>`<rect y="${y}" width="${W}" height="${H-y}" fill="${c}" stroke="${O}" stroke-width="${SW}"/>`+[0,1,2,3,4,5].map(i=>`<path d="M${(i*150+40)%W} ${y+20+i*14} q15 -8 30 0 t30 0" fill="none" stroke="${l}" stroke-width="4" stroke-linecap="round"/>`).join('');
 const S={
  vale:()=>{seed=3;return sky('#7fd0ff','#bfeaff','#e8f8ff')+sun(660,140,46,'#ffe066')+cloud(120,150,1.1)+cloud(430,110,.8)+cloud(760,190,.9)
    +hill(470,40,1,3,.5,'#9ad36a')+[60,250,420,610,780].map(x=>tree(x,470,.9,'#5cb84a','#9be27a')).join('')+hill(560,28,2,3,2,'#76c050')
    +ground(600,'#8fd060','#b8ea84')+path(600,'#e8c98a')+[30,140,300,470,520,700,800].map((x,i)=>flower(x,640+((i*29)%70)+(i%2?150:0),['#ff7aa8','#ffd84a','#ffffff','#b48cff'][i%4])).join('')+rock(380,880,.9,'#c8b8a0');},
  bosque:()=>{seed=5;return sky('#5fb0c8','#a8dcc8','#d8f0d0')+cloud(200,130,.9,'#f4fff4')+cloud(620,90,.7,'#f4fff4')
    +hill(430,40,1,2,1,'#4f9a5a')+[0,105,210,315,420,525,630,735].map((x,i)=>pine(x+20,450+(i%2)*14,1.15,'#3e8a4c')).join('')
    +hill(560,22,2,3,.3,'#5aa858')+[70,300,560,760].map(x=>tree(x,580,1,'#4caa48','#86d46a')).join('')
    +ground(610,'#6fb84e','#9ad46c')+path(610,'#d8b47a')+[90,380,650].map(x=>rock(x,870,.8,'#a89880')).join('')+[200,520,780].map((x,i)=>flower(x,700+i*40,'#ff9a4a')).join('');},
  charco:()=>{seed=7;return sky('#7cc6c0','#b8e2d0','#d8efe0')+cloud(160,140,.9,'#f0fff8')+cloud(560,100,1,'#f0fff8')
    +hill(470,30,1,2,2,'#6aa880')+[80,330,600].map(x=>tree(x,480,.85,'#4f9a68','#7cc890')).join('')
    +ground(560,'#7cb868','#a0d080')+water(640,'#4aa6b0','#9ee0e0')+[60,150,410,520,700,790].map((x,i)=>reed(x,640+(i%2)*6,'#5aa050')).join('')
    +[[200,720],[480,800],[690,740],[320,860]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="34" ry="12" fill="#5ab84a" stroke="${O}" stroke-width="4"/>`).join('')+[640,90].map(x=>rock(x,650,.7,'#8aa08a')).join('');},
  picos:()=>{seed=9;return sky('#ff9a6a','#ffc890','#ffe2b8')+sun(220,170,40,'#fff0a0','#ff8a40')+cloud(560,120,.9,'#ffe8d8')
    +peaks(520,300,4,'#a08070','#fff4ea')+hill(560,30,2,3,1,'#9a6a50')+peaks(600,140,7,'#8a5a44')
    +ground(620,'#b07a52','#d09a68')+path(620,'#e0b884')+[80,260,500,720].map((x,i)=>rock(x,660+(i%2)*190,1,'#8a7a70')).join('')
    +[[380,700],[640,830]].map(([x,y])=>`<path d="M${x-40} ${y} q40 -18 80 0" fill="none" stroke="#ff6a2a" stroke-width="10" stroke-linecap="round"/>`).join('');},
  costa:()=>{seed=11;return sky('#5ac0ff','#a8e4ff','#e0f6ff')+sun(680,150,44,'#ffe066')+cloud(150,120,1)+cloud(430,180,.7)
    +water(440,'#3aa0e8','#bfe8ff')+`<path d="M0 560 Q210 520 420 560 T840 560 V${H} H0Z" fill="#f2d79a" stroke="${O}" stroke-width="${SW}"/>`
    +`<path d="M0 560 Q210 520 420 560 T840 560" fill="none" stroke="#fff" stroke-width="10" opacity=".7" transform="translate(0,-6)"/>`
    +[110,470,760].map((x,i)=>palm(x,640+(i%2)*20,1.1)).join('')+[260,600].map(x=>rock(x,840,.8,'#c8b090')).join('')
    +[[330,700,'#ff8a8a'],[560,760,'#ffb44a']].map(([x,y,c])=>`<path d="M${x} ${y} l14 -18 l14 18 z" fill="${c}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`).join('');},
  deserto:()=>{seed=13;return sky('#ffb86a','#ffd89a','#fff0cc')+sun(640,170,52,'#fff3a0','#ffb030')+cloud(200,120,.7,'#fff4e4')
    +hill(470,40,1,2,.7,'#e8a85a')+hill(560,30,2,3,2,'#f0c070')+ground(620,'#f2cc84','#f8dc9c')
    +[90,340,610,780].map((x,i)=>cactus(x,640+(i%2)*150,1)).join('')+[230,500].map(x=>rock(x,860,.9,'#c89868')).join('')
    +`<path d="M0 760 Q420 720 840 760" fill="none" stroke="#e0b06a" stroke-width="6" opacity=".7"/>`;},
  pantano:()=>{seed=15;return sky('#3a2a6a','#6a4a8a','#8a6aa0')+[[80,80],[260,140],[420,60],[700,110],[540,190],[150,230],[780,240]].map(([x,y])=>star(x,y,7)).join('')
    +sun(620,150,42,'#fff6d0','#c8b0ff')+hill(470,30,1,3,1,'#4a5a6a')+[60,320,560,780].map(x=>tree(x,480,.9,'#5a6a7a','#7a8aa0')).join('')
    +ground(560,'#5a6a5a','#6a7a6a')+water(640,'#5a4a8a','#a090d0')+[100,300,480,720].map((x,i)=>reed(x,640,'#6a8a6a')).join('')
    +[[230,760],[600,820]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#d0ff8a" opacity=".85"/>`).join('');},
  cume:()=>{seed=17;return sky('#6a8ab8','#a8c0e0','#d8e6f6')+cloud(150,120,1.1,'#e6eef8')+cloud(520,90,.9,'#e6eef8')+cloud(760,170,.8,'#e6eef8')
    +`<path d="M520 60 l-30 70 h26 l-24 66" fill="none" stroke="#ffe24a" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>`
    +peaks(520,320,4,'#8a9ab8','#ffffff')+peaks(600,150,6,'#7a8aa8','#f4f8ff')
    +ground(620,'#e8f0fa','#ffffff')+path(620,'#c8d8ea')+[80,300,560,760].map((x,i)=>pine(x,660+(i%2)*180,.8,'#4a7a6a')).join('')+[420].map(x=>rock(x,860,.9,'#9aa8c0')).join('');},
  recife:()=>{seed=19;return sky('#1a8ab0','#3ab0c8','#6ad0d8')+[0,1,2,3,4].map(i=>`<path d="M${i*190+30} 0 L${i*190+90} 0 L${i*190+40} 500 Z" fill="#fff" opacity=".12"/>`).join('')
    +hill(520,30,1,2,1,'#2a8a9a')+ground(620,'#e8d8a0','#f2e6b8')
    +[70,260,470,690].map((x,i)=>blob([[x,620,26],[x-22,590,18],[x+20,585,20],[x,560,16]],['#ff7a9a','#ffa04a','#b47aff','#ff6a6a'][i])).join('')
    +[[200,340],[520,260],[700,420],[380,180]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#e0ffff" stroke-width="4" opacity=".7"/>`).join('')
    +[150,600].map(x=>rock(x,860,.9,'#7ab0b0')).join('');},
  coracao:()=>{seed=21;return sky('#7a5ab8','#b08ae0','#e0c8f8')+[[100,100],[300,60],[520,140],[720,80]].map(([x,y])=>star(x,y,8)).join('')
    +hill(480,40,1,2,1,'#8a6ac8')+[60,200,380,560,720].map((x,i)=>crystal(x,500+(i%2)*14,1.2,['#c8a8ff','#8ad8ff','#ff9ad8'][i%3])).join('')
    +ground(610,'#a888d8','#c8b0ee')+path(610,'#e8d8ff')+[120,330,640,790].map((x,i)=>crystal(x,700+(i%2)*160,.8,['#8ad8ff','#ffd28a'][i%2])).join('');},
  abismo:()=>{seed=23;return sky('#141a3a','#2a2a5a','#3a3a6a')+[[120,90],[400,60],[650,130],[260,210],[760,240]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#8ad8ff"/>`).join('')
    +peaks(540,280,5,'#2a2a4a')+hill(580,30,2,3,1,'#3a3a5a')+ground(620,'#4a4a6a','#5a5a7a')
    +[100,320,560,760].map((x,i)=>crystal(x,640+(i%2)*170,.9,['#4ad8ff','#a87aff'][i%2])).join('')+[440].map(x=>rock(x,860,1,'#5a5a78')).join('');},
  estelar:()=>{seed=25;let s=sky('#0a0a2a','#2a1a5a','#4a2a7a');for(let i=0;i<40;i++)s+=star(rnd()*W,rnd()*520,2+rnd()*6);
    return s+sun(200,170,50,'#fff0c0','#a0a0ff')+`<ellipse cx="200" cy="170" rx="90" ry="16" fill="none" stroke="#ffd8a0" stroke-width="6" transform="rotate(-15 200 170)"/>`
    +hill(520,30,1,2,1,'#3a2a6a')+ground(620,'#5a4a8a','#6a5aa0')+path(620,'#8a7ac8')+[80,350,620].map((x,i)=>crystal(x,660+(i%2)*170,.8,'#ffe08a')).join('');},
  arena:()=>{seed=27;return sky('#7fd0ff','#ffe0b0','#ffe0b0')+cloud(160,110,.9)+cloud(600,90,.8)
    +`<rect y="300" width="${W}" height="240" fill="#c8905a" stroke="${O}" stroke-width="${SW}"/>`+[0,1,2,3,4,5,6,7].map(i=>`<rect x="${i*105+20}" y="330" width="60" height="80" rx="30" fill="#7a4a24" stroke="${O}" stroke-width="4"/>`).join('')
    +[0,1,2,3].map(i=>`<path d="M${i*210+105} 300 v-90" stroke="${O}" stroke-width="5"/><path d="M${i*210+105} 210 l50 14 l-50 14 z" fill="${['#ff5a5a','#4aa0ff','#ffd04a','#6ad06a'][i]}" stroke="${O}" stroke-width="4"/>`).join('')
    +ground(540,'#e8c890','#f4dcaa')+`<ellipse cx="420" cy="760" rx="300" ry="70" fill="none" stroke="#fff" stroke-width="8" opacity=".5"/>`;},
  torre:()=>{seed=29;return sky('#4a3a8a','#8a6ac0','#c8a8e0')+[[100,90],[500,60],[720,140]].map(([x,y])=>star(x,y,7)).join('')
    +`<rect x="300" y="80" width="240" height="560" fill="#b8a0d0" stroke="${O}" stroke-width="${SW}"/>`+[0,1,2,3].map(i=>`<rect x="395" y="${140+i*120}" width="50" height="70" rx="25" fill="#ffe08a" stroke="${O}" stroke-width="4"/>`).join('')
    +`<path d="M280 80 L420 0 L560 80 Z" fill="#7a5ab0" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`
    +hill(560,24,2,3,1,'#6a5aa0')+ground(620,'#8a7ab0','#a898c8')+path(620,'#c8b8e0')+[90,720].map(x=>crystal(x,660,.9,'#ffd28a')).join('');}};
 const MAP={vale:'vale',bosque:'bosque',charco:'charco',picos:'picos',costa:'costa',deserto:'deserto',pantano:'pantano',cume:'cume',recife:'recife',coracao:'coracao',abismo:'abismo',estelar:'estelar',arena:'arena',torre:'torre'};
 const svg=k=>`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${S[k]()}</svg>`;
 return {svg,MAP,W,H,keys:Object.keys(S)};})();
(function(){const st=document.createElement('style');st.id='v86css';st.textContent=`html body #arena .bgimg,html body[data-tab] #arena .bgimg{background-size:cover!important;background-position:center bottom!important;filter:none!important}
html body #arena.night .bgimg,html body[data-tab] #arena.night .bgimg{filter:brightness(.72) saturate(.9)!important}html body #arena.storm .bgimg,html body[data-tab] #arena.storm .bgimg{filter:brightness(.82) saturate(.8)!important}
html body #arena.scene::after{opacity:.35!important}html body #arena .vig{opacity:.25!important}html body #arena .fogl{opacity:.25!important}`;document.head.appendChild(st);
 const done={};const apply=()=>{try{document.querySelectorAll('.scene .bgimg').forEach(e=>{const r=e.closest('.scene').dataset.reg;const u=IMG['bg_'+r];if(u&&done[r]&&!e.style.backgroundImage.includes(u.slice(-40)))e.style.backgroundImage=`url(${u})`;});}catch(e){}};
 const make=k=>new Promise(res=>{const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=BG86.W;c.height=BG86.H;c.getContext('2d').drawImage(im,0,0);res(c.toDataURL('image/webp',.88));}catch(e){res(null);}};im.onerror=()=>res(null);im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(BG86.svg(k));});
 (async()=>{for(const k of BG86.keys){const u=await make(k);if(!u)continue;const targets=Object.keys(REG).filter(r=>r===k||(!BG86.keys.includes(r)&&REG[r].bg===k)).concat([k]);targets.forEach(t=>{IMG['bg_'+t]=u;done[t]=1;});apply();}})();
 setInterval(apply,1500);})();
