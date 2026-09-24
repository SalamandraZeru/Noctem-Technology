// Derives the lightweight media used by the cinematic home: showreel frames, service previews,
// and the land dots of the globe. Every source is an original Noctem capture or public-domain data
// (Natural Earth via world-atlas), so nothing here depends on third-party stock media.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const gallery = 'public/assets/projects/gallery';
const out = 'public/assets/reel';
await fs.mkdir(out, { recursive: true });

const reel = [
  'dom-pedro-desktop',
  'studio-bella-home',
  'jk-copycenter-desktop',
  'eletrocl-desktop',
  'dom-pedro-gallery',
  'noctem-projects',
  'studio-bella-admin-dashboard',
  'eletrocl-company',
];
for (const name of reel) {
  await sharp(`${gallery}/${name}.webp`)
    .resize(1600, 1000, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 0.94, saturation: 1.06 })
    .webp({ quality: 62, effort: 6 })
    .toFile(`${out}/${name}.webp`);
}

const previews = {
  'preview-apps': ['studio-bella-mobile', 560, 900, 'top'],
  'preview-sites': ['dom-pedro-desktop', 880, 560, 'top'],
  'preview-software': ['jk-copycenter-admin-dashboard', 880, 560, 'center'],
  'preview-automation': ['jk-copycenter-admin-pricing', 880, 560, 'center'],
};
for (const [name, [source, width, height, position]] of Object.entries(previews)) {
  await sharp(`${gallery}/${source}.webp`).resize(width, height, { fit: 'cover', position }).webp({ quality: 66, effort: 6 }).toFile(`${out}/${name}.webp`);
}

// Land dots on a Fibonacci sphere: even spacing, so the globe reads as a clean dotted map.
const topology = JSON.parse(await fs.readFile('node_modules/world-atlas/land-110m.json', 'utf8'));
const land = feature(topology, topology.objects.land);
const samples = 16000;
const golden = Math.PI * (3 - Math.sqrt(5));
const points = [];
for (let index = 0; index < samples; index += 1) {
  const y = 1 - (index / (samples - 1)) * 2;
  const theta = golden * index;
  const lat = Math.asin(y) * (180 / Math.PI);
  const lng = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -60) continue; // Antarctica only adds a noisy rim at the bottom of the globe.
  if (geoContains(land, [lng, lat])) points.push(Math.round(lat * 10) / 10, Math.round(lng * 10) / 10);
}
await fs.writeFile('src/data/globe-points.json', JSON.stringify(points));
console.log(`reel: ${reel.length} frames, previews: ${Object.keys(previews).length}, globe: ${points.length / 2} land dots`);
