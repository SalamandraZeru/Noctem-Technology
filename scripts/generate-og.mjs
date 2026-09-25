import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

// Open Graph card rendered in Chromium so it uses the site's own typefaces (sharp's SVG renderer
// cannot load web fonts and fell back to system fonts).
const dataUri = async (path, type) => `data:${type};base64,${(await readFile(path)).toString('base64')}`;
const geist = await dataUri('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', 'font/woff2');
const geistMono = await dataUri('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2', 'font/woff2');
const serif = await dataUri('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2', 'font/woff2');
const gecko = await dataUri('public/assets/noctem-symbol-hero.webp', 'image/webp');

const html = `<!doctype html><html><head><style>
@font-face { font-family: Geist; src: url(${geist}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Geist Mono'; src: url(${geistMono}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Instrument Serif'; src: url(${serif}) format('woff2'); font-style: italic; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #07070a; color: #f5f3f8; font-family: Geist, sans-serif; position: relative; }
.glow { position: absolute; width: 860px; height: 860px; left: 520px; top: -170px; border-radius: 50%;
  background: radial-gradient(circle, rgba(94, 28, 160, .75), rgba(40, 12, 80, .35) 45%, transparent 70%); }
.bar { position: absolute; left: 0; right: 0; height: 44px; background: #000; }
.bar.top { top: 0; } .bar.bottom { bottom: 0; }
.meta { position: absolute; left: 82px; right: 82px; font: 500 15px 'Geist Mono', monospace; letter-spacing: .22em; color: #8f889c; text-transform: uppercase; display: flex; justify-content: space-between; }
.meta.top { top: 74px; } .meta.bottom { bottom: 74px; }
h1 { position: absolute; left: 78px; top: 150px; font-weight: 600; font-size: 104px; line-height: .92; letter-spacing: -.055em; }
h1 em { display: block; font-family: 'Instrument Serif', serif; font-weight: 400; font-size: 96px; letter-spacing: -.02em; color: #c9b6ff; }
p { position: absolute; left: 82px; top: 400px; font-size: 30px; font-weight: 400; color: #d8d2e2; letter-spacing: -.01em; }
img { position: absolute; left: 700px; top: 88px; width: 470px; }
</style></head><body>
<div class="glow"></div><div class="bar top"></div><div class="bar bottom"></div>
<div class="meta top"><span>Noctem Technology</span><span>noctem.agency</span></div>
<h1>Noctem<em>Technology</em></h1>
<p>Apps · Sites · Softwares · Automações</p>
<img src="${gecko}" alt="">
<div class="meta bottom"><span>Sinal na escuridão</span><span>PT · EN</span></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 90, dither: 0.6 }).toFile('public/og.png');
