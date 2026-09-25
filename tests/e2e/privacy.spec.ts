import { expect, test } from '@playwright/test';

test.describe('cookie consent', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('banner offers equal accept and reject choices and remembers the decision', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('noctem-intro-seen', '1'));
    await page.goto('/');
    const banner = page.locator('[data-consent-banner]');
    await expect(banner).toBeVisible();
    const reject = banner.locator('[data-consent-action="reject"]');
    const accept = banner.locator('[data-consent-action="accept"]');
    await expect(reject).toBeVisible();
    await expect(accept).toBeVisible();
    expect(await reject.evaluate((node) => node.className)).toBe(await accept.evaluate((node) => node.className));
    await reject.click();
    await expect(banner).toBeHidden();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('noctem-consent') || 'null'));
    expect(stored).toMatchObject({ preferences: false });
    await page.reload();
    await expect(banner).toBeHidden();
  });

  test('language preference is only kept with consent and is removed on withdrawal', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile');
    await page.addInitScript(() => sessionStorage.setItem('noctem-intro-seen', '1'));
    await page.goto('/');
    await page.locator('[data-consent-banner] [data-consent-action="reject"]').click();
    await page.locator('.site-header [data-lang-choice="en"]').click();
    await expect(page).toHaveURL(/\/en\/$/);
    expect(await page.evaluate(() => localStorage.getItem('noctem-language-choice'))).toBeNull();

    await page.locator('.site-footer [data-consent-open]').click();
    const dialog = page.locator('[data-consent-dialog]');
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-consent-toggle="preferences"]').check();
    await dialog.locator('[data-consent-action="save"]').click();
    await expect(dialog).toBeHidden();
    await page.locator('.site-header [data-lang-choice="pt"]').click();
    await expect(page).toHaveURL(/127\.0\.0\.1:4322\/$/);
    expect(await page.evaluate(() => localStorage.getItem('noctem-language-choice'))).toBe('pt');

    await page.locator('.site-footer [data-consent-open]').click();
    await dialog.locator('[data-consent-action="reject"]').click();
    expect(await page.evaluate(() => localStorage.getItem('noctem-language-choice'))).toBeNull();
  });

  test('banner stays out of the way without JavaScript', async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-consent-banner]')).toBeHidden();
    await context.close();
  });
});

test('privacy policy and terms of use are published in both languages', async ({ page }) => {
  for (const [path, heading, lang] of [
    ['/politica-de-privacidade/', 'Política de privacidade', 'pt-BR'],
    ['/en/privacy-policy/', 'Privacy policy', 'en'],
    ['/termos-de-uso/', 'Termos de uso', 'pt-BR'],
    ['/en/terms-of-use/', 'Terms of use', 'en'],
  ] as const) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('main h1')).toHaveText(heading);
    await expect(page.locator('.legal-toc a').first()).toBeVisible();
    await expect(page.locator('.legal-meta time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
  }
  await page.goto('/politica-de-privacidade/');
  await expect(page.locator('.legal-content table').nth(1)).toContainText('noctem-language-choice');
  await expect(page.locator('.site-footer a[href="/termos-de-uso/"]')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('security.txt is published', async ({ request }) => {
  const response = await request.get('/.well-known/security.txt');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toMatch(/^Contact: mailto:hello\.noctem@proton\.me/m);
});
