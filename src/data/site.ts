export const site = {
  name: 'Noctem Technology',
  shortName: 'Noctem',
  domain: 'https://noctem.agency',
  email: 'hello.noctem@proton.me',
  phoneDisplay: '+55 35 99724-3658',
  whatsappNumber: '5535997243658',
  instagram: 'https://www.instagram.com/noctem_technology/',
  instagramHandle: '@noctem_technology',
  facebook: 'https://www.facebook.com/share/1DAgE8rA5C/',
  linkedin: 'https://www.linkedin.com/company/noctem-technology',
  linkedinHandle: '@noctem_technology',
  areaServed: 'Worldwide online',
  whatsappMessage: {
    pt: 'Olá, Noctem! Quero conversar sobre um projeto digital.',
    en: 'Hello, Noctem! I would like to discuss a digital project.',
  },
} as const;

export type Locale = 'pt-BR' | 'en';
export type Language = 'pt' | 'en';

export const whatsappUrl = (lang: Language = 'pt') =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage[lang])}`;
