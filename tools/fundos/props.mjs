// Objetos de cenário maiores (construções, marcos) e detalhes específicos de bioma.
import { O, HAZE, LX, W, H, HZ, f, mix, dk, lt, rr, ri, R, pick, sc, sr, yAt, hazeAt, clip, lg, rg, shadowEll, cluster, uid, def } from './lib.mjs';

const P = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
const poly = (a, fill, oc, lw, extra = '') => `<polygon points="${P(a)}" fill="${fill}"${oc ? ` stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"` : ''}${extra}/>`;

// castelo distante (s = altura total em px)
export function castle(x, y, s, o = {}) {
  const hz = o.hz ?? .35, wall = mix(o.wall || '#e8dcc8', HAZE, hz), wallD = mix(dk(o.wall || '#e8dcc8', .22), HAZE, hz), roof = mix(o.roof || '#d8504a', HAZE, hz), roofD = mix(dk(o.roof || '#d8504a', .25), HAZE, hz), oc = mix(O, HAZE, hz + .1), lw = Math.max(1, s * .018), win = mix('#3a2a40', HAZE, hz);
  let out = '';
  const tower = (tx, tw, th, rh) => { const by = y, ty = y - th;
    let t = `<rect x="${f(tx - tw / 2)}" y="${f(ty)}" width="${f(tw)}" height="${f(th)}" fill="${wall}" stroke="${oc}" stroke-width="${f(lw)}"/><rect x="${f(LX < 0 ? tx : tx - tw / 2)}" y="${f(ty)}" width="${f(tw / 2)}" height="${f(th)}" fill="${wallD}" opacity=".6"/>`;
    t += `<polygon points="${P([[tx - tw * .62, ty], [tx, ty - rh], [tx + tw * .62, ty]])}" fill="${roof}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/><polygon points="${P([[tx, ty - rh], [tx - LX * tw * .62, ty], [tx, ty]])}" fill="${roofD}"/>`;
    t += `<rect x="${f(tx - tw * .12)}" y="${f(ty + th * .25)}" width="${f(tw * .24)}" height="${f(th * .18)}" rx="${f(tw * .12)}" fill="${win}"/>`;
    t += `<path d="M${f(tx)} ${f(ty - rh)} v${f(-rh * .45)}" stroke="${oc}" stroke-width="${f(lw)}"/><path d="M${f(tx)} ${f(ty - rh * 1.45)} l${f(rh * .35)} ${f(rh * .1)} l${f(-rh * .35)} ${f(rh * .1)} z" fill="${mix(o.flag || '#ffd23a', HAZE, hz)}"/>`;
    return t; };
  // muralha
  const ww = s * 1.3, wh = s * .38;
  out += `<rect x="${f(x - ww / 2)}" y="${f(y - wh)}" width="${f(ww)}" height="${f(wh)}" fill="${wall}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  for (let i = 0; i < 9; i++) out += `<rect x="${f(x - ww / 2 + i * ww / 8.5)}" y="${f(y - wh - s * .06)}" width="${f(ww / 17)}" height="${f(s * .06)}" fill="${wall}" stroke="${oc}" stroke-width="${f(lw * .8)}"/>`;
  out += `<path d="M${f(x - s * .1)} ${f(y)} v${f(-wh * .55)} a${f(s * .1)} ${f(s * .1)} 0 0 1 ${f(s * .2)} 0 v${f(wh * .55)} z" fill="${win}"/>`;
  out += tower(x - ww / 2, s * .26, s * .62, s * .26) + tower(x + ww / 2, s * .26, s * .62, s * .26) + tower(x - s * .22, s * .3, s * .82, s * .3) + tower(x + s * .2, s * .24, s * .7, s * .26);
  return out;
}

export function windmill(x, y, s, o = {}) {
  const hz = o.hz ?? .35, wall = mix('#f2e6d0', HAZE, hz), oc = mix(O, HAZE, hz + .1), lw = Math.max(1, s * .02), roof = mix('#c0583c', HAZE, hz), blade = mix('#fff8ea', HAZE, hz);
  let out = poly([[x - s * .18, y], [x - s * .12, y - s * .62], [x + s * .12, y - s * .62], [x + s * .18, y]], wall, oc, lw);
  out += poly([[x, y - s * .62], [x + LX * s * .12, y - s * .62], [x + LX * s * .18, y], [x, y]], dk(wall, .15), null, 0, ' opacity=".7"');
  out += poly([[x - s * .16, y - s * .6], [x, y - s * .82], [x + s * .16, y - s * .6]], roof, oc, lw);
  const hx = x, hy = y - s * .66, ang = o.ang ?? 20;
  for (let i = 0; i < 4; i++) { const a = (ang + i * 90) * Math.PI / 180, ex = hx + Math.cos(a) * s * .5, ey = hy + Math.sin(a) * s * .5, nx = -Math.sin(a) * s * .07, ny = Math.cos(a) * s * .07;
    out += `<path d="M${f(hx)} ${f(hy)} L${f(ex)} ${f(ey)}" stroke="${oc}" stroke-width="${f(lw * 1.5)}"/>` + poly([[hx + Math.cos(a) * s * .12, hy + Math.sin(a) * s * .12], [ex, ey], [ex + nx, ey + ny], [hx + Math.cos(a) * s * .12 + nx, hy + Math.sin(a) * s * .12 + ny]], blade, oc, lw * .8); }
  out += `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(s * .04)}" fill="${oc}"/>`;
  return out;
}

export function signpost(x, y, m, o = {}) {
  const hz = hazeAt(y), wood = mix('#b07a42', HAZE, hz), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, m * .02)), h = m * 1.5;
  let s = shadowEll(x - LX * m * .2, y, m * .3, m * .07, .25);
  s += `<rect x="${f(x - m * .05)}" y="${f(y - h)}" width="${f(m * .1)}" height="${f(h)}" fill="${wood}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += poly([[x - m * .4, y - h * .9], [x + m * .35, y - h * .9], [x + m * .5, y - h * .8], [x + m * .35, y - h * .7], [x - m * .4, y - h * .7]], lt(wood, .1), oc, lw);
  s += poly([[x + m * .4, y - h * .62], [x - m * .3, y - h * .62], [x - m * .45, y - h * .52], [x - m * .3, y - h * .42], [x + m * .4, y - h * .42]], wood, oc, lw);
  s += `<path d="M${f(x - m * .3)} ${f(y - h * .8)} h${f(m * .5)} M${f(x - m * .2)} ${f(y - h * .52)} h${f(m * .45)}" stroke="${dk(wood, .35)}" stroke-width="${f(lw * .8)}" stroke-linecap="round"/>`;
  return s;
}

export function lantern(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, m * .02)), h = m * 1.8, metal = mix(o.metal || '#4a3a30', HAZE, hz), light = o.light || '#ffd76a';
  let s = `<circle cx="${f(x)}" cy="${f(y - h * .88)}" r="${f(m * .9)}" fill="${rg([[0, light, .6], [1, light, 0]])}"/>`;
  s += shadowEll(x, y, m * .25, m * .06, .3);
  s += `<rect x="${f(x - m * .04)}" y="${f(y - h * .8)}" width="${f(m * .08)}" height="${f(h * .8)}" fill="${metal}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += `<rect x="${f(x - m * .14)}" y="${f(y - h * .98)}" width="${f(m * .28)}" height="${f(h * .18)}" rx="${f(m * .04)}" fill="${light}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += poly([[x - m * .19, y - h * .98], [x, y - h * 1.08], [x + m * .19, y - h * .98]], metal, oc, lw);
  return s;
}

