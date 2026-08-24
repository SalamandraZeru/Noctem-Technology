# Noctem Technology

Portfólio institucional bilíngue da Noctem Technology. O projeto usa Astro e TypeScript para entregar uma experiência estática, rápida e progressivamente aprimorada com GSAP, ScrollTrigger, Lenis e Canvas 2D.

## O que está incluído

- páginas equivalentes em português e inglês;
- preloader animado com a lagartixa da marca;
- hero e transições orientadas por scroll, com fallback para movimento reduzido;
- portfólio com cinco cases reais;
- capturas próprias para desktop, tablet e mobile em cada projeto;
- quatro telas adicionais e descrição técnica em cada case;
- contato por WhatsApp e e-mail, sem armazenar dados;
- SEO internacional, sitemap, Open Graph, JSON-LD e headers de segurança;
- testes unitários e uma matriz E2E para desktop, tablet e mobile.

## Requisitos

- Node.js 22 (consulte `.nvmrc`);
- npm 10 ou superior.

## Desenvolvimento

```bash
npm ci
npm run dev
```

O servidor local padrão fica em `http://localhost:4321`.

## Comandos

```bash
npm run check          # Astro e TypeScript
npm run test           # testes unitários
npm run build          # saída estática em dist/
npm run test:e2e       # Playwright: desktop, tablet e mobile
npm run assets:generate # deriva favicon, símbolo otimizado e Open Graph
npm run validate       # check + testes unitários + build
npm run validate:full  # validação anterior + E2E
npm run qa:capture     # capturas visuais de todas as páginas
```

`npm run assets:capture` refaz as imagens públicas dos cinco cases. Para isso, os projetos Noctem, EletroCL, Studio Bella, Dom Pedro e JK Copycenter precisam estar disponíveis localmente nas portas configuradas em `scripts/capture-portfolio-assets.mjs`. As telas administrativas permanecem deliberadamente fora desse fluxo para que credenciais nunca entrem no repositório.

## Estrutura principal

- `src/components/` — componentes Astro de página, navegação e portfólio;
- `src/content/projects/` — narrativa bilíngue dos cases;
- `src/data/` — rotas, dados institucionais e catálogo dos projetos;
- `src/scripts/site.ts` — interação, preloader e motion progressivo;
- `public/assets/projects/gallery/` — capturas reais usadas nos cases;
- `tests/e2e/` — verificação funcional e responsiva.

## Publicação

O build é estático e pode ser publicado no Cloudflare Pages, Vercel ou qualquer hospedagem de arquivos estáticos.

- comando de build: `npm run build`;
- diretório de saída: `dist`;
- Node.js: `22`;
- domínio canônico configurado: `https://noctem.agency`.

O projeto não depende de banco, segredo, variável de ambiente, função serverless ou analytics. Consulte [VALIDATION.md](./VALIDATION.md) para a matriz verificada e revise [CONTENT_NEEDED.md](./CONTENT_NEEDED.md) antes da publicação pública.

## Contato institucional

- WhatsApp: `+55 35 99724-3658`;
- e-mail: `hello.noctem@proton.me`;
- Instagram e LinkedIn: `@noctem_technology`;
- atendimento: mundial, online.

Não há licença open source definida. Adicione uma licença somente após uma decisão explícita do titular do projeto.
