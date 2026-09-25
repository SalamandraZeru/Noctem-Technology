import { defineConfig, devices } from '@playwright/test';
import { site } from './src/data/site';

const baseURL = 'http://127.0.0.1:4322';
// Existing scenarios start with a stored consent so the banner does not cover the page;
// the consent tests opt out with an empty storage state.
const consent = JSON.stringify({ version: site.legal.version, updatedAt: new Date().toISOString(), preferences: true });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    storageState: { cookies: [], origins: [{ origin: baseURL, localStorage: [{ name: 'noctem-consent', value: consent }] }] },
  },
  webServer: {
    command: 'node scripts/preview-foreground.mjs',
    port: 4322,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 1366 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
