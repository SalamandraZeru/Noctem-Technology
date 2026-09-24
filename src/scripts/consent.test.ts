import { describe, expect, it } from 'vitest';
import { CONSENT_MAX_AGE_MS, parseConsent } from './consent';
import { site } from '../data/site';

const now = Date.parse('2026-09-24T12:00:00Z');
const record = (overrides: Record<string, unknown> = {}) => JSON.stringify({ version: site.legal.version, updatedAt: new Date(now - 1000).toISOString(), preferences: true, ...overrides });

describe('cookie consent record', () => {
  it('accepts a current, well-formed record', () => {
    expect(parseConsent(record(), now)).toMatchObject({ preferences: true, version: site.legal.version });
    expect(parseConsent(record({ preferences: false }), now)?.preferences).toBe(false);
  });
  it('asks again when the policy version changes', () => {
    expect(parseConsent(record({ version: '0.9' }), now)).toBeNull();
  });
  it('expires after twelve months and rejects future dates', () => {
    expect(parseConsent(record({ updatedAt: new Date(now - CONSENT_MAX_AGE_MS - 1).toISOString() }), now)).toBeNull();
    expect(parseConsent(record({ updatedAt: new Date(now + 60_000).toISOString() }), now)).toBeNull();
  });
  it('ignores missing, malformed, or tampered values', () => {
    expect(parseConsent(null, now)).toBeNull();
    expect(parseConsent('not json', now)).toBeNull();
    expect(parseConsent(record({ preferences: 'yes' }), now)).toBeNull();
    expect(parseConsent(record({ updatedAt: 'yesterday' }), now)).toBeNull();
  });
});
