// Biblioteca de desenho dos cenários (SVG) em estilo cartoon com perspectiva.
// Tudo é gerado por código e depois rasterizado em WebP por tools/fundos/render.mjs.
export const W = 720, H = 1320;
export let HZ = 600;            // linha do horizonte (pixels da imagem)
export const K = 256;           // pixels por metro na base da imagem
export let LX = -1;             // luz vindo da esquerda (-1) ou da direita (+1)
export let HAZE = '#cfe6ff';    // cor da névoa atmosférica
export const O = '#2a1c12';     // cor do contorno
export const setScene = o => { if (o.hz != null) HZ = o.hz; if (o.lx != null) LX = o.lx; if (o.haze) HAZE = o.haze; };

let S_ = 1;
export const seed = n => { S_ = (n >>> 0) % 2147483647 || 1; };
export const R = () => { S_ = (S_ * 16807) % 2147483647; return (S_ - 1) / 2147483646; };
export const rr = (a, b) => a + (b - a) * R();
export const ri = (a, b) => Math.floor(rr(a, b + 1));
export const pick = a => a[Math.floor(R() * a.length)];
export const f = v => Math.round(v * 10) / 10;

const hx = c => { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); };
const toh = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toh(A.map((v, i) => v + (B[i] - v) * t)); };
export const dk = (c, t = .3) => mix(c, '#1c1226', t);
export const lt = (c, t = .3) => mix(c, '#fffbe8', t);

let UID = 0; export let DEFS = [];
export const resetDefs = () => { DEFS = []; UID = 0; };
export const uid = p => p + (++UID);
export const def = s => { DEFS.push(s); };

// perspectiva do chão
export const sr = y => Math.max(0, (y - HZ) / (H - HZ));      // 0 no horizonte, 1 na base
export const sc = y => K * sr(y);                              // pixels por metro naquela profundidade
export const px = (X, y, cx = W / 2) => cx + X * sc(y);
export const yAt = u => HZ + (H - HZ) / u;                     // u = distância (1 = base da imagem)
export const hazeAt = y => Math.min(.85, Math.pow(1 - sr(y), 6) * .75);
export const lwAt = y => Math.max(1.1, Math.min(6, 1 + 5.5 * sr(y)));

