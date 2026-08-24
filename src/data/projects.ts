import type { PageKey } from './routes';

export type ProjectKind = 'noctem' | 'eletrocl' | 'studio-bella' | 'dom-pedro' | 'jk-copycenter';
export type LocalizedText = { pt: string; en: string };

export interface ProjectScreen {
  src: string;
  width: number;
  height: number;
  label: LocalizedText;
}

export interface PortfolioProject {
  route: PageKey;
  kind: ProjectKind;
  client: string;
  year: number;
  title: LocalizedText;
  category: LocalizedText;
  description: LocalizedText;
  technologies: string[];
  responsive: {
    desktop: ProjectScreen;
    tablet: ProjectScreen;
    mobile: ProjectScreen;
  };
  details: ProjectScreen[];
}

const screen = (src: string, width: number, height: number, pt: string, en: string): ProjectScreen => ({
  src,
  width,
  height,
  label: { pt, en },
});

export const portfolioProjects: PortfolioProject[] = [
  {
    route: 'project-noctem',
    kind: 'noctem',
    client: 'Noctem Technology',
    year: 2026,
    title: { pt: 'Presença digital', en: 'Digital presence' },
    category: { pt: 'Identidade, web design, desenvolvimento e motion.', en: 'Identity, web design, development, and motion.' },
    description: {
      pt: 'Uma experiência bilíngue que transforma a lagartixa e seus circuitos em navegação, movimento e linguagem de marca.',
      en: 'A bilingual experience turning the gecko and its circuitry into navigation, motion, and a distinctive brand language.',
    },
    technologies: ['Astro', 'TypeScript', 'GSAP', 'Lenis', 'Canvas 2D'],
    responsive: {
      desktop: screen('/assets/case/home-desktop.webp', 1440, 900, 'Noctem em desktop', 'Noctem on desktop'),
      tablet: screen('/assets/case/home-tablet.webp', 1024, 1366, 'Noctem em tablet', 'Noctem on tablet'),
      mobile: screen('/assets/case/home-mobile.webp', 390, 844, 'Noctem em mobile', 'Noctem on mobile'),
    },
    details: [
      screen('/assets/projects/gallery/noctem-projects.webp', 1440, 900, 'Grade de projetos', 'Projects overview'),
      screen('/assets/projects/gallery/noctem-services.webp', 1440, 900, 'Página de serviços', 'Services page'),
      screen('/assets/projects/gallery/noctem-about.webp', 1440, 900, 'História e princípios', 'Story and principles'),
      screen('/assets/projects/gallery/noctem-contact.webp', 1440, 900, 'Experiência de contato', 'Contact experience'),
    ],
  },
  {
    route: 'project-eletrocl',
    kind: 'eletrocl',
    client: 'EletroCL',
    year: 2026,
    title: { pt: 'Presença institucional local', en: 'Local corporate presence' },
    category: { pt: 'Direção visual, site institucional e contato direto.', en: 'Visual direction, corporate website, and direct contact.' },
    description: {
      pt: 'Serviços técnicos, marcas atendidas e orçamento ganham uma jornada digital direta, responsiva e reconhecível.',
      en: 'Technical services, supported brands, and quoting become a direct, responsive, recognizable digital journey.',
    },
    technologies: ['Vite', 'HTML', 'CSS', 'JavaScript'],
    responsive: {
      desktop: screen('/assets/projects/gallery/eletrocl-desktop.webp', 1440, 900, 'EletroCL em desktop', 'EletroCL on desktop'),
      tablet: screen('/assets/projects/gallery/eletrocl-tablet.webp', 1024, 1366, 'EletroCL em tablet', 'EletroCL on tablet'),
      mobile: screen('/assets/projects/gallery/eletrocl-mobile.webp', 390, 844, 'EletroCL em mobile', 'EletroCL on mobile'),
    },
    details: [
      screen('/assets/projects/gallery/eletrocl-services.webp', 1440, 900, 'Catálogo de serviços', 'Services catalog'),
      screen('/assets/projects/gallery/eletrocl-company.webp', 1440, 900, 'Loja e presença local', 'Store and local presence'),
      screen('/assets/projects/gallery/eletrocl-process.webp', 1440, 900, 'Etapas do atendimento técnico', 'Technical service steps'),
      screen('/assets/projects/gallery/eletrocl-testimonials.webp', 1440, 900, 'Depoimentos e confiança', 'Testimonials and trust'),
    ],
  },
  {
    route: 'project-salao',
    kind: 'studio-bella',
    client: 'Studio Bella',
    year: 2026,
    title: { pt: 'Plataforma para salões', en: 'Salon platform' },
    category: { pt: 'Produto multi-tenant, agenda, catálogo e administração.', en: 'Multi-tenant product, scheduling, catalog, and administration.' },
    description: {
      pt: 'Uma base white-label preparada para múltiplos salões, com identidade, conteúdo e operação resolvidos por tenant.',
      en: 'A white-label foundation for multiple salons, resolving branding, content, and operations per tenant.',
    },
    technologies: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL'],
    responsive: {
      desktop: screen('/assets/projects/gallery/studio-bella-desktop.webp', 1440, 900, 'Studio Bella em desktop', 'Studio Bella on desktop'),
      tablet: screen('/assets/projects/gallery/studio-bella-tablet.webp', 1024, 1366, 'Studio Bella em tablet', 'Studio Bella on tablet'),
      mobile: screen('/assets/projects/gallery/studio-bella-mobile.webp', 390, 844, 'Studio Bella em mobile', 'Studio Bella on mobile'),
    },
    details: [
      screen('/assets/projects/gallery/studio-bella-home.webp', 1440, 900, 'Home pública e agendamento', 'Public home and scheduling'),
      screen('/assets/projects/gallery/studio-bella-home-services.webp', 1440, 900, 'Serviços na experiência pública', 'Services in the public experience'),
      screen('/assets/projects/gallery/studio-bella-admin-dashboard.webp', 1248, 688, 'Painel administrativo', 'Administrative dashboard'),
      screen('/assets/projects/gallery/studio-bella-admin-services.webp', 1263, 697, 'Gestão do catálogo de serviços', 'Services catalog management'),
    ],
  },
  {
    route: 'project-dom-pedro',
    kind: 'dom-pedro',
    client: 'Dom Pedro',
    year: 2026,
    title: { pt: 'Tradição artesanal online', en: 'Artisan tradition online' },
    category: { pt: 'Estratégia, site institucional, cardápio e conversão.', en: 'Strategy, corporate website, menu, and conversion.' },
    description: {
      pt: 'A experiência da panificadora vira uma vitrine acolhedora com cardápio, encomendas e contato local pelo WhatsApp.',
      en: 'The bakery experience becomes a warm showcase with a menu, ordering, and local WhatsApp contact.',
    },
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    responsive: {
      desktop: screen('/assets/projects/gallery/dom-pedro-desktop.webp', 1440, 900, 'Dom Pedro em desktop', 'Dom Pedro on desktop'),
      tablet: screen('/assets/projects/gallery/dom-pedro-tablet.webp', 1024, 1366, 'Dom Pedro em tablet', 'Dom Pedro on tablet'),
      mobile: screen('/assets/projects/gallery/dom-pedro-mobile.webp', 390, 844, 'Dom Pedro em mobile', 'Dom Pedro on mobile'),
    },
    details: [
      screen('/assets/projects/gallery/dom-pedro-story.webp', 1440, 900, 'História e identidade artesanal', 'Story and artisan identity'),
      screen('/assets/projects/gallery/dom-pedro-menu.webp', 1440, 900, 'Cardápio informativo', 'Informational menu'),
      screen('/assets/projects/gallery/dom-pedro-orders.webp', 1440, 900, 'Fluxo de encomendas', 'Ordering flow'),
      screen('/assets/projects/gallery/dom-pedro-gallery.webp', 1440, 900, 'Galeria de produtos', 'Product gallery'),
    ],
  },
  {
    route: 'project-jk-copycenter',
    kind: 'jk-copycenter',
    client: 'JK Copycenter',
    year: 2026,
    title: { pt: 'Plataforma gráfica completa', en: 'Complete print platform' },
    category: { pt: 'Catálogo, pedidos, precificação e operação administrativa.', en: 'Catalog, ordering, pricing, and administrative operations.' },
    description: {
      pt: 'A jornada pública da gráfica e suas rotinas internas convivem em um produto digital que organiza catálogo, pedidos e gestão.',
      en: 'The print shop’s public journey and internal workflows meet in a digital product organizing its catalog, orders, and management.',
    },
    technologies: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    responsive: {
      desktop: screen('/assets/projects/gallery/jk-copycenter-desktop.webp', 1440, 900, 'JK Copycenter em desktop', 'JK Copycenter on desktop'),
      tablet: screen('/assets/projects/gallery/jk-copycenter-tablet.webp', 1024, 1366, 'JK Copycenter em tablet', 'JK Copycenter on tablet'),
      mobile: screen('/assets/projects/gallery/jk-copycenter-mobile.webp', 390, 844, 'JK Copycenter em mobile', 'JK Copycenter on mobile'),
    },
    details: [
      screen('/assets/projects/gallery/jk-copycenter-home.webp', 1440, 900, 'Home pública e chamada principal', 'Public home and main call to action'),
      screen('/assets/projects/gallery/jk-copycenter-home-catalog.webp', 1440, 900, 'Serviços gráficos na experiência pública', 'Print services in the public experience'),
      screen('/assets/projects/gallery/jk-copycenter-admin-dashboard.webp', 1265, 712, 'Visão geral administrativa', 'Administrative overview'),
      screen('/assets/projects/gallery/jk-copycenter-admin-pricing.webp', 1280, 720, 'Regras de precificação', 'Pricing rules'),
    ],
  },
];

export const projectForKind = (kind: ProjectKind) => portfolioProjects.find((project) => project.kind === kind) ?? portfolioProjects[0];