export function stump(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, m * .025)), bark = mix('#8a5a32', HAZE, hz), ring = mix('#e2bf86', HAZE, hz), w = m * .55, h = m * .4;
  let s = shadowEll(x - LX * w * .3, y, w * .8, w * .18, .25);
  s += `<path d="M${f(x - w / 2)} ${f(y - h)} V${f(y - h * .1)} Q${f(x - w * .65)} ${f(y)} ${f(x - w * .7)} ${f(y + 2)} H${f(x + w * .7)} Q${f(x + w * .65)} ${f(y)} ${f(x + w / 2)} ${f(y - h * .1)} V${f(y - h)} Z" fill="${bark}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  s += `<rect x="${f(LX < 0 ? x : x - w / 2)}" y="${f(y - h)}" width="${f(w / 2)}" height="${f(h)}" fill="${dk(bark, .3)}" opacity=".5"/>`;
  s += `<ellipse cx="${f(x)}" cy="${f(y - h)}" rx="${f(w / 2)}" ry="${f(w * .18)}" fill="${ring}" stroke="${oc}" stroke-width="${f(lw)}"/><ellipse cx="${f(x)}" cy="${f(y - h)}" rx="${f(w * .25)}" ry="${f(w * .08)}" fill="none" stroke="${dk(ring, .25)}" stroke-width="${f(lw * .6)}"/>`;
  return s;
}

export function log(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, m * .025)), bark = mix('#7e5230', HAZE, hz), ring = mix('#e0bc84', HAZE, hz), L = m * (o.l || 1.6), r = m * .22;
  let s = shadowEll(x, y, L * .6, r * .5, .25);
  s += `<rect x="${f(x - L / 2)}" y="${f(y - r * 2)}" width="${f(L)}" height="${f(r * 2)}" rx="${f(r * .4)}" fill="${bark}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += `<rect x="${f(x - L / 2)}" y="${f(y - r * .8)}" width="${f(L)}" height="${f(r * .8)}" fill="${dk(bark, .3)}" opacity=".6"/>`;
  s += `<path d="M${f(x - L * .3)} ${f(y - r * 1.4)} h${f(L * .25)} M${f(x + L * .05)} ${f(y - r * 1.1)} h${f(L * .2)}" stroke="${dk(bark, .4)}" stroke-width="${f(lw * .7)}" stroke-linecap="round"/>`;
  const ex = x + (o.dir || 1) * L / 2;
  s += `<ellipse cx="${f(ex)}" cy="${f(y - r)}" rx="${f(r * .55)}" ry="${f(r)}" fill="${ring}" stroke="${oc}" stroke-width="${f(lw)}"/><ellipse cx="${f(ex)}" cy="${f(y - r)}" rx="${f(r * .25)}" ry="${f(r * .5)}" fill="none" stroke="${dk(ring, .25)}" stroke-width="${f(lw * .6)}"/>`;
  if (o.moss) s += `<path d="M${f(x - L * .45)} ${f(y - r * 1.9)} q${f(L * .2)} ${f(-r * .5)} ${f(L * .45)} 0" fill="none" stroke="${mix('#6ab04a', HAZE, hz)}" stroke-width="${f(r * .4)}" stroke-linecap="round"/>`;
  return s;
}

export function lilypad(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), lw = Math.max(.8, Math.min(4, m * .02)), c = mix(o.c || '#5cb44a', HAZE, hz), rx = m * (o.r || .4), ry = rx * (.22 + .18 * sr(y));
  let s = `<path d="M${f(x)} ${f(y)} L${f(x + rx * .9)} ${f(y - ry * .45)} A${f(rx)} ${f(ry)} 0 1 1 ${f(x + rx * .95)} ${f(y + ry * .1)} Z" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  s += `<path d="M${f(x)} ${f(y)} l${f(-rx * .6)} ${f(-ry * .3)} M${f(x)} ${f(y)} l${f(-rx * .3)} ${f(ry * .6)}" stroke="${dk(c, .25)}" stroke-width="${f(lw * .7)}"/>`;
  if (o.flower) s += `<g transform="translate(${f(x - rx * .3)} ${f(y - ry * .2)})">${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `<ellipse cx="${f(Math.cos(a) * rx * .12)}" cy="${f(Math.sin(a) * rx * .05 - rx * .06)}" rx="${f(rx * .1)}" ry="${f(rx * .07)}" fill="${mix(o.flower, HAZE, hz)}" stroke="${oc}" stroke-width="${f(lw * .6)}"/>`; }).join('')}<circle cx="0" cy="${f(-rx * .07)}" r="${f(rx * .05)}" fill="#ffd23a"/></g>`;
  return s;
}

export function waterLines(y0, y1, n, col, o = {}) {
  let s = '';
  for (let i = 0; i < n; i++) { const t = Math.pow(R(), .8); const y = y0 + (y1 - y0) * t; const m = sc(y); const x = rr(-20, W + 20); const w = m * rr(.3, .8); s += `<path d="M${f(x - w)} ${f(y)} q${f(w / 2)} ${f(-m * .05)} ${f(w)} 0 t${f(w)} 0" fill="none" stroke="${col}" stroke-width="${f(Math.max(1, m * .03))}" stroke-linecap="round" opacity="${o.a ?? .75}"/>`; }
  return s;
}

// árvore retorcida (pântano/abismo)
export function deadTree(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), bark = mix(o.c || '#4a3a4a', HAZE, hz), h = m * (o.h || 3.6), lw = Math.max(1, Math.min(6, h * .012));
  let s = shadowEll(x - LX * h * .12, y, h * .25, h * .05, .25);
  const tw = h * .07;
  const trunk = `M${f(x - tw * 1.8)} ${f(y)} Q${f(x - tw)} ${f(y - h * .3)} ${f(x - tw * .2)} ${f(y - h * .55)} Q${f(x + tw * .5)} ${f(y - h * .7)} ${f(x - tw * .2)} ${f(y - h * .9)} L${f(x + tw * .5)} ${f(y - h * .88)} Q${f(x + tw * 1.4)} ${f(y - h * .6)} ${f(x + tw * .8)} ${f(y - h * .35)} Q${f(x + tw)} ${f(y - h * .1)} ${f(x + tw * 1.9)} ${f(y)} Z`;
  s += `<path d="${trunk}" fill="${bark}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  const br = (x0, y0, dx, dy, w) => `<path d="M${f(x0)} ${f(y0)} q${f(dx * .5)} ${f(dy * .2)} ${f(dx)} ${f(dy)}" fill="none" stroke="${oc}" stroke-width="${f(w + lw * 2)}" stroke-linecap="round"/><path d="M${f(x0)} ${f(y0)} q${f(dx * .5)} ${f(dy * .2)} ${f(dx)} ${f(dy)}" fill="none" stroke="${bark}" stroke-width="${f(w)}" stroke-linecap="round"/>`;
  s += br(x, y - h * .55, -h * .32, -h * .18, tw * .7) + br(x + tw * .3, y - h * .65, h * .3, -h * .22, tw * .6) + br(x - h * .2, y - h * .66, -h * .12, -h * .14, tw * .35) + br(x + h * .2, y - h * .8, h * .12, -h * .1, tw * .3);
  if (o.moss) for (const [dx, dy, l] of [[-.3, -.7, .22], [.28, -.84, .18], [-.05, -.85, .15]]) { const mx = x + dx * h, my = y + dy * h; s += `<path d="M${f(mx)} ${f(my)} q${f(h * .02)} ${f(h * l * .5)} ${f(-h * .01)} ${f(h * l)}" fill="none" stroke="${mix(o.moss, HAZE, hz)}" stroke-width="${f(tw * .45)}" stroke-linecap="round"/>`; }
  return s;
}