export const lg = (stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units) => { const id = uid('lg'); def(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${units ? ' gradientUnits="userSpaceOnUse"' : ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`); return `url(#${id})`; };
export const rg = (stops, cx = .5, cy = .5, r = .5, units) => { const id = uid('rg'); def(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${units ? ' gradientUnits="userSpaceOnUse"' : ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`); return `url(#${id})`; };
export const clip = inner => { const id = uid('cp'); def(`<clipPath id="${id}">${inner}</clipPath>`); return `url(#${id})`; };
const bbox = cs => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y, r] of cs) { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); } return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
const circ = ([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
const pts = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');

/* ---------- formas base ---------- */
// aglomerado de bolhas com sombreamento cel (copas, arbustos, nuvens, corais)
export function cluster(cs, base, o = {}) {
  const lw = o.lw ?? 4, oc = o.oc || O, dark = o.dark || dk(base, .34), hi = o.hi || lt(base, .38);
  const sorted = cs.slice().sort((a, b) => b[1] - a[1]);
  let s = '';
  if (lw > 0) s += `<g fill="${oc}">${cs.map(([x, y, r]) => circ([x, y, r + lw])).join('')}</g>`;
  let flat = '';
  if (o.flat != null) { flat = clip(`<rect x="-500" y="-2000" width="3000" height="${2000 + o.flat}"/>`); }
  s += `<g${flat ? ` clip-path="${flat}"` : ''}>`;
  for (const [x, y, r] of sorted) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${dark}"/><circle cx="${f(x + LX * r * .1)}" cy="${f(y - r * .14)}" r="${f(r * .85)}" fill="${base}"/>`;
  const tops = cs.slice().sort((a, b) => a[1] - b[1]).slice(0, o.hiN ?? 3);
  if (o.hiN !== 0) s += tops.map(([x, y, r]) => `<circle cx="${f(x + LX * r * .3)}" cy="${f(y - r * .38)}" r="${f(r * .3)}" fill="${hi}"/>`).join('');
  if (o.vol !== false) {
    const cp = clip(cs.map(circ).join('')); const b = bbox(cs);
    const g = lg([[.35, dark, 0], [1, dark, o.volA ?? .55]], LX < 0 ? 0 : 1, 0, LX < 0 ? 1 : 0, 1);
    s += `<rect clip-path="${cp}" x="${f(b.x)}" y="${f(b.y)}" width="${f(b.w)}" height="${f(b.h)}" fill="${g}"/>`;
  }
  s += '</g>';
  if (lw > 0 && o.flat != null) { const b = bbox(cs); s += `<rect x="${f(b.x)}" y="${f(o.flat)}" width="${f(b.w)}" height="${f(lw)}" fill="${oc}"/>`; }
  return s;
}

export function shadowEll(x, y, rx, ry, a = .22) { return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#1a1006" opacity="${f(a * 100) / 100}"/>`; }

/* ---------- vegetação ---------- */
export function tree(x, y, m, P, o = {}) {
  const hz = o.hz ?? hazeAt(y), th = (o.h || 4.2) * m;
  const leaf = mix(P.leaf, HAZE, hz), bark = mix(P.bark || '#8a5a32', HAZE, hz), oc = mix(O, HAZE, hz * .85);
  const lw = Math.max(1, Math.min(6, th * .012));
  let s = '';
  if (!o.noShadow) s += shadowEll(x - LX * th * .1, y, th * .26, th * .06, .2 * (1 - hz));
  const tw = th * .075, tTop = y - th * .5;
  const trunk = `M${f(x - tw * 1.6)} ${f(y)} Q${f(x - tw * .8)} ${f(y - th * .05)} ${f(x - tw * .7)} ${f(y - th * .2)} L${f(x - tw * .55)} ${f(tTop)} L${f(x + tw * .55)} ${f(tTop)} L${f(x + tw * .7)} ${f(y - th * .2)} Q${f(x + tw * .8)} ${f(y - th * .05)} ${f(x + tw * 1.6)} ${f(y)} Z`;
  s += `<path d="${trunk}" fill="${bark}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  s += `<path clip-path="${clip(`<path d="${trunk}"/>`)}" d="M${f(x - LX * tw * .1)} ${f(tTop)} L${f(x - LX * tw * 3)} ${f(tTop)} L${f(x - LX * tw * 3)} ${f(y + 2)} L${f(x - LX * tw * .25)} ${f(y + 2)} Z" fill="${dk(bark, .35)}"/>`;
  if (th > 60) s += `<path d="M${f(x)} ${f(y - th * .32)} q${f(-LX * th * .08)} ${f(-th * .08)} ${f(-LX * th * .14)} ${f(-th * .12)}" fill="none" stroke="${oc}" stroke-width="${f(tw * .7 + lw * 2)}" stroke-linecap="round"/><path d="M${f(x)} ${f(y - th * .32)} q${f(-LX * th * .08)} ${f(-th * .08)} ${f(-LX * th * .14)} ${f(-th * .12)}" fill="none" stroke="${bark}" stroke-width="${f(tw * .7)}" stroke-linecap="round"/>`;
  const cx = x, cy = y - th * .7, Rr = th * .31, n = o.n || 8, cs = [];
  for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n + rr(-.25, .25), d = Rr * rr(.5, .66); cs.push([cx + Math.cos(a) * d * 1.12, cy + Math.sin(a) * d * .82, Rr * rr(.4, .54)]); }
  cs.push([cx, cy - Rr * .1, Rr * .62]);
  s += cluster(cs, leaf, { lw, oc, dark: mix(P.leafDark || dk(P.leaf, .38), HAZE, hz), hi: mix(P.leafHi || lt(P.leaf, .4), HAZE, hz) });
  if (th > 140 && !o.plain) { // detalhes de folhas
    for (let i = 0; i < 7; i++) { const a = rr(0, Math.PI * 2), d = rr(0, Rr * .7), xx = cx + Math.cos(a) * d, yy = cy + Math.sin(a) * d * .8, w = th * .03; s += `<path d="M${f(xx - w)} ${f(yy)} q${f(w)} ${f(w * .9)} ${f(w * 2)} 0" fill="none" stroke="${mix(dk(P.leaf, .45), HAZE, hz)}" stroke-width="${f(lw * .7)}" stroke-linecap="round"/>`; }
    if (o.fruit) for (let i = 0; i < 6; i++) { const a = rr(0, Math.PI * 2), d = rr(Rr * .2, Rr * .75); s += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d * .8)}" r="${f(th * .022)}" fill="${o.fruit}" stroke="${oc}" stroke-width="${f(lw * .6)}"/>`; }
  }
  return s;
}

export function pine(x, y, m, P, o = {}) {
  const hz = o.hz ?? hazeAt(y), th = (o.h || 5.5) * m, tiers = o.tiers || 4;
  const leaf = mix(P.pine || '#3f8a52', HAZE, hz), dark = mix(dk(P.pine || '#3f8a52', .4), HAZE, hz), oc = mix(O, HAZE, hz * .85), bark = mix(P.bark || '#7a4a24', HAZE, hz);
  const lw = Math.max(1, Math.min(6, th * .011));
  let s = '';
  if (!o.noShadow) s += shadowEll(x - LX * th * .12, y, th * .26, th * .06, .25 * (1 - hz));
  s += `<rect x="${f(x - th * .035)}" y="${f(y - th * .16)}" width="${f(th * .07)}" height="${f(th * .16)}" fill="${bark}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  for (let i = 0; i < tiers; i++) {
    const yb = y - th * .12 - i * th * (.72 / tiers), yt = yb - th * .38, hw = th * .3 * (1 - i * (.62 / tiers));
    let d = `M${f(x)} ${f(yt)} Q${f(x - hw * .3)} ${f(yt + (yb - yt) * .6)} ${f(x - hw)} ${f(yb)} `;
    const k = 4; for (let j = 1; j <= k; j++) d += `Q${f(x - hw + (2 * j - 1) * hw / k)} ${f(yb + hw * .16)} ${f(x - hw + 2 * j * hw / k)} ${f(yb)} `;
    d += `Q${f(x + hw * .3)} ${f(yt + (yb - yt) * .6)} ${f(x)} ${f(yt)} Z`;
    s += `<path d="${d}" fill="${leaf}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
    s += `<path clip-path="${clip(`<path d="${d}"/>`)}" d="M${f(x + LX * hw * .05)} ${f(yt)} L${f(x - LX * hw * 1.4)} ${f(yt)} L${f(x - LX * hw * 1.4)} ${f(yb + hw)} L${f(x - LX * hw * .25)} ${f(yb + hw)} Z" fill="${dark}"/>`;
    s += `<path d="M${f(x + LX * hw * .2)} ${f(yt + (yb - yt) * .45)} q${f(LX * hw * .25)} ${f((yb - yt) * .2)} ${f(LX * hw * .5)} ${f((yb - yt) * .35)}" fill="none" stroke="${mix(lt(P.pine || '#3f8a52', .35), HAZE, hz)}" stroke-width="${f(lw * 1.2)}" stroke-linecap="round"/>`;
    if (o.snow) { const sd = `M${f(x)} ${f(yt)} Q${f(x - hw * .2)} ${f(yt + (yb - yt) * .3)} ${f(x - hw * .5)} ${f(yt + (yb - yt) * .55)} q${f(hw * .15)} ${f(-hw * .08)} ${f(hw * .25)} ${f(hw * .02)} q${f(hw * .15)} ${f(-hw * .12)} ${f(hw * .25)} 0 q${f(hw * .15)} ${f(-hw * .1)} ${f(hw * .25)} ${f(hw * .03)} q${f(hw * .15)} ${f(-hw * .1)} ${f(hw * .25)} ${f(-hw * .02)} Q${f(x + hw * .2)} ${f(yt + (yb - yt) * .3)} ${f(x)} ${f(yt)} Z`; s += `<path d="${sd}" fill="${mix('#ffffff', HAZE, hz * .5)}" stroke="${oc}" stroke-width="${f(lw * .8)}" stroke-linejoin="round"/>`; }
  }
  return s;
}

export function bush(x, y, m, col, o = {}) {
  const hz = o.hz ?? hazeAt(y), w = (o.w || 1.4) * m, c = mix(col, HAZE, hz), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, w * .025));
  const cs = []; const n = o.n || 5;
  for (let i = 0; i < n; i++) { const t = i / (n - 1) - .5; cs.push([x + t * w * .8 + rr(-w * .05, w * .05), y - w * (.22 + (.5 - Math.abs(t)) * .3) + rr(-w * .04, w * .04), w * rr(.2, .27)]); }
  let s = shadowEll(x - LX * w * .1, y, w * .55, w * .1, .22 * (1 - hz)) + cluster(cs, c, { lw, oc, flat: y, hiN: 2 });
  if (o.dots) for (let i = 0; i < (o.nd || 6); i++) { const a = rr(Math.PI * 1.05, Math.PI * 1.95), d = rr(.1, .4) * w; s += `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(y - w * .25 + Math.sin(a) * d * .7)}" r="${f(w * .035)}" fill="${mix(o.dots, HAZE, hz)}" stroke="${oc}" stroke-width="${f(lw * .5)}"/>`; }
  return s;
}

export function tuft(x, y, m, c1, c2, o = {}) {
  const hz = hazeAt(y), h = (o.h || .28) * m, n = o.n || ri(3, 5), oc = mix(O, HAZE, hz * .85);
  let s = '';
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1 || 1)) - .5, bx = x + t * h * .6, lean = t * h * .9 + rr(-h * .1, h * .1), hh = h * rr(.65, 1) * (1 - Math.abs(t) * .4), w = h * .16;
    const d = `M${f(bx - w)} ${f(y)} Q${f(bx - w * .2 + lean * .3)} ${f(y - hh * .6)} ${f(bx + lean)} ${f(y - hh)} Q${f(bx + w * .4 + lean * .3)} ${f(y - hh * .5)} ${f(bx + w)} ${f(y)} Z`;
    s += `<path d="${d}" fill="${mix(i % 2 ? c1 : c2, HAZE, hz)}"${m > 90 ? ` stroke="${oc}" stroke-width="${f(Math.min(2.2, m * .011))}" stroke-linejoin="round"` : ''}/>`;
  }
  return s;
}

