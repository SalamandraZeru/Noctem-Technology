import sharp from 'sharp';

const symbolPath = 'assets-source/noctem-symbol-original.png';

await sharp(symbolPath).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/assets/noctem-symbol.webp');
await sharp(symbolPath).resize(192, 178, { fit: 'contain' }).png().toFile('public/favicon.png');

const symbol = await sharp(symbolPath).resize(340, 316, { fit: 'contain' }).png().toBuffer();
const card = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="r"><stop stop-color="#40126c"/><stop offset="1" stop-color="#07070a"/></radialGradient>
    <linearGradient id="g"><stop stop-color="#b84cff"/><stop offset="1" stop-color="#5368ff"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#07070a"/>
  <circle cx="930" cy="260" r="430" fill="url(#r)" opacity=".8"/>
  <path d="M60 520 C310 350 390 660 690 400 S940 160 1160 90" fill="none" stroke="url(#g)" stroke-width="2" opacity=".45"/>
  <text x="82" y="210" fill="#f5f3f8" font-family="Segoe UI,Arial" font-size="82" font-weight="600">Noctem</text>
  <text x="82" y="282" fill="#b6b1c0" font-family="Segoe UI,Arial" font-size="52" font-weight="300">Technology</text>
  <text x="82" y="435" fill="#f5f3f8" font-family="Segoe UI,Arial" font-size="34">Apps · Sites · Softwares · Automações</text>
  <text x="82" y="505" fill="#9d96aa" font-family="Segoe UI,Arial" font-size="22" letter-spacing="4">SINAL NA ESCURIDÃO</text>
</svg>`);
await sharp(card).composite([{ input: symbol, left: 800, top: 145 }]).png({ quality: 92 }).toFile('public/og.png');