export function column(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), c = mix(o.c || '#e8d2a8', HAZE, hz), lw = Math.max(1, Math.min(5, m * .025)), h = m * (o.h || 2.2), w = m * .42, broken = o.broken;
  let s = shadowEll(x - LX * w * .6, y, w * 1.1, w * .2, .25);
  s += `<rect x="${f(x - w * .7)}" y="${f(y - m * .2)}" width="${f(w * 1.4)}" height="${f(m * .2)}" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  const top = y - h;
  const body = broken ? `M${f(x - w / 2)} ${f(y - m * .2)} V${f(top + h * .1)} L${f(x - w * .1)} ${f(top)} L${f(x + w * .15)} ${f(top + h * .08)} L${f(x + w / 2)} ${f(top + h * .02)} V${f(y - m * .2)} Z` : `M${f(x - w / 2)} ${f(y - m * .2)} V${f(top + m * .2)} H${f(x + w / 2)} V${f(y - m * .2)} Z`;
  s += `<path d="${body}" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  s += `<path clip-path="${clip(`<path d="${body}"/>`)}" d="M${f(x - LX * w * .1)} ${f(top - 5)} H${f(x - LX * w)} V${f(y)} H${f(x - LX * w * .1)} Z" fill="${dk(c, .25)}"/>`;
  s += [-.25, 0, .25].map(t => `<path d="M${f(x + t * w)} ${f(top + h * .12)} V${f(y - m * .25)}" stroke="${dk(c, .3)}" stroke-width="${f(lw * .6)}"/>`).join('');
  if (!broken) s += `<rect x="${f(x - w * .75)}" y="${f(top)}" width="${f(w * 1.5)}" height="${f(m * .2)}" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  if (o.vine) s += `<path d="M${f(x - w * .4)} ${f(top + h * .15)} q${f(w * .7)} ${f(h * .15)} ${f(w * .1)} ${f(h * .35)} t${f(w * .2)} ${f(h * .3)}" fill="none" stroke="${mix('#4f9a3e', HAZE, hz)}" stroke-width="${f(lw * 1.4)}" stroke-linecap="round"/>`;
  return s;
}

export function bones(x, y, m) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), c = mix('#f2ead8', HAZE, hz), lw = Math.max(1, Math.min(4, m * .02));
  let s = shadowEll(x, y, m * .5, m * .08, .22);
  s += `<path d="M${f(x - m * .55)} ${f(y - m * .08)} q${f(m * .1)} ${f(-m * .35)} ${f(m * .45)} ${f(-m * .42)} q${f(m * .4)} ${f(-m * .05)} ${f(m * .55)} ${f(m * .25)}" fill="none" stroke="${oc}" stroke-width="${f(m * .12 + lw * 2)}" stroke-linecap="round"/><path d="M${f(x - m * .55)} ${f(y - m * .08)} q${f(m * .1)} ${f(-m * .35)} ${f(m * .45)} ${f(-m * .42)} q${f(m * .4)} ${f(-m * .05)} ${f(m * .55)} ${f(m * .25)}" fill="none" stroke="${c}" stroke-width="${f(m * .12)}" stroke-linecap="round"/>`;
  for (let i = 0; i < 4; i++) { const t = .2 + i * .17, bx = x - m * .5 + t * m, by = y - m * .3 - Math.sin(t * Math.PI) * m * .12; s += `<path d="M${f(bx)} ${f(by)} q${f(m * .08)} ${f(m * .15)} ${f(m * .02)} ${f(m * .3)}" fill="none" stroke="${oc}" stroke-width="${f(m * .05 + lw * 2)}" stroke-linecap="round"/><path d="M${f(bx)} ${f(by)} q${f(m * .08)} ${f(m * .15)} ${f(m * .02)} ${f(m * .3)}" fill="none" stroke="${c}" stroke-width="${f(m * .05)}" stroke-linecap="round"/>`; }
  return s;
}

export function coral(x, y, m, col, o = {}) {
  const hz = hazeAt(y) * .7, oc = mix(O, HAZE, hz * .85), c = mix(col, HAZE, hz), lw = Math.max(1, Math.min(5, m * .025)), h = m * (o.h || 1);
  let s = shadowEll(x, y, h * .5, h * .08, .2);
  const type = o.type || 'branch';
  if (type === 'branch') {
    const br = (x0, y0, a, len, w, d) => { if (d > 3 || len < 3) return ''; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; let r = `<path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}" stroke="${oc}" stroke-width="${f(w + lw * 2)}" stroke-linecap="round"/><path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round"/>`; r += br(x1, y1, a - rr(.3, .6), len * .7, w * .75, d + 1) + br(x1, y1, a + rr(.3, .6), len * .7, w * .75, d + 1); return r; };
    s += br(x, y, -Math.PI / 2, h * .38, h * .12, 0);
  } else if (type === 'brain') {
    s += cluster([[x, y - h * .3, h * .35], [x - h * .25, y - h * .2, h * .25], [x + h * .25, y - h * .18, h * .25]], c, { lw, flat: y, hiN: 1 });
    for (let i = 0; i < 4; i++) s += `<path d="M${f(x - h * .4 + i * h * .2)} ${f(y - h * .1)} q${f(h * .05)} ${f(-h * .3)} ${f(h * .12)} ${f(-h * .45)}" fill="none" stroke="${dk(c, .3)}" stroke-width="${f(lw * .8)}" stroke-linecap="round"/>`;
  } else if (type === 'fan') {
    const d = `M${f(x)} ${f(y)} L${f(x - h * .5)} ${f(y - h * .6)} Q${f(x)} ${f(y - h * 1.2)} ${f(x + h * .5)} ${f(y - h * .6)} Z`;
    s += `<path d="${d}" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
    for (let i = -3; i <= 3; i++) s += `<path d="M${f(x)} ${f(y)} L${f(x + i * h * .13)} ${f(y - h * .8 + Math.abs(i) * h * .06)}" stroke="${dk(c, .28)}" stroke-width="${f(lw * .7)}"/>`;
    s += `<path d="M${f(x - h * .35)} ${f(y - h * .5)} Q${f(x)} ${f(y - h * .85)} ${f(x + h * .35)} ${f(y - h * .5)}" fill="none" stroke="${dk(c, .28)}" stroke-width="${f(lw * .7)}"/>`;
  }
  return s;
}

