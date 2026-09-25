export const site = {
  name: 'Noctem Technology',
  shortName: 'Noctem',
  domain: 'https://noctem.agency',
  email: 'hello@noctem.agency',
  phoneDisplay: '+55 (35) 98414-5998',
  whatsappNumber: '5535984145998',
  instagram: 'https://www.instagram.com/noctem_technology/',
  instagramHandle: '@noctem_technology',
  facebook: 'https://www.facebook.com/share/1DAgE8rA5C/',
  linkedin: 'https://www.linkedin.com/company/noctem-technology',
  linkedinHandle: '@noctem_technology',
  areaServed: 'Worldwide online',
  legal: {
    controller: 'Noctem Technology',
    // Bump both values whenever the privacy policy or the list of stored items changes:
    // visitors are asked for consent again when the version differs from the one they accepted.
    version: '1.0',
    updatedAt: '2026-09-24',
  },
  whatsappMessage: {
    pt: 'Olá, Noctem! Quero conversar sobre um projeto digital.',
    en: 'Hello, Noctem! I would like to discuss a digital project.',
  },
} as const;

export type Locale = 'pt-BR' | 'en';
export type Language = 'pt' | 'en';

export const whatsappUrl = (lang: Language = 'pt') =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage[lang])}`;