export function flower(x, y, m, col, o = {}) {
  const hz = hazeAt(y), r = (o.r || .045) * m, c = mix(col, HAZE, hz), oc = mix(O, HAZE, hz * .85);
  let s = `<path d="M${f(x)} ${f(y)} q${f(r * .4)} ${f(-r * 2)} 0 ${f(-r * 3.4)}" fill="none" stroke="${mix('#3f8a3a', HAZE, hz)}" stroke-width="${f(Math.max(1, r * .45))}"/>`;
  const cy = y - r * 3.4;
  if (r > 3) s += `<g fill="${oc}">${[0, 1, 2, 3, 4].map(i => { const a = i * Math.PI * 2 / 5 - Math.PI / 2; return circ([x + Math.cos(a) * r * .9, cy + Math.sin(a) * r * .9, r * .75]); }).join('')}</g>`;
  s += `<g fill="${c}">${[0, 1, 2, 3, 4].map(i => { const a = i * Math.PI * 2 / 5 - Math.PI / 2; return circ([x + Math.cos(a) * r * .9, cy + Math.sin(a) * r * .9, r * .62]); }).join('')}</g><circle cx="${f(x)}" cy="${f(cy)}" r="${f(r * .5)}" fill="${mix('#ffd23a', HAZE, hz)}"/>`;
  return s;
}

