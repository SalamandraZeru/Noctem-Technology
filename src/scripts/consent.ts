import { site } from '../data/site';

export type ConsentCategory = 'preferences';
export interface ConsentRecord {
  version: string;
  updatedAt: string;
  preferences: boolean;
}

export const CONSENT_KEY = 'noctem-consent';
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
// Storage keys that only exist with the matching consent; removed as soon as it is withdrawn or expires.
const OPTIONAL_KEYS: Record<ConsentCategory, string[]> = { preferences: ['noctem-language-choice'] };

export function parseConsent(raw: string | null, now = Date.now()): ConsentRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentRecord>;
    if (value.version !== site.legal.version || typeof value.preferences !== 'boolean' || typeof value.updatedAt !== 'string') return null;
    const updatedAt = Date.parse(value.updatedAt);
    if (Number.isNaN(updatedAt) || updatedAt > now || now - updatedAt > CONSENT_MAX_AGE_MS) return null;
    return { version: value.version, updatedAt: value.updatedAt, preferences: value.preferences };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentRecord | null {
  try { return parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { return null; }
}

export function hasConsent(category: ConsentCategory) {
  return readConsent()?.[category] === true;
}

function clearOptional(record: ConsentRecord | null) {
  (Object.keys(OPTIONAL_KEYS) as ConsentCategory[]).forEach((category) => {
    if (record?.[category]) return;
    OPTIONAL_KEYS[category].forEach((key) => { try { localStorage.removeItem(key); } catch {} });
  });
}

function saveConsent(preferences: boolean) {
  const record: ConsentRecord = { version: site.legal.version, updatedAt: new Date().toISOString(), preferences };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch {}
  clearOptional(record);
  dispatchEvent(new CustomEvent('noctem:consent', { detail: record }));
  return record;
}

export function setupConsent() {
  const banner = document.querySelector<HTMLElement>('[data-consent-banner]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-consent-dialog]');
  if (!banner || !dialog) return;
  const toggle = dialog.querySelector<HTMLInputElement>('[data-consent-toggle="preferences"]');
  let returnFocus: HTMLElement | null = null;

  const current = readConsent();
  // An expired, outdated, or missing record never keeps optional data around.
  clearOptional(current);
  if (!current) {
    try { localStorage.removeItem(CONSENT_KEY); } catch {}
    banner.hidden = false;
    // Lets fixed UI in the same corner (the home HUD) step aside while the banner is open.
    document.documentElement.classList.add('has-consent-banner');
    requestAnimationFrame(() => banner.classList.add('is-visible'));
  }

  const hideBanner = () => {
    banner.classList.remove('is-visible');
    banner.hidden = true;
    document.documentElement.classList.remove('has-consent-banner');
  };
  const openDialog = (trigger: HTMLElement | null) => {
    returnFocus = trigger;
    if (toggle) toggle.checked = readConsent()?.preferences ?? false;
    dialog.showModal();
  };
  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };
  const decide = (preferences: boolean) => {
    saveConsent(preferences);
    closeDialog();
    hideBanner();
  };

  document.querySelectorAll<HTMLElement>('[data-consent-open]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => openDialog(button));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-consent-action]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.consentAction;
    if (action === 'accept') decide(true);
    else if (action === 'reject') decide(false);
    else if (action === 'save') decide(Boolean(toggle?.checked));
    else if (action === 'customize') openDialog(button);
    else if (action === 'close') closeDialog();
  }));
  dialog.addEventListener('close', () => {
    const target = returnFocus && returnFocus.isConnected && !returnFocus.closest('[hidden]') ? returnFocus : document.querySelector<HTMLElement>('#main');
    target?.focus({ preventScroll: true });
    returnFocus = null;
  });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
}
