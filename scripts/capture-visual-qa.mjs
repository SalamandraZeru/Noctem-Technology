import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4322';
const output = path.resolve(process.env.QA_OUTPUT ?? '.qa');
const requestedPages = new Set((process.env.QA_PAGES ?? '').split(',').filter(Boolean));
await mkdir(output, { recursive: true });

const pages = [
  ['home-pt', '/'],
  ['home-en', '/en/'],
  ['projects', '/projetos/'],
  ['services', '/servicos/'],
  ['about', '/sobre/'],
  ['contact', '/contato/'],
  ['case-noctem', '/projetos/presenca-digital-noctem/'],
  ['case-eletrocl', '/projetos/eletrocl/'],
  ['case-studio-bella', '/projetos/salao-multi-tenant/'],
  ['case-dom-pedro', '/projetos/dom-pedro/'],
  ['case-jk-copycenter', '/projetos/jk-copycenter/'],
];

const viewports = [
  ['desktop', { width: 1440, height: 900 }],
  ['tablet', { width: 1024, height: 1366 }],
  ['mobile', { width: 390, height: 844 }],
];

const browser = await chromium.launch();

for (const [viewportName, viewport] of viewports) {
  for (const [pageName, pathname] of pages.filter(([name]) => requestedPages.size === 0 || requestedPages.has(name))) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      localStorage.setItem('noctem-language-choice', 'pt');
      sessionStorage.setItem('noctem-intro-seen', '1');
    });
    await page.goto(new URL(pathname, baseURL).href, { waitUntil: 'networkidle' });
    const preloader = page.locator('[data-preloader]');
    if (await preloader.count()) await preloader.waitFor({ state: 'hidden', timeout: 6000 });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += Math.max(360, Math.round(viewport.height * 0.78))) {
      await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), y);
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(output, `${viewportName}-${pageName}.jpg`), fullPage: true, type: 'jpeg', quality: 76 });
    await page.close();
  }
}

await browser.close();