export function rock(x, y, m, col, o = {}) {
  const hz = o.hz ?? hazeAt(y), w = (o.w || 1) * m, h = w * (o.hr || rr(.55, .8)), c = mix(col, HAZE, hz), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(6, w * .03));
  const n = 7, P = [[x - w * .5, y]];
  for (let i = 1; i < n; i++) { const a = Math.PI + Math.PI * i / n; P.push([x + Math.cos(a) * w * .5 * rr(.85, 1.08), y + Math.sin(a) * h * rr(.8, 1.05)]); }
  P.push([x + w * .5, y]);
  const d = 'M' + pts(P).replace(/ /g, ' L') + ' Z';
  let s = shadowEll(x - LX * w * .25, y, w * .62, w * .12, .25 * (1 - hz));
  const cp = clip(`<path d="${d}"/>`);
  s += `<path d="${d}" fill="${c}"/>`;
  const rx = x + LX * w * .05;
  s += `<g clip-path="${cp}"><path d="M${f(rx)} ${f(y - h * 1.2)} L${f(rx - LX * w * .12)} ${f(y - h * .45)} L${f(rx - LX * w * .02)} ${f(y + 2)} L${f(x - LX * w)} ${f(y + 2)} L${f(x - LX * w)} ${f(y - h * 1.2)} Z" fill="${dk(c, .3)}"/>`;
  s += `<path d="M${f(x + LX * w * .5)} ${f(y - h * .2)} L${f(x + LX * w * .1)} ${f(y - h * .95)} L${f(rx + LX * w * .02)} ${f(y - h * 1.2)} L${f(x + LX * w * .7)} ${f(y - h * 1.2)} Z" fill="${lt(c, .25)}"/></g>`;
  s += `<path d="${d}" fill="none" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  if (w > 50) s += `<path d="M${f(x - LX * w * .02)} ${f(y - h * .7)} l${f(-LX * w * .1)} ${f(h * .2)} l${f(LX * w * .04)} ${f(h * .15)}" fill="none" stroke="${oc}" stroke-width="${f(lw * .7)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (o.moss) s += `<path clip-path="${cp}" d="M${f(x - w * .6)} ${f(y - h * .75)} Q${f(x)} ${f(y - h * 1.25)} ${f(x + w * .6)} ${f(y - h * .7)} L${f(x + w * .6)} ${f(y - h * 1.3)} L${f(x - w * .6)} ${f(y - h * 1.3)} Z" fill="${mix(o.moss, HAZE, hz)}"/>`;
  return s;
}

export function mushroom(x, y, m, cap, o = {}) {
  const hz = hazeAt(y), h = (o.h || .35) * m, oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(4, h * .05)), c = mix(cap, HAZE, hz);
  let s = shadowEll(x, y, h * .5, h * .1, .25);
  s += `<path d="M${f(x - h * .16)} ${f(y)} Q${f(x - h * .12)} ${f(y - h * .4)} ${f(x - h * .1)} ${f(y - h * .62)} L${f(x + h * .1)} ${f(y - h * .62)} Q${f(x + h * .12)} ${f(y - h * .4)} ${f(x + h * .16)} ${f(y)} Z" fill="${mix('#f4e6c8', HAZE, hz)}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  const cd = `M${f(x - h * .5)} ${f(y - h * .55)} Q${f(x - h * .48)} ${f(y - h * 1.05)} ${f(x)} ${f(y - h * 1.08)} Q${f(x + h * .48)} ${f(y - h * 1.05)} ${f(x + h * .5)} ${f(y - h * .55)} Q${f(x)} ${f(y - h * .42)} ${f(x - h * .5)} ${f(y - h * .55)} Z`;
  s += `<path d="${cd}" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  s += `<path clip-path="${clip(`<path d="${cd}"/>`)}" d="M${f(x - LX * h * .1)} ${f(y - h * 1.2)} Q${f(x - LX * h * .45)} ${f(y - h * .8)} ${f(x - LX * h * .2)} ${f(y - h * .4)} L${f(x - LX * h)} ${f(y - h * .4)} L${f(x - LX * h)} ${f(y - h * 1.2)} Z" fill="${dk(c, .3)}"/>`;
  if (o.spots !== false) s += [[-.22, -.82, .09], [.12, -.9, .07], [.28, -.7, .06], [-.02, -.68, .05]].map(([dx, dy, r]) => `<circle cx="${f(x + dx * h)}" cy="${f(y + dy * h)}" r="${f(r * h)}" fill="${mix(o.spot || '#fff6e8', HAZE, hz)}"/>`).join('');
  if (o.glow) s = `<circle cx="${f(x)}" cy="${f(y - h * .7)}" r="${f(h * 1.4)}" fill="${rg([[0, o.glow, .55], [1, o.glow, 0]])}"/>` + s;
  return s;
}

