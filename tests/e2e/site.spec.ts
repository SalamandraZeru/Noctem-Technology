import { expect, test } from '@playwright/test';

test('home, navigation, language, and metadata work', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('noctem-language-choice', 'pt'));
  await page.goto('/');
  await expect(page.locator('main h1')).toContainText('Tecnologia');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /\/en\/$/);
  if (testInfo.project.name === 'mobile') {
    await page.locator('[data-menu-toggle]').click();
    await page.locator('[data-mobile-menu] a[href="/servicos/"]').click();
  } else {
    await page.locator('.desktop-nav a[href="/servicos/"]').click();
  }
  await expect(page).toHaveURL(/\/servicos\/$/);
  await expect(page.locator('main h1')).toContainText('resolver');
});

test('hero stays fully visible and returns after scrolling in every viewport', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('noctem-language-choice', 'pt');
    sessionStorage.setItem('noctem-intro-seen', '1');
  });
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 5500 });
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const assertContained = async () => {
    const title = page.locator('[data-hero-title]');
    await expect(title).toBeVisible();
    const box = await title.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height + 1);
    await expect.poll(
      () => title.evaluate((element) => Number(getComputedStyle(element).opacity)),
      { timeout: 2500 },
    ).toBeGreaterThan(0.98);
  };
  await assertContained();
  await page.evaluate(() => scrollTo(0, Math.min(innerHeight * 0.85, document.documentElement.scrollHeight - innerHeight)));
  await page.waitForTimeout(650);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(950);
  await assertContained();
});

test('English hero and kinetic tape use English copy without clipping', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('noctem-intro-seen', '1'));
  await page.goto('/en/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 5500 });
  const title = page.locator('[data-hero-title]');
  await expect(title).toContainText('Technology that');
  const box = await title.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height + 1);
  const tape = page.locator('[data-kinetic]');
  await expect(tape).toContainText('CODE');
  await expect(tape).toContainText('AUTOMATION');
  await expect(tape).toContainText('EXPERIENCE');
  await expect(tape).not.toContainText('CÓDIGO');
});

test('mobile menu and English counterpart work', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/en/');
  await page.locator('[data-menu-toggle]').click();
  await expect(page.locator('[data-mobile-menu]')).toBeVisible();
  await page.locator('[data-mobile-menu] a[href="/en/projects/"]').click();
  await expect(page).toHaveURL(/\/en\/projects\/$/);
  await expect(page.locator('main h1')).toContainText('signals');
});

test('case and reduced motion remain readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projetos/presenca-digital-noctem/');
  await expect(page.locator('main h1')).toContainText('Presença digital Noctem');
  await expect(page.locator('.case-story')).toBeVisible();
});

test('contact form generates confirmed WhatsApp URL', async ({ page }) => {
  await page.goto('/contato/');
  await page.locator('input[name="name"]').fill('Teste Noctem');
  await page.locator('select[name="type"]').selectOption({ index: 1 });
  await page.locator('textarea[name="goal"]').fill('Validar o fluxo de contato');
  const popup = page.waitForEvent('popup');
  await page.locator('[data-contact-channel="whatsapp"]').click();
  expect((await popup).url()).toMatch(/^https:\/\/(api\.)?whatsapp\.com|^https:\/\/wa\.me/);
});

test('contact form offers a prepared email message', async ({ page }) => {
  await page.addInitScript(() => {
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function click() {
      if (this.href.startsWith('mailto:')) {
        (window as Window & { __noctemMailto?: string }).__noctemMailto = this.href;
        return;
      }
      originalClick.call(this);
    };
  });
  await page.goto('/contato/');
  await page.locator('input[name="name"]').fill('Teste Noctem');
  await page.locator('select[name="type"]').selectOption({ index: 2 });
  await page.locator('textarea[name="goal"]').fill('Validar o envio por email');
  await page.locator('[data-contact-channel="email"]').click();
  const mailto = await page.evaluate(() => (window as Window & { __noctemMailto?: string }).__noctemMailto);
  expect(mailto).toMatch(/^mailto:hello\.noctem@proton\.me\?/);
  expect(decodeURIComponent(mailto || '')).toContain('Validar o envio por email');
});

