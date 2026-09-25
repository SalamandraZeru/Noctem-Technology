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

// Hero gecko with its contrast shadows and violet glow baked in: CSS drop-shadow filters on an element
// that scales during scroll are re-rasterized every frame, which cut scrolling to a third of the frame rate.
{
  const size = 720;
  const pad = Math.round(size * 0.2);
  const base = await sharp(symbolPath).resize({ width: size }).modulate({ brightness: 1.15, saturation: 1.15 }).png().toBuffer();
  const { width, height } = await sharp(base).metadata();
  const padded = await sharp(base).extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const alpha = await sharp(padded).extractChannel('alpha').toBuffer();
  const tinted = (r, g, b, opacity) => sharp({ create: { width: width + pad * 2, height: height + pad * 2, channels: 3, background: { r, g, b } } })
    .joinChannel(alpha).linear([1, 1, 1, opacity], [0, 0, 0, 0]).png().toBuffer();
  const full = { width: width + pad * 2, height: height + pad * 2 };
  // Blur, then crop the bottom so the layer can be composited `top` pixels lower (a downward shadow).
  const layer = async (buffer, sigma, top = 0) => {
    const blurred = await sharp(buffer).blur(sigma).png().toBuffer();
    return { input: top ? await sharp(blurred).extract({ left: 0, top: 0, width: full.width, height: full.height - top }).png().toBuffer() : blurred, top, left: 0 };
  };
  const black = await tinted(0, 0, 0, 0.85);
  const violet = await tinted(186, 92, 255, 0.75);
  const blue = await tinted(92, 104, 255, 0.4);
  await sharp({ create: { width: width + pad * 2, height: height + pad * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      await layer(black, 20, 22),
      await layer(black, 7, 8),
      await layer(blue, 36),
      await layer(violet, 14),
      await layer(black, 0.8),
      { input: padded },
    ])
    .webp({ quality: 88, alphaQuality: 90, effort: 6 })
    .toFile('public/assets/noctem-symbol-hero.webp');
}