export function seaweed(x, y, m, o = {}) {
  const hz = hazeAt(y) * .7, oc = mix(O, HAZE, hz * .85), c = mix(o.c || '#3fae6a', HAZE, hz), lw = Math.max(1, Math.min(4, m * .02)), h = m * (o.h || 1.6), n = o.n || 3;
  let s = '';
  for (let i = 0; i < n; i++) { const dx = (i - (n - 1) / 2) * h * .12, hh = h * rr(.7, 1); let d = `M${f(x + dx)} ${f(y)}`; for (let k = 1; k <= 4; k++) d += ` Q${f(x + dx + (k % 2 ? 1 : -1) * h * .12)} ${f(y - hh * (k - .5) / 4)} ${f(x + dx)} ${f(y - hh * k / 4)}`;
    s += `<path d="${d}" fill="none" stroke="${oc}" stroke-width="${f(h * .07 + lw * 2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${f(h * .07)}" stroke-linecap="round"/>`; }
  return s;
}

export function bubbles(n, col = '#e8ffff', y0 = 80, y1 = HZ + 300) {
  let s = ''; for (let i = 0; i < n; i++) { const x = rr(0, W), y = rr(y0, y1), r = rr(3, 11); s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="none" stroke="${col}" stroke-width="${f(Math.max(1.2, r * .25))}" opacity=".6"/><circle cx="${f(x - r * .35)}" cy="${f(y - r * .35)}" r="${f(r * .22)}" fill="${col}" opacity=".7"/>`; }
  return s;
}

export function stars(n, y1 = HZ, o = {}) {
  let s = ''; for (let i = 0; i < n; i++) { const x = rr(0, W), y = rr(0, y1) * (o.pow ? Math.pow(R(), .5) : 1), r = rr(.8, 2.4); s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${o.c || '#fff8e0'}" opacity="${f(rr(.5, 1))}"/>`; }
  for (let i = 0; i < (o.big ?? 8); i++) { const x = rr(20, W - 20), y = rr(20, y1 - 40), r = rr(5, 10); s += `<path d="M${f(x)} ${f(y - r)} Q${f(x + r * .12)} ${f(y - r * .12)} ${f(x + r)} ${f(y)} Q${f(x + r * .12)} ${f(y + r * .12)} ${f(x)} ${f(y + r)} Q${f(x - r * .12)} ${f(y + r * .12)} ${f(x - r)} ${f(y)} Q${f(x - r * .12)} ${f(y - r * .12)} ${f(x)} ${f(y - r)} Z" fill="${o.c2 || '#fff6c8'}"/>`; }
  return s;
}

export function planet(x, y, r, col, o = {}) {
  let s = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 1.8)}" fill="${rg([[0, col, .35], [1, col, 0]])}"/>`;
  const cp = clip(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`);
  if (o.ring) s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 1.9)}" ry="${f(r * .42)}" fill="none" stroke="${O}" stroke-width="${f(r * .2)}" transform="rotate(-14 ${f(x)} ${f(y)})"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 1.9)}" ry="${f(r * .42)}" fill="none" stroke="${o.ring}" stroke-width="${f(r * .12)}" transform="rotate(-14 ${f(x)} ${f(y)})"/>`;
  s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${col}" stroke="${O}" stroke-width="4"/>`;
  s += `<g clip-path="${cp}"><path d="M${f(x - r)} ${f(y - r * .2)} Q${f(x)} ${f(y - r * .45)} ${f(x + r)} ${f(y - r * .1)} L${f(x + r)} ${f(y + r * .1)} Q${f(x)} ${f(y - r * .2)} ${f(x - r)} ${f(y + r * .05)} Z" fill="${lt(col, .25)}"/><path d="M${f(x - r)} ${f(y + r * .35)} Q${f(x)} ${f(y + r * .15)} ${f(x + r)} ${f(y + r * .45)} L${f(x + r)} ${f(y + r * .6)} Q${f(x)} ${f(y + r * .35)} ${f(x - r)} ${f(y + r * .55)} Z" fill="${dk(col, .15)}"/><circle cx="${f(x + r * .55)}" cy="${f(y + r * .45)}" r="${f(r * 1.05)}" fill="${dk(col, .35)}" opacity=".5"/></g>`;
  if (o.ring) s += `<path clip-path="${clip(`<rect x="${f(x - r * 3)}" y="${f(y)}" width="${f(r * 6)}" height="${f(r * 2)}"/>`)}" d="M0 0" />` + `<g clip-path="${clip(`<rect x="${f(x - r * 3)}" y="${f(y - 2)}" width="${f(r * 6)}" height="${f(r * 2)}" transform="rotate(-14 ${f(x)} ${f(y)})"/>`)}"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 1.9)}" ry="${f(r * .42)}" fill="none" stroke="${O}" stroke-width="${f(r * .2)}" transform="rotate(-14 ${f(x)} ${f(y)})"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 1.9)}" ry="${f(r * .42)}" fill="none" stroke="${o.ring}" stroke-width="${f(r * .12)}" transform="rotate(-14 ${f(x)} ${f(y)})"/></g>`;
  return s;
}

export function island(x, y, w, o = {}) { // ilha flutuante distante
  const rock = o.rock || '#7a6aa0', grass = o.grass || '#7ad08a', oc = mix(O, HAZE, o.hz ?? .2), lw = Math.max(1.5, w * .02);
  const d = `M${f(x - w / 2)} ${f(y)} Q${f(x - w * .3)} ${f(y + w * .35)} ${f(x)} ${f(y + w * .7)} Q${f(x + w * .25)} ${f(y + w * .3)} ${f(x + w / 2)} ${f(y)} Z`;
  let s = `<path d="${d}" fill="${rock}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  s += `<path clip-path="${clip(`<path d="${d}"/>`)}" d="M${f(x)} ${f(y)} L${f(x - LX * w)} ${f(y)} L${f(x - LX * w)} ${f(y + w)} L${f(x - LX * w * .05)} ${f(y + w)} Z" fill="${dk(rock, .3)}"/>`;
  s += `<path d="M${f(x - w * .52)} ${f(y + 2)} Q${f(x)} ${f(y - w * .12)} ${f(x + w * .52)} ${f(y + 2)} Q${f(x)} ${f(y + w * .1)} ${f(x - w * .52)} ${f(y + 2)} Z" fill="${grass}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  if (o.tree) s += cluster([[x - w * .12, y - w * .18, w * .13], [x + w * .02, y - w * .25, w * .15], [x + w * .14, y - w * .16, w * .11]], o.leaf || '#5ac06a', { lw, oc });
  return s;
}

export function stalactites(n, col, y0 = 0, o = {}) {
  let s = ''; for (let i = 0; i < n; i++) { const x = rr(-20, W + 20), w = rr(18, 60), h = rr(60, 260); const d = `M${f(x - w / 2)} ${f(y0 - 5)} L${f(x - w * .15)} ${f(y0 + h * .7)} L${f(x)} ${f(y0 + h)} L${f(x + w * .2)} ${f(y0 + h * .65)} L${f(x + w / 2)} ${f(y0 - 5)} Z`;
    s += `<path d="${d}" fill="${col}" stroke="${o.oc || O}" stroke-width="3" stroke-linejoin="round"/><path d="M${f(x)} ${f(y0 + h)} L${f(x + w * .2)} ${f(y0 + h * .65)} L${f(x + w / 2)} ${f(y0 - 5)} L${f(x + w * .05)} ${f(y0 - 5)} Z" fill="${dk(col, .3)}"/>`; }
  return s;
}