export function reed(x, y, m, o = {}) {
  const hz = hazeAt(y), h = (o.h || 1.3) * m, oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(4, h * .02)), c = mix(o.c || '#6aa04a', HAZE, hz);
  let s = '';
  const n = o.n || 4;
  for (let i = 0; i < n; i++) {
    const dx = (i - (n - 1) / 2) * h * .07, hh = h * rr(.7, 1), bend = rr(-.12, .12) * h;
    s += `<path d="M${f(x + dx)} ${f(y)} Q${f(x + dx + bend * .3)} ${f(y - hh * .5)} ${f(x + dx + bend)} ${f(y - hh)}" fill="none" stroke="${oc}" stroke-width="${f(h * .035 + lw * 2)}" stroke-linecap="round"/><path d="M${f(x + dx)} ${f(y)} Q${f(x + dx + bend * .3)} ${f(y - hh * .5)} ${f(x + dx + bend)} ${f(y - hh)}" fill="none" stroke="${c}" stroke-width="${f(h * .035)}" stroke-linecap="round"/>`;
    if (i % 2 === 0) s += `<rect x="${f(x + dx + bend * .85 - h * .035)}" y="${f(y - hh * .95)}" width="${f(h * .07)}" height="${f(h * .2)}" rx="${f(h * .035)}" fill="${mix('#7a4a24', HAZE, hz)}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
    else s += `<path d="M${f(x + dx)} ${f(y)} q${f(-h * .12)} ${f(-h * .3)} ${f(-h * .22)} ${f(-h * .45)}" fill="none" stroke="${c}" stroke-width="${f(h * .03)}" stroke-linecap="round"/>`;
  }
  return s;
}

export function palm(x, y, m, o = {}) {
  const hz = hazeAt(y), h = (o.h || 5) * m, oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, h * .009)), dir = o.dir || 1;
  const bark = mix('#b88748', HAZE, hz), leaf = mix('#4cae4a', HAZE, hz), leafD = mix('#2f7a3a', HAZE, hz);
  let s = shadowEll(x + dir * h * .3, y, h * .3, h * .045, .2);
  const tx = x + dir * h * .26, ty = y - h * .92;
  const segs = 10; for (let i = 0; i < segs; i++) { const t0 = i / segs, t1 = (i + 1) / segs; const p = t => [x + dir * h * .26 * t * t, y - h * .92 * t]; const [a, b] = [p(t0), p(t1)]; const w = h * .045 * (1 - t0 * .45); s += `<path d="M${f(a[0] - w)} ${f(a[1])} L${f(b[0] - w * .9)} ${f(b[1] + 1)} L${f(b[0] + w * .9)} ${f(b[1] + 1)} L${f(a[0] + w)} ${f(a[1])} Z" fill="${i % 2 ? bark : dk(bark, .14)}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`; }
  const fr = o.fronds || [-170, -140, -110, -70, -40, -10, 15];
  for (const a0 of fr) { const a = a0 * Math.PI / 180, L2 = h * rr(.36, .46), c = (a0 < -90) === (dir > 0) ? leafD : leaf;
    const ex = tx + Math.cos(a) * L2, ey = ty + Math.sin(a) * L2 * .45 + L2 * .42, mx = tx + Math.cos(a) * L2 * .55, my = ty + Math.sin(a) * L2 * .5 - L2 * .08;
    const rib = `M${f(tx)} ${f(ty)} Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`;
    let leaflets = '';
    for (let k = 1; k <= 9; k++) { const t = k / 10, bx = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * mx + t * t * ex, by = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * my + t * t * ey, ll = L2 * .22 * Math.sin(t * Math.PI) + L2 * .04;
      const tang = Math.atan2(ey - ty, ex - tx); for (const sgn of [-1, 1]) { const na = tang + sgn * 1.15 + .35; leaflets += `M${f(bx)} ${f(by)} q${f(Math.cos(na) * ll * .5)} ${f(Math.sin(na) * ll * .5 - ll * .1)} ${f(Math.cos(na) * ll)} ${f(Math.sin(na) * ll + ll * .35)} `; } }
    s += `<path d="${leaflets}" fill="none" stroke="${oc}" stroke-width="${f(h * .022 + lw * 2)}" stroke-linecap="round"/><path d="${leaflets}" fill="none" stroke="${c}" stroke-width="${f(h * .022)}" stroke-linecap="round"/>`;
    s += `<path d="${rib}" fill="none" stroke="${oc}" stroke-width="${f(h * .016 + lw * 2)}" stroke-linecap="round"/><path d="${rib}" fill="none" stroke="${dk(c, .2)}" stroke-width="${f(h * .016)}" stroke-linecap="round"/>`;
  }
  s += [[-.04, .02], [.03, .04], [0, .065]].map(([dx, dy]) => `<circle cx="${f(tx + dx * h)}" cy="${f(ty + dy * h)}" r="${f(h * .032)}" fill="${mix('#7a5228', HAZE, hz)}" stroke="${oc}" stroke-width="${f(lw)}"/>`).join('');
  return s;
}

