import { describe, expect, it } from 'vitest';
import { pages, routeFor } from './routes';
import { site, whatsappUrl } from './site';

describe('public site configuration', () => {
  it('uses a valid WhatsApp link with the confirmed number', () => {
    expect(whatsappUrl('pt')).toMatch(/^https:\/\/wa\.me\/5535997243658\?text=/);
    expect(site.phoneDisplay).toBe('+55 35 99724-3658');
    expect(site.linkedin).toBe('https://www.linkedin.com/company/noctem-technology');
  });
  it('has a unique PT and EN route for every page', () => {
    expect(new Set(pages.map((page) => page.pt)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.en)).size).toBe(pages.length);
    pages.forEach((page) => expect(routeFor(page.key, 'en')).toBe(page.en));
  });
  it('contains no critical publication placeholders', () => {
    expect(JSON.stringify(site)).not.toMatch(/PREENCHER_|PLACEHOLDER|EXAMPLE\.COM/i);
  });
});
