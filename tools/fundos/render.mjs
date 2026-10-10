// Gera os cenários: node tools/fundos/render.mjs [nomes...]
// Saída: bg86/<nome>.png (depois convertido para .webp pelo script python ao lado)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SCENES } from './scenes.mjs';
import { W, H } from './lib.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.env.OUT || 'bg86';
fs.mkdirSync(out, { recursive: true });
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H } });
for (const n of names) {
  const svg = SCENES[n]();
  if (process.env.SVG) fs.writeFileSync(path.join(out, n + '.svg'), svg);
  await p.setContent(`<!doctype html><html><body style="margin:0;background:#000">${svg}</body></html>`);
  await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(out, n + '.png'), clip: { x: 0, y: 0, width: W, height: H } });
  console.log('ok', n, (svg.length / 1024).toFixed(0) + 'KB svg');
}
await b.close();