export function cactus(x, y, m, o = {}) {
  const hz = hazeAt(y), h = (o.h || 1.8) * m, oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(6, h * .02)), c = mix('#5aa84e', HAZE, hz), cd = mix('#3a7a3e', HAZE, hz), w = h * .2;
  let s = shadowEll(x - LX * h * .2, y, h * .3, h * .06, .25);
  const limb = (d) => `<path d="${d}" fill="none" stroke="${oc}" stroke-width="${f(w * .7 + lw * 2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${f(w * .7)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += limb(`M${f(x)} ${f(y - h * .45)} H${f(x - w * 1.1)} V${f(y - h * .75)}`);
  s += limb(`M${f(x)} ${f(y - h * .6)} H${f(x + w * 1.05)} V${f(y - h * .88)}`);
  const body = `M${f(x - w / 2)} ${f(y)} V${f(y - h + w / 2)} A${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(x + w / 2)} ${f(y - h + w / 2)} V${f(y)} Z`;
  s += `<path d="${body}" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += `<path clip-path="${clip(`<path d="${body}"/>`)}" d="M${f(x - LX * w * .12)} ${f(y - h)} H${f(x - LX * w)} V${f(y)} H${f(x - LX * w * .12)} Z" fill="${cd}"/>`;
  s += [-.22, .02, .25].map(t => `<path d="M${f(x + t * w)} ${f(y - h * .95)} V${f(y - 4)}" stroke="${dk(c, .35)}" stroke-width="${f(lw * .6)}"/>`).join('');
  if (o.flower) s += `<circle cx="${f(x)}" cy="${f(y - h)}" r="${f(w * .28)}" fill="${o.flower}" stroke="${oc}" stroke-width="${f(lw * .8)}"/>`;
  return s;
}

export function crystal(x, y, m, col, o = {}) {
  const hz = o.hz ?? hazeAt(y) * .6, h = (o.h || 1.2) * m, oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, h * .02)), c = mix(col, HAZE, hz);
  let s = '';
  if (o.glow !== false) s += `<ellipse cx="${f(x)}" cy="${f(y - h * .4)}" rx="${f(h * .9)}" ry="${f(h * .8)}" fill="${rg([[0, col, .45], [1, col, 0]])}"/>`;
  s += shadowEll(x, y, h * .45, h * .08, .25);
  const shard = (bx, w, hh, lean) => { const top = [bx + lean, y - hh], P = [[bx - w / 2, y], [bx - w * .55, y - hh * .62], top, [bx + w * .55, y - hh * .6], [bx + w / 2, y]];
    const d = 'M' + pts(P).replace(/ /g, ' L') + ' Z';
    return `<path d="${d}" fill="${c}"/><path d="M${f(top[0])} ${f(top[1])} L${f(bx + w * .55)} ${f(y - hh * .6)} L${f(bx + w / 2)} ${f(y)} L${f(bx + w * .05)} ${f(y)} Z" fill="${dk(c, .28)}"/><path d="M${f(top[0])} ${f(top[1])} L${f(bx - w * .55)} ${f(y - hh * .62)} L${f(bx - w * .25)} ${f(y - hh * .55)} Z" fill="${lt(c, .45)}"/><path d="${d}" fill="none" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`; };
  s += shard(x - h * .22, h * .22, h * .6, -h * .08) + shard(x + h * .2, h * .2, h * .5, h * .07) + shard(x, h * .3, h, 0);
  s += `<path d="M${f(x - h * .05)} ${f(y - h * .8)} l${f(h * .03)} ${f(-h * .1)}" stroke="#fff" stroke-width="${f(lw)}" stroke-linecap="round" opacity=".8"/>`;
  return s;
}