export function torch(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, m * .02)), h = m * 1.7, wood = mix('#7a4a24', HAZE, hz);
  let s = `<circle cx="${f(x)}" cy="${f(y - h)}" r="${f(m * 1.1)}" fill="${rg([[0, '#ffb040', .6], [1, '#ff7020', 0]])}"/>`;
  s += shadowEll(x, y, m * .25, m * .06, .3);
  s += `<path d="M${f(x - m * .05)} ${f(y)} L${f(x - m * .08)} ${f(y - h * .85)} L${f(x + m * .08)} ${f(y - h * .85)} L${f(x + m * .05)} ${f(y)} Z" fill="${wood}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += `<path d="M${f(x - m * .14)} ${f(y - h * .85)} Q${f(x - m * .2)} ${f(y - h * 1.05)} ${f(x)} ${f(y - h * 1.25)} Q${f(x + m * .22)} ${f(y - h * 1.05)} ${f(x + m * .14)} ${f(y - h * .85)} Z" fill="#ff9a2a" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/><path d="M${f(x - m * .06)} ${f(y - h * .87)} Q${f(x - m * .08)} ${f(y - h * .98)} ${f(x)} ${f(y - h * 1.1)} Q${f(x + m * .1)} ${f(y - h * .98)} ${f(x + m * .06)} ${f(y - h * .87)} Z" fill="#ffe27a"/>`;
  return s;
}

export function banner(x, y, m, col, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), lw = Math.max(1, Math.min(5, m * .02)), h = m * 2.4, c = mix(col, HAZE, hz), pole = mix('#6a4a2a', HAZE, hz);
  let s = shadowEll(x, y, m * .3, m * .07, .25);
  s += `<rect x="${f(x - m * .04)}" y="${f(y - h)}" width="${f(m * .08)}" height="${f(h)}" fill="${pole}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += `<path d="M${f(x + m * .04)} ${f(y - h * .95)} H${f(x + m * .55)} V${f(y - h * .55)} L${f(x + m * .3)} ${f(y - h * .62)} L${f(x + m * .04)} ${f(y - h * .55)} Z" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  s += `<path d="M${f(x + m * .04)} ${f(y - h * .78)} H${f(x + m * .55)}" stroke="${lt(c, .4)}" stroke-width="${f(lw * 1.2)}"/>`;
  return s;
}

