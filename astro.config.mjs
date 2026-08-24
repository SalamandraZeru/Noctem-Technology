// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://noctem.agency',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    build: { target: 'es2022' },
  },
});