/* ---------- céu e distância ---------- */
export function sky(stops) { return `<rect width="${W}" height="${H}" fill="${lg(stops)}"/>`; }
export function glow(x, y, r, c, a = .6) { return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${rg([[0, c, a], [.4, c, a * .45], [1, c, 0]])}"/>`; }
export function sun(x, y, r, c, o = {}) {
  let s = glow(x, y, r * 4, o.glow || c, .5);
  s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" stroke="${o.oc || mix(O, c, .4)}" stroke-width="${o.lw ?? 4}"/>`;
  s += `<circle cx="${f(x - r * .3)}" cy="${f(y - r * .3)}" r="${f(r * .35)}" fill="#fff" opacity=".5"/>`;
  if (o.craters) s += [[.3, .2, .18], [-.25, .35, .12], [.1, -.4, .1]].map(([dx, dy, rr2]) => `<circle cx="${f(x + dx * r)}" cy="${f(y + dy * r)}" r="${f(rr2 * r)}" fill="${dk(c, .12)}"/>`).join('');
  return s;
}
export function cloud(x, y, w, o = {}) {
  const c = o.c || '#ffffff', n = o.n || 6, cs = [];
  const k = o.k ?? 1; for (let i = 0; i < n; i++) { const t = i / (n - 1); const r = w * k * (.13 + Math.sin(t * Math.PI) * .12) * rr(.85, 1.15); cs.push([x - w / 2 + t * w, y - r * .55, r]); }
  cs.push([x - w * .1, y - w * .28 * k, w * .2 * k]); cs.push([x + w * .15, y - w * .24 * k, w * .17 * k]);
  return cluster(cs, c, { lw: o.lw ?? Math.max(1.5, w * .018), oc: o.oc || mix(O, o.shade || '#9fb8d8', .55), dark: o.shade || mix(c, '#8aa0d0', .3), hi: '#ffffff', flat: y, hiN: 2, volA: .35 });
}
export function mountains(base, peaks, col, o = {}) {
  const hz = o.hz ?? .45, c = mix(col, HAZE, hz), oc = o.oc === null ? null : mix(O, HAZE, Math.min(1, hz + .2)), lw = o.lw ?? 2.5;
  let s = '';
  for (const [x, h, w] of peaks) {
    const ax = x, ay = base - h, L = [[x - w, base + 4]], Rg = [];
    const jl = 4; for (let i = 1; i < jl; i++) { const t = i / jl; L.push([x - w + w * t + rr(-w * .05, w * .05), base - h * t * rr(.85, 1.05)]); }
    L.push([ax, ay]); for (let i = jl - 1; i > 0; i--) { const t = i / jl; Rg.push([x + w - w * t + rr(-w * .05, w * .05), base - h * t * rr(.85, 1.05)]); }
    Rg.push([x + w, base + 4]);
    const all = L.concat(Rg); const d = 'M' + pts(all).replace(/ /g, ' L') + ' Z';
    s += `<path d="${d}" fill="${c}"${oc ? ` stroke="${oc}" stroke-width="${lw}" stroke-linejoin="round"` : ''}/>`;
    // face sombreada com aresta irregular
    const ridge = [[ax, ay]]; for (let i = 1; i <= 4; i++) { const t = i / 4; ridge.push([ax - LX * w * .08 * Math.sin(t * 3) + rr(-w * .04, w * .04) - LX * w * .12 * t, ay + h * t]); }
    const sideX = x - LX * (w + 10);
    const sd = 'M' + pts(ridge.concat([[sideX, base + 4], [sideX, ay - 5]])).replace(/ /g, ' L') + ' Z';
    s += `<path clip-path="${clip(`<path d="${d}"/>`)}" d="${sd}" fill="${dk(c, o.shade ?? .22)}"/>`;
    if (o.snow) {
      const sh = h * (o.snowH || .32), sy = ay + sh; const sn = [[ax, ay]];
      const zig = 6; for (let i = 0; i <= zig; i++) { const t = i / zig; sn.push([ax + LX * (t - .5) * -2 * w * sh / h * 1.0, sy + (i % 2 ? -sh * .25 : sh * .05)]); }
      const snd = 'M' + pts(sn).replace(/ /g, ' L') + ' Z';
      s += `<path clip-path="${clip(`<path d="${d}"/>`)}" d="${snd}" fill="${mix(o.snow, HAZE, hz * .4)}"/>`;
      s += `<path clip-path="${clip(`<path d="${d}"/><path d="${snd}" />`)}" d="${sd}" fill="${mix('#9fb6e0', HAZE, hz * .3)}" opacity=".55"/>`;
      if (oc) s += `<path d="${d}" fill="none" stroke="${oc}" stroke-width="${lw}" stroke-linejoin="round"/>`;
    }
  }
  return s;
}
// faixa de morro (borda superior ondulada) com gradiente; retorna também a função de altura
export function ridge(yb, amp, k, ph, col, o = {}) {
  const hz = o.hz ?? .3, c = mix(col, HAZE, hz), oc = mix(O, HAZE, Math.min(1, hz + .15)), lw = o.lw ?? 3;
  const Y = x => yb - amp * (.55 * Math.sin(Math.PI * 2 * k * x / W + ph) + .3 * Math.sin(Math.PI * 2 * (k * 2.3) * x / W + ph * 1.7) + .15 * Math.sin(Math.PI * 2 * (k * 5.1) * x / W + ph * .3));
  let d = `M-10 ${H} L-10 ${f(Y(-10))} `; for (let x = 0; x <= W + 10; x += 8) d += `L${x} ${f(Y(x))} `; d += `L${W + 10} ${H} Z`;
  const fill = lg([[0, lt(c, o.top ?? .08)], [1, dk(c, o.bot ?? .12)]], 0, yb - amp, 0, o.fadeTo ?? (yb + 160), true);
  let s = `<path d="${d}" fill="${fill}"${lw ? ` stroke="${oc}" stroke-width="${lw}" stroke-linejoin="round"` : ''}/>`;
  return { s, Y, d, c };
}

/* ---------- chão ---------- */
export function groundBase(cFar, cNear, o = {}) {
  let s = `<rect x="0" y="${f(HZ - 2)}" width="${W}" height="${f(H - HZ + 2)}" fill="${lg([[0, mix(cFar, HAZE, .35)], [.12, cFar], [1, cNear]], 0, HZ, 0, H, true)}"/>`;
  return s;
}
// manchas em perspectiva
export function patches(n, cols, o = {}) {
  let s = '';
  for (let i = 0; i < n; i++) { const t = Math.pow(R(), o.pow ?? .8); const y = HZ + 8 + (H - HZ) * t; const m = sc(y); const x = rr(-60, W + 60); const rx = m * rr(o.min ?? .8, o.max ?? 2.4); s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * (.18 + .14 * sr(y)))}" fill="${mix(pick(cols), HAZE, hazeAt(y))}" opacity="${o.a ?? .55}"/>`; }
  return s;
}
export function texture(a = .1, freq = .9, color) {
  const id = uid('tx');
  def(`<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${ri(1, 99)}"/><feColorMatrix values="0 0 0 0 ${color ? 0 : 0}  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25"/></filter>`);
  return `<rect x="0" y="${f(HZ)}" width="${W}" height="${f(H - HZ)}" filter="url(#${id})" opacity="${a}" style="mix-blend-mode:multiply"/>`;
}
// estrada/caminho que some no horizonte
export function road(o) {
  const w0 = o.w || 2.6, amp = o.amp ?? .9, ph = o.ph ?? 0, cx = o.cx ?? W / 2, vx = o.vx ?? 0;
  const C = y => { const u = 1 / Math.max(.02, sr(y)); return vx * (1 - sr(y)) / Math.max(.02, sc(y)) * 0 + amp * Math.sin(Math.min(u, 30) * .55 + ph); };
  const L = [], Rr2 = [];
  for (let y = HZ + 1.5; y <= H + 30; y += (y < HZ + 40 ? 1.5 : 6)) { const m = sc(y); const xc = cx + vx * (1 - sr(y)) + C(y) * m; L.push([xc - w0 / 2 * m, y]); Rr2.push([xc + w0 / 2 * m, y]); }
  const poly = L.concat(Rr2.slice().reverse());
  const d = 'M' + pts(poly).replace(/ /g, ' L') + ' Z';
  const center = y => cx + vx * (1 - sr(y)) + C(y) * sc(y);
  let s = `<path d="${d}" fill="${lg([[0, mix(o.c, HAZE, .45)], [.15, o.c], [1, o.cNear || o.c]], 0, HZ, 0, H, true)}"/>`;
  // bordas
  const edge = (side) => { const E = side < 0 ? L : Rr2; const inner = E.map(([x, y]) => [x - side * Math.max(.6, sc(y) * .14), y]); return 'M' + pts(E.concat(inner.reverse())).replace(/ /g, ' L') + ' Z'; };
  s += `<path d="${edge(-1)}" fill="${o.edge || dk(o.c, .2)}" opacity=".85"/><path d="${edge(1)}" fill="${o.edge || dk(o.c, .2)}" opacity=".85"/>`;
  // sulcos
  if (o.ruts !== false) for (const k of [-.22, .22]) { let rd = ''; for (let y = HZ + 6; y <= H + 30; y += 6) { const m = sc(y); rd += (rd ? 'L' : 'M') + f(center(y) + k * w0 * m) + ' ' + f(y) + ' '; } s += `<path d="${rd}" fill="none" stroke="${dk(o.c, .14)}" stroke-width="5" opacity=".5"/>`; }
  return { s, d, center, half: y => w0 / 2 * sc(y), L, R: Rr2 };
}
export function fence(points, o = {}) { // points: [[x,y],...] do fundo para frente
  const col = o.c || '#a8743c'; let s = '';
  const P = points.slice().sort((a, b) => a[1] - b[1]);
  for (let i = 0; i < P.length; i++) {
    const [x, y] = P[i], m = sc(y), hz = hazeAt(y), c = mix(col, HAZE, hz), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, m * .02));
    const ph = m * (o.h || 1.05), pw = m * .12;
    if (i < P.length - 1) { const [x2, y2] = P[i + 1], m2 = sc(y2), ph2 = m2 * (o.h || 1.05);
      for (const k of [.35, .75]) { const d = `M${f(x)} ${f(y - ph * k)} L${f(x2)} ${f(y2 - ph2 * k)} L${f(x2)} ${f(y2 - ph2 * k + m2 * .1)} L${f(x)} ${f(y - ph * k + m * .1)} Z`; s += `<path d="${d}" fill="${mix(lt(col, .1), HAZE, hz)}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`; } }
    s += shadowEll(x - LX * pw, y, pw * 1.2, pw * .35, .22);
    s += `<path d="M${f(x - pw / 2)} ${f(y)} V${f(y - ph + pw * .3)} L${f(x)} ${f(y - ph)} L${f(x + pw / 2)} ${f(y - ph + pw * .3)} V${f(y)} Z" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/><rect x="${f(LX < 0 ? x : x - pw / 2)}" y="${f(y - ph + pw * .35)}" width="${f(pw / 2)}" height="${f(ph - pw * .35)}" fill="${dk(c, .25)}" opacity=".7"/>`;
  }
  return s;
}
// gramas/flores espalhadas em perspectiva, evitando uma função de exclusão
export function scatter(n, fn, o = {}) {
  let s = ''; const items = [];
  for (let i = 0; i < n; i++) { const t = Math.pow(R(), o.pow ?? .75); const y = (o.y0 ?? HZ + 6) + ((o.y1 ?? H + 20) - (o.y0 ?? HZ + 6)) * t; const x = rr(o.x0 ?? -20, o.x1 ?? W + 20); if (o.skip && o.skip(x, y)) continue; items.push([x, y]); }
  items.sort((a, b) => a[1] - b[1]);
  for (const [x, y] of items) { const m = sc(y); if (m < (o.minM ?? 3)) continue; s += fn(x, y, m); }
  return s;
}
export function vignette(a = .35, c = '#1a0e06') { return `<rect width="${W}" height="${H}" fill="${rg([[.55, c, 0], [1, c, a]], .5, .55, .75)}"/>`; }
export function rays(x, y, n, len, col, a = .18, spread = 1.2) {
  let s = ''; for (let i = 0; i < n; i++) { const ang = Math.PI / 2 + (i / (n - 1) - .5) * spread + rr(-.05, .05) - LX * .35; const w = rr(.03, .07); const p1 = [x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len], p2 = [x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len];
    s += `<path d="M${f(x)} ${f(y)} L${f(p1[0])} ${f(p1[1])} L${f(p2[0])} ${f(p2[1])} Z" fill="${lg([[0, col, a], [1, col, 0]], 0, 0, 0, 1)}" style="mix-blend-mode:screen"/>`; }
  return s;
}
export function svgDoc(body) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${DEFS.join('')}</defs>${body}</svg>`; }