test('header, gecko, and scroll motion remain intact', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('noctem-intro-seen', '1'));
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 5500 });
  await expect(page.locator('[data-header]')).toHaveCSS('position', 'fixed');
  const viewport = page.viewportSize();
  const header = await page.locator('[data-header]').boundingBox();
  const gecko = await page.locator('[data-signal-art] img').boundingBox();
  expect(viewport).not.toBeNull();
  expect(header).not.toBeNull();
  expect(gecko).not.toBeNull();
  expect(header!.x).toBeGreaterThanOrEqual(0);
  expect(header!.x + header!.width).toBeLessThanOrEqual(viewport!.width + 1);
  expect(gecko!.x).toBeGreaterThanOrEqual(0);
  expect(gecko!.x + gecko!.width).toBeLessThanOrEqual(viewport!.width + 1);
  const before = await page.locator('[data-signal-art]').evaluate((element) => getComputedStyle(element).transform);
  await page.evaluate(() => scrollTo(0, Math.min(360, document.documentElement.scrollHeight - innerHeight)));
  await page.waitForTimeout(500);
  const after = await page.locator('[data-signal-art]').evaluate((element) => getComputedStyle(element).transform);
  expect(after).not.toBe(before);
});

test('portfolio contains the five projects and keeps every mockup inside its stage', async ({ page }, testInfo) => {
  await page.addInitScript(() => sessionStorage.setItem('noctem-intro-seen', '1'));
  await page.goto('/projetos/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 5500 });
  await expect(page.locator('[data-project-card]')).toHaveCount(5);
  const stages = page.locator('[data-project-stage]');
  await expect(stages).toHaveCount(5);
  for (let index = 0; index < await stages.count(); index += 1) {
    const stage = stages.nth(index);
    const stageBox = await stage.boundingBox();
    expect(stageBox).not.toBeNull();
    for (const device of await stage.locator('.device').all()) {
      const box = await device.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(stageBox!.x - 1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(stageBox!.x + stageBox!.width + 1);
      expect(box!.y).toBeGreaterThanOrEqual(stageBox!.y - 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(stageBox!.y + stageBox!.height + 1);
    }
  }
  if (testInfo.project.name !== 'desktop') return;
  for (const path of ['/projetos/eletrocl/', '/projetos/salao-multi-tenant/', '/projetos/dom-pedro/', '/projetos/jk-copycenter/']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
  }
});

test('home presents five projects in a responsive grid', async ({ page }, testInfo) => {
  await page.addInitScript(() => sessionStorage.setItem('noctem-intro-seen', '1'));
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 5500 });
  await expect(page.locator('.home-projects [data-project-card]')).toHaveCount(5);
  const columns = await page.locator('.home-portfolio-grid').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(testInfo.project.name === 'mobile' ? 1 : 2);
});

test('each case presents four uncropped real screens', async ({ page }) => {
  test.setTimeout(60_000);
  const paths = [
    '/projetos/presenca-digital-noctem/',
    '/projetos/eletrocl/',
    '/projetos/salao-multi-tenant/',
    '/projetos/dom-pedro/',
    '/projetos/jk-copycenter/',
  ];
  for (const path of paths) {
    await page.goto(path);
    const figures = page.locator('.showcase-grid figure');
    await expect(figures).toHaveCount(4);
    for (const image of await figures.locator('img').all()) {
      await expect(image).toHaveJSProperty('complete', true);
      await expect(image).toHaveCSS('object-fit', 'contain');
      expect(await image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect(await image.evaluate((element) => (element as HTMLImageElement).naturalHeight)).toBeGreaterThan(0);
    }
  }
});

test('unknown route returns branded 404', async ({ page }) => {
  const response = await page.goto('/rota-inexistente/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('main h1')).toContainText('Sinal perdido');
});

test('preloader runs on first entry and reload, but stays absent during navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.route('**/assets/noctem-symbol.webp', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeVisible();
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 5500 });
  await page.unroute('**/assets/noctem-symbol.webp');
  await page.goto('/servicos/');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('[data-preloader]')).toHaveCount(0);
  await page.goto('/projetos/eletrocl/');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('[data-preloader]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-preloader]')).toBeVisible();
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 5500 });
  await expect(page.locator('main h1')).toBeVisible();
});

test('essential content and navigation work without JavaScript', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('a[href="/projetos/"]').first()).toBeVisible();
  await page.goto('/en/services/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main h1')).toContainText('solve');
  await context.close();
});
