// Monta o jogo: baixa a versão base publicada e aplica os patches da pasta patches/ em ordem.
import fs from 'node:fs';
const BASE='https://eloprismal.lovable.app/game.html';
const T="const TABS=[['personagem','Master']";
let h;if(process.env.BASE_FILE){h=fs.readFileSync(process.env.BASE_FILE,'utf8');}else{const r=await fetch(BASE,{cache:'no-store'});if(!r.ok)throw new Error('falha ao baixar base '+r.status);h=await r.text();}if(h.length<5e6||h.split(T).length!==2)throw new Error('base inesperada');
// arquivos estáticos (trajes, efeitos) continuam vindo do endereço antigo
h=h.replace(/const A63=[^;]*;/,"const A63='https://eloprismal.lovable.app/a/';");
const files=fs.readdirSync('patches').filter(f=>f.endsWith('.js')).sort();let add='';
for(const f of files){const src=fs.readFileSync('patches/'+f,'utf8').replace(/\s+$/,'')+'\n';const m=src.match(/v(\d+):/);if(m&&h.includes('v'+m[1]+':')){console.log('já aplicado',f);continue;}add+=src;console.log('aplicando',f);}
h=h.replace(T,()=>add+T);
fs.mkdirSync('_site',{recursive:true});fs.writeFileSync('_site/index.html',h);fs.writeFileSync('_site/game.html',h);
for(const f of ['cms_atlas.webp'])fs.copyFileSync(f,'_site/'+f);
fs.writeFileSync('_site/.nojekyll','');console.log('ok',h.length);
