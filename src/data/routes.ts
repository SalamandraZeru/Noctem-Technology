export const pages = [
  { key: 'home', pt: '/', en: '/en/' },
  { key: 'projects', pt: '/projetos/', en: '/en/projects/' },
  { key: 'project-noctem', pt: '/projetos/presenca-digital-noctem/', en: '/en/projects/noctem-digital-presence/' },
  { key: 'project-eletrocl', pt: '/projetos/eletrocl/', en: '/en/projects/eletrocl/' },
  { key: 'project-salao', pt: '/projetos/salao-multi-tenant/', en: '/en/projects/multi-tenant-salon/' },
  { key: 'project-dom-pedro', pt: '/projetos/dom-pedro/', en: '/en/projects/dom-pedro/' },
  { key: 'project-jk-copycenter', pt: '/projetos/jk-copycenter/', en: '/en/projects/jk-copycenter/' },
  { key: 'services', pt: '/servicos/', en: '/en/services/' },
  { key: 'about', pt: '/sobre/', en: '/en/about/' },
  { key: 'contact', pt: '/contato/', en: '/en/contact/' },
  { key: 'privacy', pt: '/politica-de-privacidade/', en: '/en/privacy-policy/' },
] as const;

export type PageKey = (typeof pages)[number]['key'];

export const routeFor = (key: PageKey, lang: 'pt' | 'en') => {
  const page = pages.find((item) => item.key === key);
  if (!page) return lang === 'pt' ? '/' : '/en/';
  return page[lang];
};

export const counterpartFor = (pathname: string) => {
  const normalized = pathname.endsWith('/') || pathname.endsWith('.html') ? pathname : `${pathname}/`;
  const page = pages.find((item) => item.pt === normalized || item.en === normalized) ?? pages[0];
  return { pt: page.pt, en: page.en, key: page.key };
};
