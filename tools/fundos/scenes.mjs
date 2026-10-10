import * as L from './lib.mjs';
import * as Pp from './props.mjs';
const { W, H, f, mix, dk, lt, rr, ri, R, pick, sc, sr, yAt } = L;

// faixas de plantação num morro distante
function fields(rd, cols, o = {}) {
  const cp = L.clip(`<path d="${rd.d}"/>`); let s = `<g clip-path="${cp}">`;
  const slope = o.slope ?? .16, top = o.top ?? 520, n = o.n ?? 12;
  for (let i = 0; i < n; i++) { const b0 = top + i * (o.step ?? 14), b1 = b0 + (o.step ?? 14); const pts = [[-20, b0 - slope * -20 * (i % 2 ? 1 : -1)], [W + 20, b0 + slope * (W + 20) * (i % 2 ? 1 : -1) * .3], [W + 20, b1 + slope * (W + 20) * (i % 2 ? 1 : -1) * .3], [-20, b1]];
    s += `<polygon points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${mix(cols[i % cols.length], L.HAZE, o.hz ?? .3)}"/>`; }
  for (let i = 0; i < (o.hedges ?? 5); i++) { const x0 = rr(0, W), x1 = x0 + rr(80, 220), y0 = rr(top + 10, top + 90); s += `<path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y0 + rr(-12, 12))}" stroke="${mix('#3d7a3a', L.HAZE, o.hz ?? .3)}" stroke-width="4" stroke-dasharray="5 2" stroke-linecap="round"/>`; }
  return s + '</g>';
}
function butterflies(n, cols) {
  let s = ''; for (let i = 0; i < n; i++) { const x = rr(60, W - 60), y = rr(L.HZ + 40, L.HZ + 260), m = sc(y) * .1 + 4, c = pick(cols), a = rr(-20, 20);
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><ellipse cx="${f(-m * .6)}" cy="0" rx="${f(m * .7)}" ry="${f(m * .5)}" fill="${c}" stroke="${L.O}" stroke-width="1.2"/><ellipse cx="${f(m * .6)}" cy="0" rx="${f(m * .7)}" ry="${f(m * .5)}" fill="${c}" stroke="${L.O}" stroke-width="1.2"/><rect x="${f(-m * .1)}" y="${f(-m * .5)}" width="${f(m * .2)}" height="${f(m)}" fill="${L.O}"/></g>`; }
  return s;
}
function treeLine(rd, x0, x1, step, P, o = {}) { // copas pequenas ao longo de um morro
  let s = ''; for (let x = x0; x <= x1; x += step * rr(.7, 1.3)) { const y = rd.Y(x) + (o.dy ?? 4); s += o.pine ? L.pine(x, y, o.m ?? 6, P, { hz: o.hz ?? .3, h: rr(4, 6), noShadow: true }) : L.tree(x, y, o.m ?? 6, P, { hz: o.hz ?? .3, h: rr(3.5, 5), noShadow: true, n: 6, plain: true }); }
  return s;
}
const unitZone = (x, y) => x > 30 && x < 690 && y > 725 && y < 1135;
const notRoad = (rd, pad = .3) => (x, y) => Math.abs(x - rd.center(y)) < rd.half(y) + pad * sc(y);

export const SCENES = {
  vale() {
    L.resetDefs(); L.seed(101); L.setScene({ hz: 600, lx: 1, haze: '#d4ebff' });
    const P = { leaf: '#5fbf45', leafDark: '#2f8a3a', leafHi: '#a8e86a', bark: '#8f5e34', pine: '#3f9a52' };
    let s = L.sky([[0, '#3fa6ea'], [.3, '#7cc8f8'], [.43, '#c2e8ff'], [.46, '#e4f6ff'], [1, '#e4f6ff']]);
    s += L.sun(585, 175, 46, '#fff4a8', { glow: '#fff7c8' });
    s += L.cloud(130, 270, 250) + L.cloud(430, 150, 170) + L.cloud(640, 355, 140) + L.cloud(300, 450, 110, { c: '#f4faff' }) + L.cloud(600, 500, 90, { c: '#f4faff' });
    s += L.mountains(585, [[40, 160, 150], [200, 225, 170], [370, 180, 150], [545, 245, 180], [705, 190, 160]], '#7a96c6', { hz: .42, snow: '#ffffff', lw: 2 });
    const r1 = L.ridge(582, 22, 1.1, .6, '#97c86c', { hz: .35, lw: 2 }); s += r1.s + fields(r1, ['#a8d46c', '#d6d07a', '#8cc45e', '#c2dc76', '#b4cc62'], { top: 540, step: 11, hz: .3 });
    s += Pp.castle(482, r1.Y(482) + 8, 64, { hz: .3 }) + Pp.windmill(150, r1.Y(150) + 6, 58, { hz: .32 });
    s += treeLine(r1, 10, 120, 26, P, { m: 5.5, hz: .35 }) + treeLine(r1, 230, 380, 28, P, { m: 5.5, hz: .35 }) + treeLine(r1, 590, 720, 24, P, { m: 5.5, hz: .35 });
    const r2 = L.ridge(600, 9, 2.2, 2.1, '#88c460', { hz: .2, lw: 2 }); s += r2.s;
    s += treeLine(r2, -10, 140, 34, P, { m: 8, hz: .22, dy: 6 }) + treeLine(r2, 600, 730, 30, P, { m: 8, hz: .22, dy: 6 });
    s += L.groundBase('#8fcf5c', '#56a63a');
    s += L.patches(70, ['#79c04f', '#a6dc6c', '#68ae46', '#9ad466'], { a: .5 });
    s += L.texture(.1, .8);
    const rd = L.road({ c: '#e6c88c', cNear: '#d2a86c', w: 2.8, amp: .55, ph: 1.2, cx: 360, vx: 122 });
    s += rd.s;
    s += L.scatter(70, (x, y, m) => L.rock(x, y, m, '#b8a888', { w: rr(.08, .16), hr: .5 }), { skip: (x, y) => !notRoad(rd, -.1)(x, y), pow: .6 });
    // cerca na margem esquerda do caminho (só ao fundo)
    const fp = []; for (const u of [2.4, 2.9, 3.5, 4.3, 5.3, 6.6, 8.4, 11]) { const y = yAt(u); fp.push([rd.center(y) - rd.half(y) - .55 * sc(y), y]); }
    s += L.fence(fp, { c: '#b07c44' });
    // árvores médias e arbustos no fundo
    const mid = [[18, 640, 4.6], [92, 628, 4], [650, 636, 4.4], [712, 652, 5], [560, 618, 3.6], [255, 616, 3.4]];
    for (const [x, y, h] of mid.sort((a, b) => a[1] - b[1])) s += L.tree(x, y, sc(y), P, { h, fruit: h > 4.4 ? '#ff6a5a' : null });
    s += L.bush(170, 660, sc(660), '#56b444', { dots: '#ff8ab0' }) + L.bush(600, 676, sc(676), '#4fae42', { dots: '#ffe25a' }) + Pp.signpost(rd.center(700) + rd.half(700) + .7 * sc(700), 700, sc(700));
    s += L.scatter(190, (x, y, m) => L.tuft(x, y, m, '#4f9e36', '#7cc850', { h: .22 }), { skip: notRoad(rd, .1), minM: 6 });
    s += L.scatter(110, (x, y, m) => L.flower(x, y, m, pick(['#ff7aa8', '#ffffff', '#ffd23a', '#b48cff', '#ff9a4a'])), { skip: notRoad(rd, .2), minM: 10, pow: .9 });
    // laterais grandes (enquadram sem cobrir as unidades)
    s += L.tree(-60, 960, sc(960), P, { h: 4.4, fruit: '#ff6a5a' }) + L.tree(790, 930, sc(930), P, { h: 4.4 });
    s += L.rock(60, 1060, sc(1060), '#a89c88', { w: .7, moss: '#6ab04a' }) + L.bush(712, 1085, sc(1085), '#58b646', { dots: '#ff8ab0', w: .9 });
    s += L.rock(640, 760, sc(760), '#b0a490', { w: .6 });
    s += Pp.stump(110, 790, sc(790));
    // primeiro plano
    s += L.bush(10, 1325, sc(1325), '#4aa83a', { w: 1.05, dots: '#ffe25a', nd: 7 }) + L.bush(712, 1330, sc(1330), '#4aa83a', { w: 1.1, dots: '#ff8ab0', nd: 7 });
    s += L.scatter(16, (x, y, m) => L.tuft(x, y, m, '#3f9030', '#6cc046', { h: .24 }), { y0: 1180, y1: 1330, skip: notRoad(rd, .1) });
    s += butterflies(4, ['#ffd23a', '#ff8ab0', '#ffffff']);
    s += L.vignette(.28);
    return L.svgDoc(s);
  },

  bosque() {
    L.resetDefs(); L.seed(202); L.setScene({ hz: 600, lx: -1, haze: '#b6dcc8' });
    const P = { leaf: '#3f9a4e', leafDark: '#1d6638', leafHi: '#86d46e', bark: '#6e4a2c', pine: '#2f7f4a' };
    let s = L.sky([[0, '#4c9a94'], [.42, '#98d2bc'], [1, '#cfeedb']]);
    s += L.glow(110, 140, 460, '#fff6c8', .6);
    // fileiras de troncos ao fundo, cada vez mais nítidas
    for (const [hzF, n, w0, w1] of [[.75, 16, 10, 18], [.55, 11, 18, 30], [.35, 8, 28, 44]]) {
      for (let i = 0; i < n; i++) { const x = rr(-20, W + 20), w = rr(w0, w1), yb = L.HZ + 6 + (1 - hzF) * 30; const c = mix('#5a4434', L.HAZE, hzF);
        s += `<path d="M${f(x - w / 2)} -10 L${f(x - w * .55)} ${f(yb - w * .3)} Q${f(x - w)} ${f(yb)} ${f(x - w * 1.1)} ${f(yb + 2)} H${f(x + w * 1.1)} Q${f(x + w)} ${f(yb)} ${f(x + w * .55)} ${f(yb - w * .3)} L${f(x + w / 2)} -10 Z" fill="${c}" stroke="${mix(L.O, L.HAZE, hzF)}" stroke-width="2"/><rect x="${f(x)}" y="-10" width="${f(w * .5)}" height="${f(yb)}" fill="${dk(c, .25)}" opacity=".5"/>`; }
      s += `<rect x="0" y="${f(L.HZ - 120)}" width="${W}" height="140" fill="${L.lg([[0, L.HAZE, 0], [1, L.HAZE, .35]])}"/>`;
    }
    // copa fechada no alto
    const roof = []; for (let x = -40; x <= W + 40; x += 46) roof.push([x, rr(10, 90), rr(55, 85)]);
    s += L.cluster(roof, '#2f7a46', { lw: 4, dark: '#1c5232', hi: '#5aa860', hiN: 6 });
    const roof2 = []; for (let x = -20; x <= W + 20; x += 70) roof2.push([x, rr(130, 190), rr(30, 48)]);
    s += L.cluster(roof2.filter((_, i) => i % 3 !== 1), '#3a8a4e', { lw: 3, dark: '#22603a', hi: '#6ab86a', hiN: 3 });
    s += L.rays(60, 30, 8, 1250, '#fffbe0', .24, .95);
    s += L.groundBase('#66ac58', '#3c8a3c');
    s += L.patches(80, ['#5aa04a', '#86a846', '#8a7238', '#4f9a46', '#a08a40'], { a: .5 });
    s += L.texture(.12, .9);
    const rd = L.road({ c: '#b48c5c', cNear: '#9a7044', w: 2.2, amp: .8, ph: 2.4, cx: 380, vx: -40 });
    s += rd.s;
    s += L.scatter(70, (x, y, m) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(m * .06)}" ry="${f(m * .025)}" fill="${pick(['#d88a3a', '#c0602a', '#e8b04a'])}" opacity=".9"/>`, { skip: (x, y) => !notRoad(rd, -.05)(x, y), minM: 5 });
    const mid = [[30, 640, 'p', 5.5], [120, 625, 't', 4.5], [600, 628, 'p', 5], [690, 650, 't', 5], [520, 612, 'p', 4.2], [230, 612, 'p', 4.5]];
    for (const [x, y, k, h] of mid.sort((a, b) => a[1] - b[1])) s += k === 'p' ? L.pine(x, y, sc(y), P, { h }) : L.tree(x, y, sc(y), P, { h });
    s += Pp.log(560, 700, sc(700), { moss: true, dir: -1 }) + Pp.stump(150, 690, sc(690)) + L.rock(640, 690, sc(690), '#8a948a', { w: .7, moss: '#5aa848' });
    s += L.scatter(46, (x, y, m) => Pp.fern(x, y, m, { c: pick(['#4cae4a', '#3f9a44', '#5ab850']) }), { skip: notRoad(rd, .4), minM: 18, pow: .9 });
    s += L.scatter(150, (x, y, m) => L.tuft(x, y, m, '#3f8a34', '#62b04a', { h: .2 }), { skip: notRoad(rd, .1), minM: 6 });
    s += L.scatter(18, (x, y, m) => L.mushroom(x, y, m, pick(['#e0402a', '#e86a2a']), { h: rr(.2, .32) }), { skip: notRoad(rd, .25), minM: 20, pow: .9 });
    s += L.tree(-70, 980, sc(980), P, { h: 4.8 }) + L.pine(785, 960, sc(960), P, { h: 5.6 });
    s += Pp.log(70, 1110, sc(1110), { moss: true, l: 1.2 }) + L.bush(700, 1100, sc(1100), '#3f9a46', { w: .9, dots: '#e04060' });
    s += L.mushroom(640, 1240, sc(1240), '#e0402a', { h: .3 }) + L.mushroom(600, 1270, sc(1270), '#e86a2a', { h: .22 }) + Pp.fern(40, 1320, sc(1320), { h: .6 });
    s += Pp.embers(26, 300, 1100, '#e6ff9a');
    s += L.vignette(.35, '#0a1a10');
    return L.svgDoc(s);
  },
  charco() {
    L.resetDefs(); L.seed(303); L.setScene({ hz: 610, lx: 1, haze: '#d2ece6' });
    const P = { leaf: '#6aae5a', leafDark: '#3f7a46', leafHi: '#a2d88a', bark: '#6a5038', pine: '#3f8a5a' };
    let s = L.sky([[0, '#6ab8bc'], [.38, '#a8dcd4'], [1, '#e2f6ee']]);
    s += L.sun(560, 210, 40, '#fff8d8', { glow: '#ffffff' });
    s += L.cloud(160, 260, 230, { c: '#f2faf8', shade: '#b8d6d6' }) + L.cloud(520, 160, 170, { c: '#f2faf8', shade: '#b8d6d6' }) + L.cloud(620, 420, 120, { c: '#f2faf8', shade: '#b8d6d6' });
    const r1 = L.ridge(605, 26, .9, 1.4, '#7fb08e', { hz: .45, lw: 2 }); s += r1.s;
    for (const x of [40, 110, 200, 520, 600, 690]) s += Pp.willow(x, r1.Y(x) + 6, 7, P, { hz: .4, h: rr(4, 5.5) });
    s += L.groundBase('#86b860', '#5a9a44');
    // lago ao fundo
    const shore = x => 712 + Math.sin(x / 90) * 14 + Math.sin(x / 37) * 5;
    let ld = `M-10 ${L.HZ - 1} L${W + 10} ${L.HZ - 1} `; for (let x = W + 10; x >= -10; x -= 10) ld += `L${x} ${f(shore(x))} `; ld += 'Z';
    s += `<path d="${ld}" fill="${L.lg([[0, '#cfeee8'], [.25, '#7ccac6'], [1, '#3f9aa6']], 0, L.HZ, 0, 740, true)}"/>`;
    s += `<g clip-path="${L.clip(`<path d="${ld}"/>`)}">${Pp.waterLines(L.HZ + 4, 720, 40, '#ffffff', { a: .7 })}<ellipse cx="560" cy="${L.HZ + 8}" rx="60" ry="8" fill="#fff8d8" opacity=".6"/></g>`;
    s += `<path d="M-10 ${f(shore(-10))} ${Array.from({ length: 75 }, (_, i) => `L${i * 10} ${f(shore(i * 10))}`).join(' ')}" fill="none" stroke="#f4fff8" stroke-width="5" opacity=".8"/>`;
    for (let i = 0; i < 14; i++) { const y = rr(L.HZ + 12, 705), x = rr(30, W - 30); s += Pp.lilypad(x, y, sc(y), { flower: R() < .35 ? pick(['#ffb8d8', '#ffffff']) : null }); }
    // píer de madeira
    const pier = [[470, 708], [505, 660], [530, 640]];
    for (let i = 0; i < 9; i++) { const t = i / 8, y = 712 - t * 80, m = sc(y), x = 470 + t * 70, w = m * 1.1; s += `<rect x="${f(x - w / 2)}" y="${f(y - m * .1)}" width="${f(w)}" height="${f(m * .12)}" fill="${mix('#b8844a', L.HAZE, L.hazeAt(y))}" stroke="${mix(L.O, L.HAZE, L.hazeAt(y))}" stroke-width="1.5"/>`; if (i % 2 === 0) s += `<rect x="${f(x - w / 2)}" y="${f(y - m * .05)}" width="${f(m * .08)}" height="${f(m * .4)}" fill="#7a5230" stroke="${L.O}" stroke-width="1.2"/><rect x="${f(x + w / 2 - m * .08)}" y="${f(y - m * .05)}" width="${f(m * .08)}" height="${f(m * .4)}" fill="#7a5230" stroke="${L.O}" stroke-width="1.2"/>`; }
    s += `<rect x="0" y="${L.HZ - 6}" width="${W}" height="70" fill="${L.lg([[0, '#ffffff', 0], [.5, '#ffffff', .35], [1, '#ffffff', 0]])}"/>`;
    s += L.patches(60, ['#78ae54', '#9ac466', '#6a9a48', '#8a9a50'], { a: .5 });
    s += L.texture(.1, .85);
    const rd = L.road({ c: '#a8946a', cNear: '#8a744c', w: 2, amp: .5, ph: .3, cx: 360, vx: 120 });
    s += `<g clip-path="${L.clip(`<rect x="-10" y="715" width="${W + 20}" height="${H}"/>`)}">${rd.s}</g>`;
    // poças nos cantos
    s += `<ellipse cx="60" cy="1180" rx="170" ry="48" fill="#4aa0aa" stroke="${L.O}" stroke-width="4"/><ellipse cx="60" cy="1176" rx="150" ry="34" fill="#6ac0c4"/>` + Pp.lilypad(90, 1185, sc(1185), { flower: '#ffb8d8' }) + Pp.frog(70, 1180, sc(1180));
    s += `<ellipse cx="690" cy="1235" rx="150" ry="44" fill="#4aa0aa" stroke="${L.O}" stroke-width="4"/><ellipse cx="690" cy="1231" rx="130" ry="30" fill="#6ac0c4"/>` + Pp.lilypad(660, 1245, sc(1245));
    s += L.scatter(70, (x, y, m) => L.reed(x, y, m, { h: rr(.9, 1.3), n: ri(3, 5) }), { y0: 716, skip: (x, y) => notRoad(rd, .6)(x, y) || unitZone(x, y), minM: 20, pow: .8 });
    s += L.scatter(160, (x, y, m) => L.tuft(x, y, m, '#5a8a3a', '#86b850', { h: .22 }), { y0: 716, skip: notRoad(rd, .1), minM: 6 });
    s += Pp.willow(-40, 900, sc(900), P, { h: 4.6 }) + Pp.willow(770, 880, sc(880), P, { h: 4.4 });
    s += L.rock(640, 760, sc(760), '#8a9a90', { w: .6, moss: '#6ab04a' }) + Pp.log(120, 760, sc(760), { moss: true, l: 1.3 });
    s += L.mushroom(660, 1050, sc(1050), '#c0a060', { h: .22, spots: false }) + L.mushroom(690, 1070, sc(1070), '#c0a060', { h: .16, spots: false });
    s += L.scatter(7, (x, y, m) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(m * .7)}" ry="${f(m * .16)}" fill="#4aa0aa" stroke="${mix(L.O, L.HAZE, L.hazeAt(y))}" stroke-width="${f(L.lwAt(y) * .7)}"/><ellipse cx="${f(x + m * .05)}" cy="${f(y - m * .02)}" rx="${f(m * .55)}" ry="${f(m * .1)}" fill="#7ad0d0"/>`, { y0: 760, y1: 1100, skip: notRoad(rd, .9), minM: 30 });
    s += L.scatter(60, (x, y, m) => L.flower(x, y, m, pick(['#ffe25a', '#ffffff', '#ffd23a'])), { y0: 716, skip: notRoad(rd, .2), minM: 10 });
    s += L.scatter(30, (x, y, m) => L.rock(x, y, m, '#9aa8a0', { w: rr(.1, .2), hr: .5 }), { y0: 716, minM: 10 });
    s += Pp.dragonfly(300, 690) + Pp.dragonfly(560, 760, 1, '#ff8ad0');
    s += L.vignette(.25, '#0a2a2a');
    return L.svgDoc(s);
  },
  picos() {
    L.resetDefs(); L.seed(404); L.setScene({ hz: 600, lx: 1, haze: '#ffc8a0' });
    let s = L.sky([[0, '#d8604a'], [.25, '#ff8a5a'], [.42, '#ffbe84'], [1, '#ffdcae']]);
    s += L.sun(170, 330, 64, '#ffe48a', { glow: '#ffb05a' });
    s += Pp.plume(470, 290, 120, 260, '#8a7078', { drift: .9 }) + Pp.plume(520, 180, 90, 160, '#9a8088', { drift: 1 });
    s += L.mountains(585, [[60, 200, 150], [200, 150, 120], [640, 220, 160], [730, 170, 120]], '#6a4a50', { hz: .38, lw: 2 });
    s += Pp.volcano(470, 590, 230, 285, { hz: .22 });
    const r1 = L.ridge(598, 14, 1.6, .9, '#7a5650', { hz: .22, lw: 2 }); s += r1.s;
    s += L.groundBase('#8a6a5a', '#5a3e36');
    s += L.patches(70, ['#7a5e52', '#9a7a62', '#6a5048', '#a08a7a'], { a: .55 });
    s += L.texture(.16, .9);
    // rio de lava à esquerda
    const lava = L.road({ c: '#ff7a2a', cNear: '#ff6a1a', w: 1.3, amp: .5, ph: 3, cx: -60, vx: 260, ruts: false, edge: '#ffd25a' });
    s += `<path d="${lava.d}" fill="none" stroke="#ffb040" stroke-width="22" opacity=".3"/>` + lava.s;
    s += L.scatter(30, (x, y, m) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(m * .12)}" ry="${f(m * .04)}" fill="#7a3a2a" stroke="${L.O}" stroke-width="1.5"/>`, { skip: (x, y) => !(Math.abs(x - lava.center(y)) < lava.half(y) * .8), minM: 6 });
    // trilha de pedras
    for (const u of [1.05, 1.25, 1.5, 1.85, 2.3, 2.9, 3.7, 4.8, 6.4, 8.8]) { const y = yAt(u), m = sc(y), x = 400 + 70 * (1 - sr(y)) + Math.sin(u) * m * .4; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(m * .45)}" ry="${f(m * .12)}" fill="${mix('#b8a08a', L.HAZE, L.hazeAt(y))}" stroke="${mix(L.O, L.HAZE, L.hazeAt(y))}" stroke-width="${f(L.lwAt(y) * .8)}"/><ellipse cx="${f(x - m * .08)}" cy="${f(y - m * .03)}" rx="${f(m * .28)}" ry="${f(m * .06)}" fill="${mix('#d2bca4', L.HAZE, L.hazeAt(y))}"/>`; }
    const crack = (x, y, m) => `<path d="M${f(x - m * .2)} ${f(y - m * .3)} l${f(m * .1)} ${f(m * .12)} l${f(-m * .05)} ${f(m * .12)}" fill="none" stroke="#ffb040" stroke-width="${f(Math.max(1, m * .03))}" stroke-linecap="round"/>`;
    s += L.scatter(14, (x, y, m) => L.rock(x, y, m, '#4a3e40', { w: rr(.5, 1) }) + crack(x, y, m), { skip: (x, y) => x > 120 && x < 640 && y > 700, minM: 15 });
    s += Pp.deadTree(70, 660, sc(660), { c: '#3a2a2a', h: 3.2 }) + Pp.deadTree(650, 640, sc(640), { c: '#3a2a2a', h: 3 }) + Pp.deadTree(770, 940, sc(940), { c: '#3a2a2a', h: 3.4 });
    s += Pp.plume(600, 735, 26, 70, '#e8dcd8', { drift: .4, lw: 1.5 }) + Pp.plume(150, 820, 34, 90, '#e8dcd8', { drift: .5, lw: 1.5 });
    s += Pp.veins(26, '#ff8a2a') + L.scatter(10, (x, y, m) => L.rock(x, y, m, '#5a4a48', { w: rr(.3, .6) }), { y0: 640, y1: 740, minM: 6 }) + L.scatter(7, (x, y, m) => L.crystal(x, y, m, '#3a2a3a', { h: rr(.4, .7), glow: false }), { skip: unitZone, minM: 14 });
    s += L.scatter(90, (x, y, m) => L.tuft(x, y, m, '#8a6a3a', '#b0904a', { h: .16 }), { skip: (x, y) => Math.abs(x - lava.center(y)) < lava.half(y) * 1.3, minM: 8 });
    s += L.rock(-10, 1080, sc(1080), '#4a3e40', { w: 1.1 }) + crack(-10, 1080, sc(1080)) + L.rock(720, 1140, sc(1140), '#4a3e40', { w: 1.2 }) + crack(720, 1140, sc(1140));
    s += Pp.embers(60, 200, 1250, '#ffb040');
    s += L.vignette(.35, '#2a0a04');
    return L.svgDoc(s);
  },
  costa() {
    L.resetDefs(); L.seed(505); L.setScene({ hz: 570, lx: -1, haze: '#d8f0ff' });
    let s = L.sky([[0, '#2f9ee8'], [.3, '#78ccf8'], [.43, '#cdeeff'], [1, '#e6f8ff']]);
    s += L.sun(140, 170, 46, '#fff6b0', { glow: '#fff8d0' });
    s += L.cloud(440, 230, 230) + L.cloud(650, 140, 150) + L.cloud(250, 420, 120, { c: '#f6fcff' }) + Pp.gull(380, 300, 14) + Pp.gull(420, 330, 10) + Pp.gull(560, 390, 12);
    // falésia com farol
    s += `<path d="M-20 ${L.HZ + 5} L-20 430 Q40 400 90 420 L150 470 Q170 530 210 ${L.HZ + 5} Z" fill="${mix('#c8a078', L.HAZE, .3)}" stroke="${mix(L.O, L.HAZE, .4)}" stroke-width="2.5" stroke-linejoin="round"/><path d="M90 420 L150 470 Q170 530 210 ${L.HZ + 5} L120 ${L.HZ + 5} Z" fill="${mix('#a07a58', L.HAZE, .3)}"/><path d="M-20 430 Q40 400 90 420 L150 470 L-20 470 Z" fill="${mix('#7ac25a', L.HAZE, .3)}" stroke="${mix(L.O, L.HAZE, .4)}" stroke-width="2"/>`;
    s += Pp.lighthouse(60, 425, 120, { hz: .25 });
    // mar
    const shore = x => 730 + Math.sin(x / 110 + 1) * 16 + Math.sin(x / 41) * 6;
    let sd = `M-10 ${L.HZ} L${W + 10} ${L.HZ} `; for (let x = W + 10; x >= -10; x -= 10) sd += `L${x} ${f(shore(x))} `; sd += 'Z';
    s += L.groundBase('#f4dca2', '#e6c282');
    s += `<path d="${sd}" fill="${L.lg([[0, '#8ad2f6'], [.15, '#3aa6e4'], [.7, '#2ab8d8'], [1, '#6ae0dc']], 0, L.HZ, 0, 750, true)}"/>`;
    s += `<g clip-path="${L.clip(`<path d="${sd}"/>`)}">${Pp.waterLines(L.HZ + 4, 740, 70, '#ffffff', { a: .8 })}</g>`;
    s += Pp.boat(520, L.HZ + 18, 40, { sail: true, l: 1.4 });
    // espuma da beira
    s += `<path d="M-10 ${f(shore(-10) + 6)} ${Array.from({ length: 75 }, (_, i) => `L${i * 10} ${f(shore(i * 10) + 6)}`).join(' ')} L${W + 10} ${f(shore(W) + 34)} L-10 ${f(shore(0) + 34)} Z" fill="#d8bc84" opacity=".55"/>`;
    s += `<path d="M-10 ${f(shore(-10))} ${Array.from({ length: 75 }, (_, i) => `L${i * 10} ${f(shore(i * 10) + (i % 3 === 0 ? 4 : 0))}`).join(' ')}" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += L.patches(50, ['#f8e4b0', '#e8c888', '#f2d498'], { a: .6, min: 1, max: 3 });
    s += L.texture(.08, 1.1);
    s += L.scatter(40, (x, y, m) => `<path d="M${f(x - m * .5)} ${f(y)} q${f(m * .25)} ${f(-m * .06)} ${f(m * .5)} 0 t${f(m * .5)} 0" fill="none" stroke="#d2b07a" stroke-width="${f(Math.max(1, m * .02))}" stroke-linecap="round"/>`, { y0: 760, minM: 10 });
    s += L.scatter(16, (x, y, m) => Pp.shell(x, y, m, pick(['#ffb8a0', '#ffe2c8', '#f8a0b8'])), { y0: 760, minM: 25 });
    s += L.scatter(8, (x, y, m) => Pp.starfish(x, y, m, pick(['#ff8a5a', '#ff6a8a'])), { y0: 790, minM: 30 });
    s += L.scatter(14, (x, y, m) => L.crystal(x, y, m, pick(['#7ae8e0', '#ffb0d8', '#a8d8ff']), { h: rr(.18, .3), glow: false }), { y0: 770, minM: 30 });
    s += L.palm(250, 690, sc(690), { h: 4.2, dir: -1 }) + L.palm(640, 712, sc(712), { h: 4.4, dir: -1 }) + L.palm(-40, 1010, sc(1010), { h: 4.4, dir: 1 }) + L.palm(765, 975, sc(975), { h: 4.2, dir: -1 });
    s += L.rock(640, 800, sc(800), '#a89a8a', { w: .7 }) + L.rock(90, 830, sc(830), '#a89a8a', { w: .5 }) + Pp.boat(680, 1150, sc(1150), { l: 1.6, c: '#c0784a' });
    s += Pp.log(40, 1230, sc(1230), { l: 1.4 });
    s += L.scatter(30, (x, y, m) => L.tuft(x, y, m, '#8ab84a', '#b8d860', { h: .26 }), { y0: 800, skip: (x, y) => x > 90 && x < 630, minM: 12 });
    s += L.vignette(.2, '#0a2a40');
    return L.svgDoc(s);
  },

  deserto() {
    L.resetDefs(); L.seed(606); L.setScene({ hz: 600, lx: 1, haze: '#ffe0b4' });
    let s = L.sky([[0, '#ff8f52'], [.25, '#ffb070'], [.43, '#ffd69c'], [1, '#fff0cc']]);
    s += L.sun(540, 250, 70, '#fff3a0', { glow: '#ffd27a' });
    for (const [x, y, w] of [[150, 200, 260], [420, 120, 200], [600, 400, 180]]) s += `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="10" fill="#fff4dc" opacity=".55"/>`;
    s += Pp.pyramid(165, 590, 130, 160, { hz: .42 }) + Pp.pyramid(300, 594, 80, 96, { hz: .48 }) + Pp.pyramid(610, 592, 60, 70, { hz: .55 });
    const r1 = L.ridge(588, 30, .8, 1, '#f0b066', { hz: .32, lw: 2 }); s += r1.s;
    const r2 = L.ridge(600, 16, 1.3, 2.5, '#f2bc72', { hz: .18, lw: 2 }); s += r2.s;
    s += L.groundBase('#f6cc84', '#e2a35a');
    s += L.patches(70, ['#f8d898', '#e8b06a', '#f0c27a', '#dca060'], { a: .55 });
    s += L.texture(.1, 1);
    s += L.scatter(70, (x, y, m) => `<path d="M${f(x - m * .7)} ${f(y)} q${f(m * .35)} ${f(-m * .08)} ${f(m * .7)} 0 t${f(m * .7)} 0" fill="none" stroke="#c8884a" stroke-width="${f(Math.max(1, m * .022))}" stroke-linecap="round" opacity=".7"/>`, { minM: 8 });
    const rd = L.road({ c: '#dcbc86', cNear: '#c89e66', w: 2.4, amp: .4, ph: .8, cx: 360, vx: -110, edge: '#a87a48' });
    s += rd.s;
    for (const u of [1.1, 1.3, 1.55, 1.9, 2.3, 2.85, 3.6, 4.6, 6, 8.2, 11]) { const y = yAt(u); s += `<path d="M${f(rd.center(y) - rd.half(y))} ${f(y)} L${f(rd.center(y) + rd.half(y))} ${f(y)}" stroke="#a87a48" stroke-width="${f(Math.max(1, L.lwAt(y) * .7))}" opacity=".8"/>`; }
    s += L.scatter(20, (x, y, m) => `<path d="M${f(x - m * .4)} ${f(y)} q${f(m * .4)} ${f(-m * .25)} ${f(m * .8)} 0 z" fill="#e6b46e" stroke="${L.O}" stroke-width="${f(Math.max(1, m * .015))}"/>`, { skip: (x, y) => !notRoad(rd, -.15)(x, y), minM: 12 });
    s += Pp.column(70, 700, sc(700), { h: 3, broken: true }) + Pp.column(150, 660, sc(660), { h: 3.4 }) + Pp.column(620, 680, sc(680), { h: 2.4, broken: true }) + Pp.column(690, 720, sc(720), { h: 3.2 });
    s += L.cactus(560, 650, sc(650), { h: 2, flower: '#ff6aa0' }) + L.cactus(250, 640, sc(640), { h: 1.6 }) + L.cactus(-20, 1020, sc(1020), { h: 2.2, flower: '#ffd23a' }) + L.cactus(745, 960, sc(960), { h: 2.4 });
    s += Pp.bones(600, 800, sc(800)) + L.rock(100, 780, sc(780), '#c8986a', { w: .5 });
    s += L.scatter(10, (x, y, m) => L.crystal(x, y, m, '#ffa53a', { h: rr(.3, .55) }), { skip: (x, y) => unitZone(x, y) || notRoad(rd, .2)(x, y), minM: 14 });
    s += L.scatter(50, (x, y, m) => L.tuft(x, y, m, '#a8a050', '#c8c070', { h: .16 }), { skip: notRoad(rd, .1), minM: 8 });
    s += L.rock(700, 1220, sc(1220), '#c8986a', { w: 1 }) + Pp.column(20, 1300, sc(1300), { h: 1.2, broken: true });
    s += L.vignette(.25, '#3a1a04');
    return L.svgDoc(s);
  },
  pantano() {
    L.resetDefs(); L.seed(707); L.setScene({ hz: 610, lx: -1, haze: '#6a5a9e' });
    let s = L.sky([[0, '#161238'], [.3, '#36286a'], [.45, '#6a4a90'], [1, '#8a6aa8']]);
    s += Pp.stars(80, 560, { big: 7 });
    s += L.sun(200, 210, 58, '#fff6d8', { glow: '#d8c8ff', craters: true });
    s += L.cloud(500, 260, 220, { c: '#6a5a9a', shade: '#3e2e70' }) + L.cloud(640, 420, 130, { c: '#6a5a9a', shade: '#3e2e70' });
    const r1 = L.ridge(604, 26, 1, 1.2, '#3a3064', { hz: .25, lw: 2 }); s += r1.s;
    for (const x of [60, 150, 470, 560, 670]) s += Pp.deadTree(x, r1.Y(x) + 6, 9, { c: '#2a2448', h: rr(4, 6), moss: '#4a5a5a' });
    s += L.groundBase('#3c5a50', '#263c34');
    // lagoa ao fundo com reflexo da lua
    const shore = x => 700 + Math.sin(x / 80) * 12;
    let ld = `M-10 ${L.HZ - 1} L${W + 10} ${L.HZ - 1} `; for (let x = W + 10; x >= -10; x -= 10) ld += `L${x} ${f(shore(x))} `; ld += 'Z';
    s += `<path d="${ld}" fill="${L.lg([[0, '#8a7ac0'], [.3, '#3e3a7a'], [1, '#2a2a5a']], 0, L.HZ, 0, 710, true)}"/>`;
    s += `<g clip-path="${L.clip(`<path d="${ld}"/>`)}">` + Array.from({ length: 9 }, (_, i) => `<rect x="${f(200 - 40 + i * 4 + rr(-10, 10))}" y="${f(L.HZ + 4 + i * 10)}" width="${f(80 - i * 6)}" height="5" rx="2.5" fill="#fff6d8" opacity="${f(.8 - i * .07)}"/>`).join('') + Pp.waterLines(L.HZ + 4, 700, 25, '#b8a8ff', { a: .5 }) + '</g>';
    for (let i = 0; i < 9; i++) { const y = rr(L.HZ + 15, 695), x = rr(30, W - 30); s += Pp.lilypad(x, y, sc(y), { c: '#3f8a5a', flower: R() < .5 ? '#9affe8' : null }); }
    s += `<rect x="0" y="${L.HZ - 10}" width="${W}" height="90" fill="${L.lg([[0, '#c8b8ff', 0], [.5, '#c8b8ff', .3], [1, '#c8b8ff', 0]])}"/>`;
    s += L.patches(60, ['#46665a', '#344e46', '#4a4a6a', '#3e5e52'], { a: .55 });
    s += L.texture(.14, .9);
    const rd = L.road({ c: '#5e5e50', cNear: '#4a4a3e', w: 2, amp: .6, ph: 1.5, cx: 360, vx: 60, edge: '#3a3a30' });
    s += `<g clip-path="${L.clip(`<rect x="-10" y="703" width="${W + 20}" height="${H}"/>`)}">${rd.s}</g>`;
    const glowM = (x, y, m) => L.mushroom(x, y, m, pick(['#7ae8ff', '#c08aff']), { h: rr(.18, .3), glow: '#7ae8ff', spot: '#e8ffff' });
    s += L.scatter(20, glowM, { y0: 705, skip: (x, y) => notRoad(rd, .3)(x, y), minM: 14, pow: .9 });
    s += L.scatter(40, (x, y, m) => L.reed(x, y, m, { c: '#4a6a4a', h: rr(.9, 1.2) }), { y0: 705, skip: (x, y) => unitZone(x, y) || notRoad(rd, .5)(x, y), minM: 16 });
    s += L.scatter(110, (x, y, m) => L.tuft(x, y, m, '#2e4a3a', '#4a6a4a', { h: .2 }), { y0: 705, skip: notRoad(rd, .1), minM: 6 });
    s += Pp.deadTree(-40, 960, sc(960), { c: '#2e2840', h: 4.4, moss: '#5a7a6a' }) + Pp.deadTree(770, 920, sc(920), { c: '#2e2840', h: 4.2, moss: '#5a7a6a' }) + Pp.deadTree(110, 720, sc(720), { c: '#2e2840', h: 3.4, moss: '#5a7a6a' }) + Pp.deadTree(640, 715, sc(715), { c: '#2e2840', h: 3, moss: '#5a7a6a' });
    s += Pp.lantern(rd.center(760) + rd.half(760) + .5 * sc(760), 760, sc(760), { light: '#9affc8' }) + Pp.lantern(rd.center(1000) - rd.half(1000) - .5 * sc(1000), 1000, sc(1000), { light: '#9affc8' });
    s += `<ellipse cx="80" cy="1200" rx="170" ry="46" fill="#2a2a5a" stroke="${L.O}" stroke-width="4"/><ellipse cx="80" cy="1196" rx="150" ry="32" fill="#3e3a7a"/>` + Pp.lilypad(110, 1205, sc(1205), { c: '#3f8a5a', flower: '#9affe8' }) + glowM(660, 1250, sc(1250));
    s += Pp.embers(45, 300, 1250, '#d8ff7a');
    s += L.vignette(.45, '#0a0420');
    return L.svgDoc(s);
  },
  cume() {
    L.resetDefs(); L.seed(808); L.setScene({ hz: 600, lx: -1, haze: '#d2deef' });
    const P = { leaf: '#3f7a6a', bark: '#5a4232', pine: '#2f6a5e' };
    let s = L.sky([[0, '#33415f'], [.3, '#566a90'], [.45, '#a8bcd8'], [1, '#dce6f4']]);
    s += L.mountains(588, [[70, 270, 180], [290, 340, 220], [520, 310, 200], [705, 250, 170]], '#6a7ea6', { hz: .28, snow: '#ffffff', snowH: .45, lw: 2 });
    s += L.cloud(150, 230, 420, { c: '#7484a2', shade: '#3e4a68', n: 11, k: .62 }) + L.cloud(560, 170, 400, { c: '#7484a2', shade: '#3e4a68', n: 11, k: .62 }) + L.cloud(380, 340, 300, { c: '#8a98b4', shade: '#4e5a78', n: 9, k: .6 }) + L.cloud(660, 420, 180, { c: '#8a98b4', shade: '#4e5a78', n: 7, k: .6 });
    s += Pp.lightning(560, 250, 250);
    const r1 = L.ridge(598, 20, 1.2, .4, '#e6eefa', { hz: .15, lw: 2 }); s += r1.s;
    s += treeLine(r1, -10, 160, 30, P, { pine: true, m: 8, hz: .25 }) + treeLine(r1, 560, 730, 30, P, { pine: true, m: 8, hz: .25 });
    s += L.groundBase('#eef4fc', '#ccd9ec');
    s += L.patches(70, ['#dfe8f6', '#c2d2ea', '#ffffff', '#b8c8e2'], { a: .6 });
    s += L.texture(.06, 1);
    const rd = L.road({ c: '#b8c8e0', cNear: '#9cb0cc', w: 2, amp: .7, ph: 2, cx: 360, vx: -60, edge: '#8aa0c0' });
    s += rd.s;
    s += L.scatter(26, (x, y, m) => `<path d="M${f(x - m * .8)} ${f(y)} A${f(m * .8)} ${f(m * .2)} 0 0 1 ${f(x + m * .8)} ${f(y)} Z" fill="#ffffff" stroke="${mix(L.O, L.HAZE, L.hazeAt(y) * .9)}" stroke-width="${f(L.lwAt(y) * .6)}"/><path d="M${f(x + m * .1)} ${f(y - m * .17)} A${f(m * .7)} ${f(m * .17)} 0 0 1 ${f(x + m * .75)} ${f(y - 1)}" fill="none" stroke="#c4d4ec" stroke-width="${f(Math.max(1, m * .05))}"/>`, { skip: notRoad(rd, .3), minM: 10 });
    for (const [x, y, h] of [[40, 650, 5], [120, 632, 4.4], [610, 640, 4.8], [690, 662, 5.2], [250, 612, 3.6], [530, 615, 4]].sort((a, b) => a[1] - b[1])) s += L.pine(x, y, sc(y), P, { h, snow: true });
    s += L.scatter(9, (x, y, m) => L.crystal(x, y, m, '#9ae0ff', { h: rr(.35, .6) }), { skip: (x, y) => unitZone(x, y) || notRoad(rd, .2)(x, y), minM: 12 });
    s += L.rock(640, 760, sc(760), '#8a9ab8', { w: .6, moss: '#ffffff' }) + L.rock(80, 790, sc(790), '#8a9ab8', { w: .5, moss: '#ffffff' });
    s += L.pine(-50, 990, sc(990), P, { h: 5.4, snow: true }) + L.pine(775, 960, sc(960), P, { h: 5.6, snow: true });
    s += L.rock(690, 1230, sc(1230), '#8a9ab8', { w: 1, moss: '#ffffff' });
    for (let i = 0; i < 10; i++) { const x = rr(-50, W), y = rr(300, 1100), w = rr(60, 160); s += `<path d="M${f(x)} ${f(y)} q${f(w * .5)} ${f(-12)} ${f(w)} ${f(-4)}" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".45" stroke-linecap="round"/>`; }
    s += L.scatter(14, (x, y, m) => L.bush(x, y, m, '#e8f0fa', { w: rr(.6, 1), n: 4 }), { y1: 760, skip: (x, y) => notRoad(rd, .3)(x, y), minM: 6 });
    s += L.scatter(10, (x, y, m) => L.rock(x, y, m, '#7a8aa8', { w: rr(.3, .7), moss: '#ffffff' }), { y1: 745, minM: 5 });
    for (const u of [1.15, 1.35, 1.6, 1.9, 2.3, 2.8, 3.5, 4.4, 5.6]) { const y = yAt(u), m = sc(y); for (const k of [-1, 1]) s += `<ellipse cx="${f(rd.center(y) + k * m * .12 + (u * 7 % 2) * m * .05)}" cy="${f(y + k * m * .03)}" rx="${f(m * .05)}" ry="${f(m * .02)}" fill="#8aa0c0" opacity=".7"/>`; }
    s += Pp.snowfall(150, 0, H);
    s += L.vignette(.3, '#0a1430');
    return L.svgDoc(s);
  },
  recife() {
    L.resetDefs(); L.seed(909); L.setScene({ hz: 620, lx: -1, haze: '#3fa8c4' });
    let s = L.sky([[0, '#8ae6f2'], [.07, '#44b8d6'], [.38, '#2a86b8'], [.47, '#3a9cc0'], [1, '#3a9cc0']]);
    for (let i = 0; i < 6; i++) s += `<path d="M-20 ${f(18 + i * 9)} q60 -10 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" fill="none" stroke="#e8ffff" stroke-width="3" opacity="${f(.5 - i * .07)}"/>`;
    s += L.rays(360, -60, 9, 1200, '#e8ffff', .22, 1.4);
    const r1 = L.ridge(612, 70, .7, 1.6, '#2e7f9e', { hz: .5, lw: 2 }); s += r1.s;
    s += `<path d="M430 ${f(r1.Y(430) + 4)} Q470 470 520 470 Q570 470 600 ${f(r1.Y(600) + 4)} L570 ${f(r1.Y(570))} Q540 520 520 520 Q495 520 470 ${f(r1.Y(470))} Z" fill="${mix('#2a7090', L.HAZE, .4)}" stroke="${mix(L.O, L.HAZE, .5)}" stroke-width="2"/>`;
    for (let g = 0; g < 3; g++) { const gx = rr(80, 640), gy = rr(260, 520), c = pick(['#ffd25a', '#ff9a4a', '#9ae8ff']); for (let i = 0; i < 6; i++) s += Pp.fish(gx + rr(-40, 40), gy + rr(-25, 25), rr(7, 10), mix(c, L.HAZE, .45), g % 2 ? 1 : -1); }
    s += L.groundBase('#e8dca6', '#d2bc86');
    s += L.patches(50, ['#f2e6b8', '#d8c48c', '#e2d09a'], { a: .6 });
    s += L.texture(.08, 1);
    s += Pp.caustics(80, '#ffffff', .3);
    s += L.scatter(40, (x, y, m) => `<path d="M${f(x - m * .6)} ${f(y)} q${f(m * .3)} ${f(-m * .06)} ${f(m * .6)} 0 t${f(m * .6)} 0" fill="none" stroke="#c0a870" stroke-width="${f(Math.max(1, m * .02))}" stroke-linecap="round"/>`, { minM: 8 });
    const cc = ['#ff7aa0', '#ff9a4a', '#b07aff', '#ff5a6a', '#ffd25a', '#5ad8b0'];
    s += L.scatter(30, (x, y, m) => Pp.coral(x, y, m, pick(cc), { type: pick(['branch', 'brain', 'fan']), h: rr(.6, 1.1) }), { y1: 735, minM: 6 });
    s += L.scatter(14, (x, y, m) => Pp.coral(x, y, m, pick(cc), { type: pick(['branch', 'brain', 'fan']), h: rr(.6, 1) }), { y0: 735, y1: 1120, skip: unitZone, minM: 10 });
    s += L.scatter(10, (x, y, m) => Pp.seaweed(x, y, m, { h: rr(1.2, 2), c: pick(['#3fae6a', '#5ac87a']) }), { y0: 640, y1: 725, minM: 8 });
    s += Pp.seaweed(-30, 1000, sc(1000), { h: 2.4, n: 3 }) + Pp.seaweed(750, 980, sc(980), { h: 2.5, n: 3 });
    s += Pp.coral(110, 1290, sc(1290), '#ff7aa0', { type: 'fan', h: .45 }) + Pp.coral(560, 1300, sc(1300), '#b07aff', { type: 'branch', h: .45 });
    s += L.scatter(14, (x, y, m) => Pp.shell(x, y, m, pick(['#ffb8a0', '#ffe2c8', '#f8a0b8'])), { y0: 740, minM: 25 });
    s += L.scatter(6, (x, y, m) => Pp.starfish(x, y, m, pick(['#ff8a5a', '#ff6a8a', '#ffd25a'])), { y0: 760, minM: 30 });
    s += Pp.chest(670, 1180, sc(1180)) + L.rock(60, 1150, sc(1150), '#6a8a9a', { w: .9, moss: '#ff8ab0' });
    s += Pp.fish(150, 470, 22, '#ffb040', 1) + Pp.fish(560, 540, 18, '#ff6a8a', -1) + Pp.fish(620, 420, 14, '#5ad8ff', -1);
    s += Pp.bubbles(28);
    s += L.vignette(.4, '#04203a');
    return L.svgDoc(s);
  },
  coracao() {
    L.resetDefs(); L.seed(1010); L.setScene({ hz: 600, lx: -1, haze: '#ead8ff' });
    let s = L.sky([[0, '#4a2e8e'], [.25, '#8256bc'], [.42, '#e2a8e2'], [1, '#ffe2f2']]);
    s += Pp.aurora(140, ['#7affd8', '#ff9ae0', '#9ad8ff'], .32);
    s += Pp.stars(30, 420, { big: 6 });
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .22; s += `<path d="M360 470 L${f(360 + Math.cos(a - .05) * 700)} ${f(470 + Math.sin(a - .05) * 700)} L${f(360 + Math.cos(a + .05) * 700)} ${f(470 + Math.sin(a + .05) * 700)} Z" fill="${L.lg([[0, '#fff6ff', .5], [1, '#fff6ff', 0]], 0, 1, 0, 0)}"/>`; }
    const r1 = L.ridge(596, 22, 1.3, .5, '#b89ae0', { hz: .3, lw: 2 }); s += r1.s;
    s += L.crystal(360, 598, 150, '#e8b8ff', { h: 1.9, hz: .15 }) + L.crystal(250, 596, 70, '#9ad8ff', { h: 1.5, hz: .25 }) + L.crystal(480, 597, 80, '#ff9ae0', { h: 1.4, hz: .25 });
    for (const [x, y, r] of [[120, 300, 18], [600, 260, 22], [200, 470, 12], [540, 430, 14]]) s += `<circle cx="${x}" cy="${y}" r="${r * 2.5}" fill="${L.rg([[0, '#fff0ff', .5], [1, '#fff0ff', 0]])}"/><polygon points="${x},${y - r} ${x + r * .6},${y} ${x},${y + r * 1.2} ${x - r * .6},${y}" fill="#f0d0ff" stroke="${L.O}" stroke-width="2.5"/><polygon points="${x},${y - r} ${x + r * .6},${y} ${x},${y + r * 1.2}" fill="#c8a0f0"/>`;
    s += L.groundBase('#dcc4f2', '#a888d8');
    s += L.patches(60, ['#e8d4ff', '#c8a8ee', '#f2c8f0', '#b898e4'], { a: .55 });
    s += L.texture(.07, 1);
    s += Pp.veins(30, '#ff9ae8');
    const rd = L.road({ c: '#f4e8ff', cNear: '#e2ccff', w: 2.2, amp: .4, ph: .5, cx: 360, vx: 0, ruts: false, edge: '#c8a0ff' });
    s += `<path d="${rd.d}" fill="none" stroke="#ffffff" stroke-width="14" opacity=".35"/>` + rd.s;
    for (const u of [1.1, 1.35, 1.7, 2.2, 2.9, 3.9, 5.4, 7.8]) { const y = yAt(u); s += `<path d="M${f(rd.center(y) - rd.half(y))} ${f(y)} L${f(rd.center(y) + rd.half(y))} ${f(y)}" stroke="#c8a0ff" stroke-width="${f(Math.max(1, L.lwAt(y) * .6))}"/>`; }
    const cc = ['#9ad8ff', '#ff9ae0', '#c8a0ff', '#8affd8', '#ffe08a'];
    s += L.scatter(14, (x, y, m) => L.crystal(x, y, m, pick(cc), { h: rr(.5, 1) }), { y1: 735, skip: (x, y) => Math.abs(x - 360) < 90, minM: 6 });
    s += L.scatter(10, (x, y, m) => L.crystal(x, y, m, pick(cc), { h: rr(.6, 1.1) }), { y0: 735, skip: (x, y) => unitZone(x, y) || notRoad(rd, .2)(x, y), minM: 10 });
    s += L.scatter(40, (x, y, m) => L.flower(x, y, m, pick(['#ffffff', '#ffd2f6', '#c8f0ff'])), { skip: notRoad(rd, .2), minM: 10 });
    s += L.crystal(-20, 1000, sc(1000), '#c8a0ff', { h: 1.8 }) + L.crystal(740, 980, sc(980), '#9ad8ff', { h: 1.9 });
    s += Pp.embers(50, 200, 1250, '#fff0ff');
    s += L.vignette(.3, '#2a0a4a');
    return L.svgDoc(s);
  },
  abismo() {
    L.resetDefs(); L.seed(1111); L.setScene({ hz: 610, lx: 1, haze: '#343468' });
    let s = L.sky([[0, '#08081a'], [.3, '#161634'], [.45, '#262652'], [1, '#262652']]);
    s += L.glow(360, 560, 360, '#4ad8ff', .55);
    s += L.mountains(606, [[40, 200, 90], [160, 150, 70], [260, 230, 80], [470, 210, 90], [580, 160, 70], [690, 220, 90]], '#262648', { hz: .3, lw: 2, shade: .35 });
    s += Pp.stalactites(22, '#1a1a36', 0, { oc: '#06060f' });
    s += `<path d="M-20 0 L120 0 Q90 200 140 400 Q100 520 150 ${L.HZ + 20} L-20 ${L.HZ + 20} Z" fill="#14142c" stroke="#06060f" stroke-width="4"/><path d="M${W + 20} 0 L600 0 Q640 220 590 380 Q640 520 580 ${L.HZ + 20} L${W + 20} ${L.HZ + 20} Z" fill="#14142c" stroke="#06060f" stroke-width="4"/>`;
    s += L.groundBase('#3a3a62', '#24243c');
    s += L.patches(60, ['#44446c', '#2e2e4a', '#3a3a62', '#4a3a6a'], { a: .55 });
    s += L.texture(.15, .9);
    s += Pp.veins(22, '#4ad8ff');
    const rd = L.road({ c: '#4a4a72', cNear: '#3a3a5c', w: 2, amp: .5, ph: 2.2, cx: 360, vx: 0, edge: '#6a6aa8' });
    s += rd.s;
    const stal = (x, y, m) => { const hz = L.hazeAt(y), c = mix('#3a3a5e', L.HAZE, hz), oc = mix(L.O, L.HAZE, hz * .8), h = m * rr(1.4, 2.4), w = m * .5; return L.shadowEll(x, y, w * .7, w * .15, .3) + `<path d="M${f(x - w / 2)} ${f(y)} L${f(x - w * .1)} ${f(y - h)} L${f(x + w * .15)} ${f(y - h * .85)} L${f(x + w / 2)} ${f(y)} Z" fill="${c}" stroke="${oc}" stroke-width="${f(L.lwAt(y))}" stroke-linejoin="round"/><path d="M${f(x - w * .1)} ${f(y - h)} L${f(x + w * .15)} ${f(y - h * .85)} L${f(x + w / 2)} ${f(y)} L${f(x + w * .05)} ${f(y)} Z" fill="${dk(c, .3)}"/>`; };
    s += L.scatter(10, stal, { y1: 740, minM: 6, skip: (x, y) => Math.abs(x - 360) < 80 });
    const cc = ['#4ad8ff', '#a87aff', '#6affd0'];
    s += L.scatter(12, (x, y, m) => L.crystal(x, y, m, pick(cc), { h: rr(.5, 1) }), { y1: 740, minM: 6 });
    s += L.scatter(10, (x, y, m) => L.crystal(x, y, m, pick(cc), { h: rr(.6, 1.2) }), { y0: 740, skip: (x, y) => unitZone(x, y) || notRoad(rd, .2)(x, y), minM: 10 });
    s += L.scatter(14, (x, y, m) => L.mushroom(x, y, m, pick(['#4ad8ff', '#a87aff']), { h: rr(.18, .28), glow: '#4ad8ff', spot: '#e8ffff' }), { skip: notRoad(rd, .3), minM: 14 });
    s += `<ellipse cx="620" cy="790" rx="70" ry="14" fill="#2a8ab0" stroke="#06060f" stroke-width="3"/><ellipse cx="620" cy="788" rx="60" ry="9" fill="#5ae0ff" opacity=".7"/>`;
    s += stal(-20, 1000, sc(1000)) + stal(745, 980, sc(980)) + L.crystal(700, 1230, sc(1230), '#a87aff', { h: .9 });
    s += Pp.embers(40, 200, 1250, '#8ae8ff');
    s += L.vignette(.45, '#000010');
    return L.svgDoc(s);
  },
  estelar() {
    L.resetDefs(); L.seed(1212); L.setScene({ hz: 600, lx: -1, haze: '#4a3a8a' });
    let s = L.sky([[0, '#0a0a28'], [.3, '#1e1450'], [.45, '#4a2a7a'], [1, '#6a4a9a']]);
    s += Pp.nebula(190, 260, 280, '#ff6ad8', .32) + Pp.nebula(520, 180, 320, '#5ab8ff', .32) + Pp.nebula(420, 440, 240, '#b07aff', .3);
    s += Pp.stars(170, 600, { big: 14 });
    let cl = ''; const cst = [[90, 140], [150, 110], [210, 150], [250, 220], [310, 200]]; cst.forEach((p, i) => { if (i) cl += `<path d="M${cst[i - 1][0]} ${cst[i - 1][1]} L${p[0]} ${p[1]}" stroke="#bfe0ff" stroke-width="1.5" opacity=".5"/>`; cl += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#fff"/>`; }); s += cl;
    s += Pp.planet(560, 260, 66, '#ff9a6a', { ring: '#ffd8a0' }) + Pp.planet(130, 400, 26, '#9ad8ff');
    s += Pp.island(150, 500, 92, { rock: '#5a4a8a', grass: '#7ad0a0', tree: true, leaf: '#5ac0a0' }) + Pp.island(600, 530, 70, { rock: '#5a4a8a', grass: '#ffd08a' }) + Pp.island(380, 420, 40, { rock: '#4a3a7a', grass: '#7ad0a0' });
    const r1 = L.ridge(598, 14, 1.4, .8, '#3a2a6a', { hz: .2, lw: 2 }); s += r1.s;
    s += L.groundBase('#3c2c70', '#22164a');
    s += L.patches(60, ['#4a3a8a', '#2e2260', '#5a4a9a'], { a: .55 });
    s += L.scatter(160, (x, y, m) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(.8, m * .012))}" fill="#fff6e0" opacity=".85"/>`, { minM: 2 });
    s += L.scatter(20, (x, y, m) => `<path d="M${f(x)} ${f(y - m * .06)} L${f(x + m * .015)} ${f(y - m * .015)} L${f(x + m * .06)} ${f(y)} L${f(x + m * .015)} ${f(y + m * .015)} L${f(x)} ${f(y + m * .06)} L${f(x - m * .015)} ${f(y + m * .015)} L${f(x - m * .06)} ${f(y)} L${f(x - m * .015)} ${f(y - m * .015)} Z" fill="#fff6c8"/>`, { minM: 20 });
    const rd = L.road({ c: '#8a7ad8', cNear: '#6a5ac0', w: 2, amp: .6, ph: .5, cx: 360, vx: 40, ruts: false, edge: '#c8b8ff' });
    s += `<path d="${rd.d}" fill="none" stroke="#c8b8ff" stroke-width="16" opacity=".3"/>` + rd.s;
    s += L.scatter(12, (x, y, m) => L.crystal(x, y, m, pick(['#ffe08a', '#ffd25a', '#fff0b0']), { h: rr(.4, .9) }), { skip: (x, y) => unitZone(x, y) || notRoad(rd, .2)(x, y), minM: 8 });
    s += L.crystal(-20, 1010, sc(1010), '#ffe08a', { h: 1.7 }) + L.crystal(745, 990, sc(990), '#c8b8ff', { h: 1.8 });
    s += Pp.embers(40, 150, 1250, '#fff6c8');
    s += L.vignette(.4, '#05021a');
    return L.svgDoc(s);
  },
  arena() {
    L.resetDefs(); L.seed(1313); L.setScene({ hz: 565, lx: -1, haze: '#ffe8cc' });
    let s = L.sky([[0, '#3ea2ea'], [.3, '#86ccf8'], [.42, '#d4eeff'], [1, '#d4eeff']]);
    s += L.cloud(150, 170, 230) + L.cloud(540, 120, 180) + L.cloud(620, 290, 120);
    s += Pp.colosseum(L.HZ + 4, { h: 250, hz: .1 });
    s += `<rect x="-10" y="${L.HZ - 24}" width="${W + 20}" height="34" fill="#c8a070" stroke="${L.O}" stroke-width="3"/>` + Array.from({ length: 18 }, (_, i) => `<path d="M${i * 42} ${L.HZ - 24} v34" stroke="#a07a4a" stroke-width="2"/>`).join('');
    s += L.groundBase('#f2dcae', '#dcb47c');
    s += L.patches(60, ['#f8e6c0', '#e2c08a', '#eacc96'], { a: .55 });
    s += L.texture(.1, 1);
    for (const k of [1, .72]) { const y = 930, m = sc(y); s += `<ellipse cx="360" cy="${y}" rx="${f(m * 3.3 * k)}" ry="${f(m * 3.3 * k * .3)}" fill="none" stroke="#ffffff" stroke-width="${f(m * .05)}" opacity=".7" stroke-dasharray="${k < 1 ? f(m * .3) + ' ' + f(m * .2) : 'none'}"/>`; }
    s += `<ellipse cx="360" cy="930" rx="${f(sc(930) * .5)}" ry="${f(sc(930) * .15)}" fill="#e8b45a" opacity=".5"/>`;
    s += L.scatter(30, (x, y, m) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(m * .08)}" ry="${f(m * .03)}" fill="#c89a62"/>`, { minM: 8 });
    s += Pp.banner(70, 640, sc(640), '#e05a4a') + Pp.banner(640, 640, sc(640), '#4a8ae0') + Pp.torch(150, 610, sc(610)) + Pp.torch(570, 610, sc(610));
    s += Pp.weaponRack(-10, 1000, sc(1000)) + Pp.banner(720, 990, sc(990), '#ffd23a') + Pp.torch(30, 760, sc(760)) + Pp.torch(690, 760, sc(760));
    s += L.rock(690, 1240, sc(1240), '#c8a070', { w: .8 }) + Pp.log(40, 1280, sc(1280), { l: 1.2 });
    s += L.vignette(.25, '#3a1a04');
    return L.svgDoc(s);
  },
  torre() {
    L.resetDefs(); L.seed(1414); L.setScene({ hz: 600, lx: 1, haze: '#cdb8f0' });
    let s = L.sky([[0, '#22164e'], [.3, '#563a8a'], [.43, '#c08ac8'], [1, '#f0c8d8']]);
    s += Pp.stars(60, 480, { big: 6 }) + L.sun(610, 150, 30, '#fff6e0', { glow: '#e8d8ff', craters: true });
    // torre central
    const tw = 230, tx = 360, oc = L.O, st = '#9a86c8', stD = '#6e5aa0';
    s += `<path d="M${tx - tw / 2} -10 L${tx - tw / 2 - 20} ${L.HZ + 4} L${tx + tw / 2 + 20} ${L.HZ + 4} L${tx + tw / 2} -10 Z" fill="${st}" stroke="${oc}" stroke-width="4"/>`;
    s += `<path d="M${tx + 20} -10 L${tx + tw / 2} -10 L${tx + tw / 2 + 20} ${L.HZ + 4} L${tx + 30} ${L.HZ + 4} Z" fill="${stD}" opacity=".75"/>`;
    for (let y = 30; y < L.HZ; y += 36) s += `<path d="M${tx - tw / 2 - 20 * (y / L.HZ)} ${y} H${tx + tw / 2 + 20 * (y / L.HZ)}" stroke="#5a4688" stroke-width="2" opacity=".6"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${tx - tw / 2 + 20 + i * 38 + (y / 36 % 2) * 19} ${y} v36" stroke="#5a4688" stroke-width="2" opacity=".45"/>`).join('');
    for (const [y, n] of [[90, 3], [230, 2], [370, 3]]) for (let i = 0; i < n; i++) { const x = tx - (n - 1) * 34 + i * 68; s += `<circle cx="${x}" cy="${y + 20}" r="40" fill="${L.rg([[0, '#ffe08a', .6], [1, '#ffe08a', 0]])}"/><path d="M${x - 15} ${y + 46} V${y + 8} Q${x} ${y - 10} ${x + 15} ${y + 8} V${y + 46} Z" fill="#ffd25a" stroke="${oc}" stroke-width="3"/>`; }
    s += `<path d="M${tx - 46} ${L.HZ + 4} V${L.HZ - 70} Q${tx} ${L.HZ - 128} ${tx + 46} ${L.HZ - 70} V${L.HZ + 4} Z" fill="#ffe8a8" stroke="${oc}" stroke-width="4"/><circle cx="${tx}" cy="${L.HZ - 50}" r="120" fill="${L.rg([[0, '#fff2c0', .45], [1, '#fff2c0', 0]])}"/>`;
    for (let k = 0; k < 3; k++) { let d = ''; for (let y = 0; y <= L.HZ; y += 20) d += (y ? 'L' : 'M') + f(tx + Math.sin(y / 60 + k * 2) * (tw / 2 + 30)) + ' ' + y + ' '; s += `<path d="${d}" fill="none" stroke="${['#9af0ff', '#ff9ae8', '#ffe08a'][k]}" stroke-width="5" opacity=".7"/>`; }
    const r1 = L.ridge(598, 16, 1.5, 1.2, '#7a6aa8', { hz: .3, lw: 2 }); s += `<g clip-path="${L.clip(`<rect x="0" y="0" width="${tx - tw / 2 - 18}" height="${H}"/><rect x="${tx + tw / 2 + 18}" y="0" width="${W}" height="${H}"/>`)}">${r1.s}</g>`;
    s += L.groundBase('#b4a2d4', '#8a76b4');
    s += Pp.tileFloor('#b8a8d8', '#a896cc', { vx: 360, size: 1.15, line: '#7a66a8' });
    s += L.texture(.08, 1);
    s += Pp.magicCircle(360, 930, sc(930), '#9af0ff', { r: 2.7 });
    s += L.crystal(120, 640, sc(640), '#9af0ff', { h: 1.6 }) + L.crystal(600, 640, sc(640), '#ff9ae8', { h: 1.6 }) + Pp.lantern(40, 780, sc(780), { light: '#ffe08a' }) + Pp.lantern(680, 780, sc(780), { light: '#ffe08a' });
    s += Pp.banner(-10, 1010, sc(1010), '#8a5ad8') + L.crystal(730, 1000, sc(1000), '#ffe08a', { h: 1.7 });
    s += Pp.embers(40, 100, 1250, '#e8d8ff');
    s += L.vignette(.3, '#1a0a3a');
    return L.svgDoc(s);
  },
};