/* ---------- extras por bioma ---------- */
export function fern(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), c = mix(o.c || '#4cae4a', HAZE, hz), cd = mix(dk(o.c || '#4cae4a', .3), HAZE, hz), lw = Math.max(.8, Math.min(3, m * .012)), h = m * (o.h || .8);
  let s = shadowEll(x, y, h * .5, h * .08, .2);
  const fr = [-150, -125, -100, -80, -55, -30];
  for (const a0 of fr) { const a = a0 * Math.PI / 180, L2 = h * rr(.75, 1), ex = x + Math.cos(a) * L2, ey = y + Math.sin(a) * L2 * .9, cx2 = x + Math.cos(a) * L2 * .45, cy2 = y + Math.sin(a) * L2 * .9 - L2 * .25;
    const d = `M${f(x)} ${f(y)} Q${f(cx2)} ${f(cy2)} ${f(ex)} ${f(ey)}`;
    s += `<path d="${d}" fill="none" stroke="${oc}" stroke-width="${f(h * .05 + lw * 2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${a0 < -90 ? cd : c}" stroke-width="${f(h * .05)}" stroke-linecap="round"/>`;
    for (let k = 1; k <= 5; k++) { const t = k / 6, px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx2 + t * t * ex, py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy2 + t * t * ey, ll = h * .16 * (1 - t * .6);
      s += `<path d="M${f(px)} ${f(py)} l${f(-ll * .6)} ${f(ll * .7)} M${f(px)} ${f(py)} l${f(ll * .6)} ${f(ll * .5)}" stroke="${a0 < -90 ? cd : c}" stroke-width="${f(h * .045)}" stroke-linecap="round"/>`; } }
  return s;
}
export function willow(x, y, m, P, o = {}) {
  const hz = o.hz ?? hazeAt(y), th = (o.h || 4.5) * m, oc = mix(O, HAZE, hz * .85), leaf = mix(P.leaf, HAZE, hz), leafD = mix(dk(P.leaf, .3), HAZE, hz), bark = mix(P.bark || '#6a5038', HAZE, hz), lw = Math.max(1, Math.min(6, th * .011));
  let s = shadowEll(x - LX * th * .1, y, th * .3, th * .06, .2 * (1 - hz));
  s += `<path d="M${f(x - th * .1)} ${f(y)} Q${f(x - th * .03)} ${f(y - th * .3)} ${f(x - th * .04)} ${f(y - th * .6)} L${f(x + th * .05)} ${f(y - th * .6)} Q${f(x + th * .04)} ${f(y - th * .3)} ${f(x + th * .11)} ${f(y)} Z" fill="${bark}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  const cy = y - th * .74, Rr = th * .34, cs = [];
  for (let i = 0; i < 7; i++) { const a = Math.PI + Math.PI * i / 6; cs.push([x + Math.cos(a) * Rr * .78, cy + Math.sin(a) * Rr * .5, Rr * .44]); }
  cs.push([x, cy, Rr * .58]); cs.push([x - Rr * .55, cy + Rr * .25, Rr * .38]); cs.push([x + Rr * .55, cy + Rr * .25, Rr * .38]);
  // cortinas de folhas penduradas
  const ld = []; const ll = [];
  for (let i = 0; i < 14; i++) { const t = i / 13 - .5, sx = x + t * Rr * 2.2, sy = cy + Rr * (.35 - Math.abs(t) * .5), len = th * rr(.2, .36) * (1 - Math.abs(t) * .5);
    for (let k = 0; k < 6; k++) { const yy = sy + len * k / 6, xx = sx + Math.sin(k * 1.3 + i) * th * .012; (k % 2 ? ld : ll).push([xx, yy, th * .028 * (1 - k * .08)]); } }
  s += `<g fill="${oc}">${ll.concat(ld).map(([a, b, r]) => `<ellipse cx="${f(a)}" cy="${f(b)}" rx="${f(r * .7 + lw * .8)}" ry="${f(r * 1.2 + lw * .8)}"/>`).join('')}</g>`;
  s += `<g fill="${leaf}">${ll.map(([a, b, r]) => `<ellipse cx="${f(a)}" cy="${f(b)}" rx="${f(r * .7)}" ry="${f(r * 1.2)}"/>`).join('')}</g><g fill="${leafD}">${ld.map(([a, b, r]) => `<ellipse cx="${f(a)}" cy="${f(b)}" rx="${f(r * .7)}" ry="${f(r * 1.2)}"/>`).join('')}</g>`;
  s += cluster(cs, leaf, { lw, oc, hiN: 2 });
  return s;
}
export function frog(x, y, m) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), c = mix('#7cd04a', HAZE, hz), r = m * .14, lw = Math.max(1, r * .12);
  return `<ellipse cx="${f(x)}" cy="${f(y - r * .6)}" rx="${f(r)}" ry="${f(r * .7)}" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}"/><circle cx="${f(x - r * .45)}" cy="${f(y - r * 1.2)}" r="${f(r * .32)}" fill="#fff" stroke="${oc}" stroke-width="${f(lw)}"/><circle cx="${f(x + r * .45)}" cy="${f(y - r * 1.2)}" r="${f(r * .32)}" fill="#fff" stroke="${oc}" stroke-width="${f(lw)}"/><circle cx="${f(x - r * .42)}" cy="${f(y - r * 1.18)}" r="${f(r * .14)}" fill="${O}"/><circle cx="${f(x + r * .48)}" cy="${f(y - r * 1.18)}" r="${f(r * .14)}" fill="${O}"/><path d="M${f(x - r * .4)} ${f(y - r * .55)} q${f(r * .4)} ${f(r * .25)} ${f(r * .8)} 0" fill="none" stroke="${oc}" stroke-width="${f(lw)}" stroke-linecap="round"/>`;
}
export function dragonfly(x, y, s2, c = '#5ad0ff') {
  return `<g transform="translate(${f(x)} ${f(y)})"><ellipse cx="-6" cy="-3" rx="8" ry="3" fill="${c}" opacity=".7" stroke="${O}" stroke-width="1"/><ellipse cx="6" cy="-3" rx="8" ry="3" fill="${c}" opacity=".7" stroke="${O}" stroke-width="1"/><rect x="-1.5" y="-6" width="3" height="16" rx="1.5" fill="#3a6ad0" stroke="${O}" stroke-width="1"/></g>`;
}
export function plume(x, y, w, h, col = '#8a7a80', o = {}) {
  const cs = []; for (let i = 0; i < 7; i++) { const t = i / 6; cs.push([x + Math.sin(t * 3) * w * .3 + t * w * (o.drift ?? .4), y - t * h, w * (.22 + t * .25)]); }
  return cluster(cs, col, { lw: o.lw ?? 2.5, oc: mix(O, HAZE, .5), dark: dk(col, .25), hi: lt(col, .3), hiN: 3, volA: .4 });
}
export function volcano(x, y, w, h, o = {}) {
  const hz = o.hz ?? .3, c = mix(o.c || '#6a4a48', HAZE, hz), oc = mix(O, HAZE, hz + .1), lw = 2.5;
  const d = `M${f(x - w)} ${f(y)} L${f(x - w * .22)} ${f(y - h)} Q${f(x)} ${f(y - h * 1.04)} ${f(x + w * .22)} ${f(y - h)} L${f(x + w)} ${f(y)} Z`;
  let s = `<path d="${d}" fill="${c}" stroke="${oc}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<path clip-path="${clip(`<path d="${d}"/>`)}" d="M${f(x + w * .05)} ${f(y - h * 1.1)} L${f(x + w * .25)} ${f(y - h * .5)} L${f(x + w * .1)} ${f(y + 5)} L${f(x + w * 1.2)} ${f(y + 5)} L${f(x + w * 1.2)} ${f(y - h * 1.1)} Z" fill="${dk(c, .25)}"/>`;
  s += `<path d="M${f(x - w * .2)} ${f(y - h)} Q${f(x)} ${f(y - h * .93)} ${f(x + w * .2)} ${f(y - h)}" fill="none" stroke="#ffb040" stroke-width="5"/>`;
  s += `<ellipse cx="${f(x)}" cy="${f(y - h)}" rx="${f(w * .35)}" ry="${f(h * .18)}" fill="${rg([[0, '#ff9a30', .7], [1, '#ff5a20', 0]])}"/>`;
  for (const k of [-.12, .06, .15]) s += `<path d="M${f(x + k * w)} ${f(y - h * .98)} q${f(w * .05)} ${f(h * .3)} ${f(-w * .02)} ${f(h * .5)} t${f(w * .06)} ${f(h * .45)}" fill="none" stroke="#ff7a2a" stroke-width="${f(w * .035)}" stroke-linecap="round" opacity=".9"/><path d="M${f(x + k * w)} ${f(y - h * .98)} q${f(w * .05)} ${f(h * .3)} ${f(-w * .02)} ${f(h * .5)}" fill="none" stroke="#ffd25a" stroke-width="${f(w * .015)}" stroke-linecap="round"/>`;
  return s;
}
export function embers(n, y0, y1, c = '#ffb040') {
  let s = ''; for (let i = 0; i < n; i++) { const x = rr(0, W), y = rr(y0, y1), r = rr(1.5, 4); s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.5)}" fill="${c}" opacity=".18"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" opacity=".85"/>`; }
  return s;
}
export function snowfall(n, y0 = 0, y1 = H) {
  let s = ''; for (let i = 0; i < n; i++) { const x = rr(0, W), y = rr(y0, y1), r = rr(1.5, 4.5) * (.5 + (y / H)); s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#fff" opacity="${f(rr(.6, .95))}"/>`; }
  return s;
}
export function lightning(x, y, len, o = {}) {
  let d = `M${f(x)} ${f(y)}`, cx = x, cy = y; const seg = 6; for (let i = 0; i < seg; i++) { cx += rr(-len * .12, len * .12); cy += len / seg; d += ` L${f(cx)} ${f(cy)}`; }
  return `<path d="${d}" fill="none" stroke="#fff6a0" stroke-width="16" opacity=".25" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${O}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff27a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
}
export function pyramid(x, y, w, h, o = {}) {
  const hz = o.hz ?? .35, c = mix(o.c || '#e8b46a', HAZE, hz), oc = mix(O, HAZE, hz + .1), lw = 2;
  let s = `<polygon points="${P([[x - w, y], [x, y - h], [x + w, y]])}" fill="${c}" stroke="${oc}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<polygon points="${P([[x, y - h], [x - LX * w, y], [x - LX * w * .15, y]])}" fill="${dk(c, .25)}"/>`;
  for (let i = 1; i < 6; i++) { const t = i / 6; s += `<path d="M${f(x - w * t)} ${f(y - h * (1 - t))} L${f(x + w * t)} ${f(y - h * (1 - t))}" stroke="${dk(c, .18)}" stroke-width="1.2" opacity=".6"/>`; }
  return s;
}
export function lighthouse(x, y, s2, o = {}) {
  const hz = o.hz ?? .3, oc = mix(O, HAZE, hz + .1), lw = Math.max(1, s2 * .02), red = mix('#e05040', HAZE, hz), wht = mix('#fff6ea', HAZE, hz);
  let s = '';
  const b = s2 * .16, t = s2 * .1, top = y - s2;
  s += `<polygon points="${P([[x - b, y], [x - t, top], [x + t, top], [x + b, y]])}" fill="${wht}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  for (let i = 0; i < 3; i++) { const y0 = y - s2 * (.15 + i * .28), y1 = y0 - s2 * .14, w0 = b - (b - t) * ((y - y0) / s2), w1 = b - (b - t) * ((y - y1) / s2); s += `<polygon points="${P([[x - w0, y0], [x - w1, y1], [x + w1, y1], [x + w0, y0]])}" fill="${red}"/>`; }
  s += `<polygon points="${P([[x, top], [x + t, top], [x + b, y], [x, y]])}" fill="${dk(wht, .2)}" opacity=".5"/>`;
  s += `<rect x="${f(x - t * 1.1)}" y="${f(top - s2 * .12)}" width="${f(t * 2.2)}" height="${f(s2 * .12)}" fill="#ffe27a" stroke="${oc}" stroke-width="${f(lw)}"/><polygon points="${P([[x - t * 1.4, top - s2 * .12], [x, top - s2 * .24], [x + t * 1.4, top - s2 * .12]])}" fill="${red}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += `<path d="M${f(x)} ${f(top - s2 * .06)} L${f(x - s2 * .9)} ${f(top - s2 * .2)} L${f(x - s2 * .9)} ${f(top + s2 * .08)} Z" fill="#fff6c0" opacity=".35"/>`;
  return s;
}
export function boat(x, y, m, o = {}) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), wood = mix(o.c || '#b07842', HAZE, hz), lw = Math.max(1, Math.min(5, m * .02)), L2 = m * (o.l || 1.8);
  let s = shadowEll(x, y, L2 * .6, L2 * .1, .25);
  const d = `M${f(x - L2 / 2)} ${f(y - L2 * .22)} Q${f(x - L2 * .45)} ${f(y)} ${f(x - L2 * .2)} ${f(y)} H${f(x + L2 * .3)} Q${f(x + L2 * .5)} ${f(y - L2 * .05)} ${f(x + L2 / 2)} ${f(y - L2 * .25)} Z`;
  s += `<path d="${d}" fill="${wood}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/><path d="M${f(x - L2 * .45)} ${f(y - L2 * .14)} H${f(x + L2 * .45)}" stroke="${dk(wood, .3)}" stroke-width="${f(lw)}"/><path d="M${f(x - L2 / 2)} ${f(y - L2 * .22)} H${f(x + L2 / 2)}" stroke="${lt(wood, .3)}" stroke-width="${f(lw * 1.4)}"/>`;
  if (o.sail) s += `<path d="M${f(x)} ${f(y - L2 * .22)} V${f(y - L2 * .95)}" stroke="${oc}" stroke-width="${f(lw)}"/><path d="M${f(x + 2)} ${f(y - L2 * .92)} Q${f(x + L2 * .4)} ${f(y - L2 * .6)} ${f(x + 2)} ${f(y - L2 * .3)} Z" fill="${mix('#fff6ea', HAZE, hz)}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  return s;
}
export function gull(x, y, w) { return `<path d="M${f(x - w)} ${f(y)} q${f(w * .5)} ${f(-w * .5)} ${f(w)} 0 q${f(w * .5)} ${f(-w * .5)} ${f(w)} 0" fill="none" stroke="${O}" stroke-width="${f(Math.max(1.5, w * .18))}" stroke-linecap="round" stroke-linejoin="round"/>`; }
export function shell(x, y, m, col = '#ffb8a0') {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), c = mix(col, HAZE, hz), r = m * .1, lw = Math.max(1, r * .1);
  let s = `<path d="M${f(x - r)} ${f(y)} Q${f(x - r * 1.1)} ${f(y - r * 1.2)} ${f(x)} ${f(y - r * 1.3)} Q${f(x + r * 1.1)} ${f(y - r * 1.2)} ${f(x + r)} ${f(y)} Z" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
  for (const k of [-.5, 0, .5]) s += `<path d="M${f(x + k * r * .3)} ${f(y)} L${f(x + k * r)} ${f(y - r * 1.15)}" stroke="${dk(c, .25)}" stroke-width="${f(lw * .8)}"/>`;
  return s;
}
export function starfish(x, y, m, col = '#ff8a5a') {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), c = mix(col, HAZE, hz), r = m * .14, lw = Math.max(1, r * .1);
  let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + f(x + Math.cos(a) * rad) + ' ' + f(y - r * .4 + Math.sin(a) * rad * .5) + ' '; }
  return `<path d="${d}Z" fill="${c}" stroke="${oc}" stroke-width="${f(lw)}" stroke-linejoin="round"/>`;
}
export function fish(x, y, w, col = '#ffb040', dir = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${dir} 1)"><path d="M${f(-w)} 0 Q${f(-w * .2)} ${f(-w * .55)} ${f(w * .6)} 0 Q${f(-w * .2)} ${f(w * .55)} ${f(-w)} 0 Z" fill="${col}" stroke="${O}" stroke-width="${f(Math.max(1, w * .1))}"/><path d="M${f(w * .55)} 0 L${f(w)} ${f(-w * .35)} L${f(w)} ${f(w * .35)} Z" fill="${col}" stroke="${O}" stroke-width="${f(Math.max(1, w * .1))}" stroke-linejoin="round"/><circle cx="${f(-w * .55)}" cy="${f(-w * .08)}" r="${f(w * .09)}" fill="${O}"/></g>`;
}
export function chest(x, y, m) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), wood = mix('#a86a34', HAZE, hz), gold = mix('#ffd23a', HAZE, hz), w = m * .7, h = m * .45, lw = Math.max(1, Math.min(5, m * .022));
  let s = shadowEll(x, y, w * .7, w * .14, .25);
  s += `<rect x="${f(x - w / 2)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${wood}" stroke="${oc}" stroke-width="${f(lw)}"/><path d="M${f(x - w / 2)} ${f(y - h)} Q${f(x)} ${f(y - h * 1.7)} ${f(x + w / 2)} ${f(y - h)} Z" fill="${lt(wood, .1)}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  s += `<rect x="${f(x - w * .06)}" y="${f(y - h * 1.05)}" width="${f(w * .12)}" height="${f(h * .35)}" fill="${gold}" stroke="${oc}" stroke-width="${f(lw * .8)}"/><path d="M${f(x - w / 2)} ${f(y - h * .55)} H${f(x + w / 2)}" stroke="${gold}" stroke-width="${f(lw * 1.5)}"/>`;
  return s;
}
export function aurora(y, cols, a = .35) {
  let s = ''; cols.forEach((c, i) => { const yy = y + i * 40; s += `<path d="M-20 ${f(yy)} C${f(W * .25)} ${f(yy - 90)} ${f(W * .55)} ${f(yy + 70)} ${f(W + 20)} ${f(yy - 40)} L${f(W + 20)} ${f(yy + 50)} C${f(W * .55)} ${f(yy + 150)} ${f(W * .25)} ${f(yy)} -20 ${f(yy + 90)} Z" fill="${lg([[0, c, 0], [.5, c, a], [1, c, 0]], 0, 0, 0, 1)}"/>`; });
  return s;
}
export function nebula(x, y, r, c, a = .45) { return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * .6)}" fill="${rg([[0, c, a], [.6, c, a * .35], [1, c, 0]])}"/>`; }
export function tileFloor(c1, c2, o = {}) { // ladrilhos em perspectiva
  const vx = o.vx ?? W / 2, cols = o.cols ?? 14, rows = o.rows ?? [1, 1.15, 1.35, 1.6, 1.95, 2.45, 3.1, 4.1, 5.6, 8, 12, 20];
  let s = '';
  for (let r = 0; r < rows.length - 1; r++) { const ya = yAt(rows[r + 1]), yb = yAt(rows[r]);
    for (let c = -cols; c < cols; c++) { const X0 = c * (o.size ?? 1.1), X1 = X0 + (o.size ?? 1.1); const p = [[vx + X0 * sc(yb), yb], [vx + X1 * sc(yb), yb], [vx + X1 * sc(ya), ya], [vx + X0 * sc(ya), ya]];
      if (p[1][0] < -50 || p[0][0] > W + 50) continue; const hz = hazeAt((ya + yb) / 2);
      s += `<polygon points="${P(p)}" fill="${mix((r + c) % 2 ? c1 : c2, HAZE, hz)}" stroke="${mix(o.line || dk(c1, .35), HAZE, hz)}" stroke-width="${f(Math.max(.8, 3 * sr(yb)))}" stroke-linejoin="round"/>`; } }
  return s;
}
export function magicCircle(x, y, m, col, o = {}) {
  const rx = m * (o.r || 2.4), ry = rx * (.18 + .2 * sr(y));
  let s = `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx * 1.15)}" ry="${f(ry * 1.15)}" fill="${rg([[0, col, .35], [1, col, 0]])}"/>`;
  s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="none" stroke="${col}" stroke-width="${f(m * .04)}" opacity=".85"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx * .78)}" ry="${f(ry * .78)}" fill="none" stroke="${col}" stroke-width="${f(m * .025)}" opacity=".8" stroke-dasharray="${f(m * .12)} ${f(m * .06)}"/>`;
  let d = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2, b = a + Math.PI * 2 / 3 * 2; d += `M${f(x + Math.cos(a) * rx * .78)} ${f(y + Math.sin(a) * ry * .78)} L${f(x + Math.cos(a + Math.PI * 2 / 3) * rx * .78)} ${f(y + Math.sin(a + Math.PI * 2 / 3) * ry * .78)} `; }
  s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(m * .02)}" opacity=".7"/>`;
  return s;
}
export function veins(n, col, o = {}) { // linhas brilhantes no chão
  let s = ''; for (let i = 0; i < n; i++) { let y = rr(HZ + 20, H), x = rr(0, W), d = `M${f(x)} ${f(y)}`; const m = sc(y); for (let k = 0; k < 5; k++) { x += rr(-m * .6, m * .6); y += rr(-m * .08, m * .08); d += ` L${f(x)} ${f(y)}`; }
    s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(Math.max(1.5, m * .05))}" opacity=".3" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${lt(col, .5)}" stroke-width="${f(Math.max(.8, m * .018))}" opacity=".9" stroke-linejoin="round"/>`; }
  return s;
}
export function caustics(n, col = '#ffffff', a = .18) {
  let s = ''; for (let i = 0; i < n; i++) { const y = rr(HZ + 10, H), m = sc(y), x = rr(-20, W + 20), r = m * rr(.25, .5); let d = ''; const k = 5; for (let j = 0; j <= k; j++) { const ang = j * Math.PI * 2 / k; d += (j ? 'L' : 'M') + f(x + Math.cos(ang) * r * rr(.7, 1.2)) + ' ' + f(y + Math.sin(ang) * r * .3 * rr(.7, 1.2)) + ' '; }
    s += `<path d="${d}Z" fill="none" stroke="${col}" stroke-width="${f(Math.max(1, m * .025))}" opacity="${a}" stroke-linejoin="round"/>`; }
  return s;
}
export function colosseum(yb, o = {}) { // arquibancada curva no fundo
  const hz = o.hz ?? .15, stone = mix(o.c || '#d8b88a', HAZE, hz), dark = dk(stone, .3), oc = mix(O, HAZE, hz + .1);
  const top = yb - (o.h || 230);
  const curve = (x, k) => yb - k + Math.pow((x - W / 2) / (W / 2), 2) * -60;
  let s = `<path d="M-10 ${f(curve(-10, o.h || 230))} Q${W / 2} ${f(top - 40)} ${W + 10} ${f(curve(W + 10, o.h || 230))} L${W + 10} ${f(yb)} L-10 ${f(yb)} Z" fill="${stone}" stroke="${oc}" stroke-width="3"/>`;
  for (let r = 0; r < 4; r++) { const yy = yb - (o.h || 230) * (.18 + r * .2); s += `<path d="M-10 ${f(yy + 30)} Q${W / 2} ${f(yy - 40)} ${W + 10} ${f(yy + 30)}" fill="none" stroke="${dark}" stroke-width="4" opacity=".7"/>`;
    for (let i = 0; i < 26; i++) { const x = i * W / 25 + (r % 2) * 14, y = yy + 30 - Math.sin(Math.PI * (x / W)) * 70 - 8; s += `<circle cx="${f(x)}" cy="${f(y)}" r="5.5" fill="${pick(['#e05a4a', '#4a8ae0', '#ffd23a', '#6ac06a', '#c07ae0', '#ff9a4a', '#f2e6d8'])}" opacity=".9"/>`; } }
  for (let i = 0; i < 9; i++) { const x = i * W / 8; s += `<path d="M${f(x - 22)} ${f(yb)} V${f(yb - 46)} Q${f(x)} ${f(yb - 74)} ${f(x + 22)} ${f(yb - 46)} V${f(yb)} Z" fill="${dk(stone, .55)}" stroke="${oc}" stroke-width="2.5"/>`; }
  for (let i = 0; i < 6; i++) { const x = 40 + i * (W - 80) / 5, y = curve(x, o.h || 230) - Math.sin(Math.PI * x / W) * 60; s += `<path d="M${f(x)} ${f(y + 6)} v-50" stroke="${oc}" stroke-width="3"/><path d="M${f(x)} ${f(y - 44)} l26 7 l-26 7 z" fill="${pick(['#e05a4a', '#4a8ae0', '#ffd23a', '#6ac06a'])}" stroke="${oc}" stroke-width="2"/>`; }
  return s;
}
export function weaponRack(x, y, m) {
  const hz = hazeAt(y), oc = mix(O, HAZE, hz * .85), wood = mix('#9a6436', HAZE, hz), metal = mix('#c8d0dc', HAZE, hz), lw = Math.max(1, Math.min(5, m * .022)), w = m * 1.2, h = m * 1.1;
  let s = shadowEll(x, y, w * .6, w * .1, .25);
  s += `<rect x="${f(x - w / 2)}" y="${f(y - h)}" width="${f(m * .1)}" height="${f(h)}" fill="${wood}" stroke="${oc}" stroke-width="${f(lw)}"/><rect x="${f(x + w / 2 - m * .1)}" y="${f(y - h)}" width="${f(m * .1)}" height="${f(h)}" fill="${wood}" stroke="${oc}" stroke-width="${f(lw)}"/><rect x="${f(x - w / 2)}" y="${f(y - h * .7)}" width="${f(w)}" height="${f(m * .08)}" fill="${wood}" stroke="${oc}" stroke-width="${f(lw)}"/>`;
  for (let i = 0; i < 3; i++) { const sx = x - w * .25 + i * w * .25; s += `<path d="M${f(sx)} ${f(y - h * .1)} L${f(sx + m * .04)} ${f(y - h * 1.15)}" stroke="${oc}" stroke-width="${f(m * .07 + lw * 2)}" stroke-linecap="round"/><path d="M${f(sx)} ${f(y - h * .1)} L${f(sx + m * .04)} ${f(y - h * 1.15)}" stroke="${i === 1 ? '#8a5a2a' : metal}" stroke-width="${f(m * .07)}" stroke-linecap="round"/>`; }
  return s;
}
