import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import sharp from 'sharp';

const output = 'public/assets/projects/gallery';
await mkdir(output, { recursive: true });
const requestedProject = process.argv.find((arg) => arg.startsWith('--project='))?.split('=')[1];

const projects = [
  { slug: 'noctem', url: 'http://127.0.0.1:4321/' },
  { slug: 'eletrocl', url: 'http://127.0.0.1:3001/' },
  { slug: 'studio-bella', url: 'http://127.0.0.1:3012/' },
  { slug: 'dom-pedro', url: 'http://127.0.0.1:3003/', settle: 1600 },
  { slug: 'jk-copycenter', url: 'http://127.0.0.1:3004/' },
];

const responsive = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 1366 },
  { name: 'mobile', width: 390, height: 844 },
];

const details = [
  { name: 'noctem-projects', url: 'http://127.0.0.1:4321/projetos/' },
  { name: 'noctem-services', url: 'http://127.0.0.1:4321/servicos/', scrollY: 0 },
  { name: 'noctem-about', url: 'http://127.0.0.1:4321/sobre/' },
  { name: 'noctem-contact', url: 'http://127.0.0.1:4321/contato/', scrollY: 0 },
  { name: 'eletrocl-services', url: 'http://127.0.0.1:3001/', selector: '#servicos' },
  { name: 'eletrocl-company', url: 'http://127.0.0.1:3001/', selector: '#sobre' },
  { name: 'eletrocl-process', url: 'http://127.0.0.1:3001/', selector: '#como-funciona' },
  { name: 'eletrocl-testimonials', url: 'http://127.0.0.1:3001/', selector: '#depoimentos' },
  { name: 'studio-bella-home', url: 'http://127.0.0.1:3012/', scrollY: 0 },
  { name: 'studio-bella-home-services', url: 'http://127.0.0.1:3012/servicos', scrollY: 0 },
  { name: 'dom-pedro-story', url: 'http://127.0.0.1:3003/', selector: '#sobre', settle: 1600 },
  { name: 'dom-pedro-menu', url: 'http://127.0.0.1:3003/', selector: '#cardapio', settle: 1600 },
  { name: 'dom-pedro-orders', url: 'http://127.0.0.1:3003/', selector: '#encomendas', settle: 1600 },
  { name: 'dom-pedro-gallery', url: 'http://127.0.0.1:3003/', selector: '#galeria', settle: 1600 },
  { name: 'jk-copycenter-home', url: 'http://127.0.0.1:3004/' },
  { name: 'jk-copycenter-home-catalog', url: 'http://127.0.0.1:3004/grafica' },
];

const browser = await chromium.launch();

async function prepare(page) {
  await page.addInitScript(() => {
    localStorage.setItem('noctem-language-choice', 'pt');
    sessionStorage.setItem('noctem-intro-seen', '1');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function waitForReady(page) {
  const preloader = page.locator('[data-preloader]');
  if (await preloader.count()) await preloader.waitFor({ state: 'hidden', timeout: 6000 });
}

async function captureWebp(page, name) {
  const target = `${output}/${name}.webp`;
  const temporary = `${target}.capture.png`;
  try {
    await page.screenshot({ path: temporary, fullPage: false });
    await sharp(temporary).webp({ lossless: true, effort: 6 }).toFile(target);
  } finally {
    await rm(temporary, { force: true });
  }
}

for (const project of projects.filter((item) => !requestedProject || item.slug === requestedProject)) {
  for (const viewport of responsive) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await prepare(page);
    await page.goto(project.url, { waitUntil: 'load' });
    await waitForReady(page);
    if (project.settle) await page.waitForTimeout(project.settle);
    await captureWebp(page, `${project.slug}-${viewport.name}`);
    await page.close();
  }
}

for (const detail of details.filter((item) => !requestedProject || item.name.startsWith(`${requestedProject}-`))) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await prepare(page);
  await page.goto(detail.url, { waitUntil: 'load' });
  await waitForReady(page);
  if (detail.settle) await page.waitForTimeout(detail.settle);
  if (detail.selector) {
    const target = page.locator(detail.selector).first();
    await target.waitFor({ state: 'visible', timeout: 10000 });
    await target.evaluate((element) => {
      const y = element.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    });
    await page.waitForTimeout(350);
  }
  if (detail.scrollY) {
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: 'instant' }), detail.scrollY);
    await page.waitForTimeout(250);
  }
  await captureWebp(page, detail.name);
  await page.close();
}

await browser.close();
