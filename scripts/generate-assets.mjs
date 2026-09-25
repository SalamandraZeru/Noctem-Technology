import sharp from 'sharp';

const symbolPath = 'assets-source/noctem-symbol-original.png';

await sharp(symbolPath).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/assets/noctem-symbol.webp');
await sharp(symbolPath).resize(192, 178, { fit: 'contain' }).png().toFile('public/favicon.png');

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
