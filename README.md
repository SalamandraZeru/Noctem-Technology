# Noctem Technology

Site institucional bilíngue (PT/EN) da Noctem Technology. É um site estático feito com Astro e TypeScript, com uma camada cinematográfica progressiva (GSAP, Lenis, WebGL e Canvas 2D) que continua completo sem JavaScript e com movimento reduzido.

Produção: <https://noctem.agency> · deploy automático do branch `main` no Cloudflare Workers.

## Destaques

- **Experiência:** abertura em formato *cold open*, home em oito cenas (hero com campo de luz WebGL, manifesto, showreel em letterbox, projetos em película horizontal, serviços, processo, globo com relógios ao vivo e créditos), HUD de cena e timecode, e transições de página em letterbox.
- **Portfólio:** cinco cases reais, com capturas próprias em desktop, tablet e mobile, quatro telas extras por case, luz na cor de cada cliente e painel de próximo projeto.
- **Privacidade (LGPD):** política de privacidade e termos de uso em PT/EN; banner de consentimento conforme o Guia de Cookies da ANPD, sem analytics nem publicidade.
- **Segurança (OWASP):** CSP sem `unsafe-inline` para scripts, HSTS, COOP/CORP, Permissions-Policy e `security.txt`.
- **Desempenho:** mídia sob demanda, imagens WebP otimizadas, efeitos pausados fora da tela e modo *lite* automático em aparelhos modestos ou com economia de dados.
- **Acessibilidade:** navegação por teclado (inclusive na película horizontal), fallback para `prefers-reduced-motion` e conteúdo completo sem JavaScript.

## Requisitos

- Node.js 22 (veja `.nvmrc`) e npm 10 ou superior.
- Nenhum segredo, banco de dados ou variável de ambiente.

## Desenvolvimento

```bash
npm ci
npm run dev          # http://localhost:4321
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run check` | Astro + TypeScript (0 erros esperados) |
| `npm run test` | testes unitários (Vitest) |
| `npm run build` | build estático em `dist/` |
| `npm run test:e2e` | Playwright em desktop, tablet e mobile |
| `npm run validate` | check + testes unitários + build |
| `npm run validate:full` | `validate` + E2E (é o que o CI roda) |
| `npm run assets:generate` | favicon, símbolo, lagartixa do hero com brilho embutido e imagem Open Graph |
| `npm run assets:cinema` | frames do showreel, prévias dos serviços e pontos do globo |
| `npm run assets:capture` | recaptura as telas dos cinco cases (exige os projetos rodando localmente) |
| `npm run qa:capture` | capturas de página inteira para revisão visual (saída em `.qa/`, fora do Git) |

## Estrutura

```text
src/
  components/        páginas, navegação, portfólio, abertura, consentimento e páginas jurídicas
  content/legal/     política de privacidade e termos de uso (Markdown, PT/EN)
  content/projects/  narrativa bilíngue dos cases
  data/              dados institucionais, rotas, projetos e pontos do globo
  layouts/           layout base (SEO, headers de página, abertura, banner)
  scripts/site.ts    orquestra abertura, menu, formulário, cursor e motion
  scripts/consent.ts consentimento de armazenamento (LGPD)
  scripts/cinema/    campo de luz WebGL, globo, cenas da home, páginas internas, HUD e títulos
  styles/global.css  base visual, componentes e responsividade
  styles/cinema.css  camada cinematográfica, com as sobreposições documentadas em comentários
public/              assets estáticos, _headers (segurança e cache), security.txt, boot.js
scripts/             geração e captura de assets
tests/e2e/           verificações funcionais, responsivas e de privacidade
docs/                inventário de assets, registro de validação e pendências de publicação
```

## Publicação

O deploy é feito pelo **Cloudflare Workers Builds**, conectado a este repositório:

- `main` → produção (`noctem.agency`);
- cada branch ou PR ganha uma prévia em `*.hello-noctem.workers.dev`;
- build: `npm run build` → `dist/`, publicado por `npx wrangler deploy` conforme o `wrangler.jsonc` (assets estáticos, URLs com barra final e página 404 da marca);
- `public/_headers` aplica os headers de segurança e o cache imutável de `/_astro/*` e `/assets/*`.

Antes de mudanças que envolvam dados pessoais ou o domínio, veja [docs/CONTENT_NEEDED.md](./docs/CONTENT_NEEDED.md).

## Privacidade e consentimento

- O site não usa cookies próprios nem analytics. O `localStorage` e o `sessionStorage` guardam apenas a escolha de consentimento, o estado da abertura e (com consentimento) o idioma. A lista completa está na política.
- Ao mudar a política ou os itens armazenados, atualize `site.legal.version` e `site.legal.updatedAt` em `src/data/site.ts`: o banner volta a pedir consentimento.
- Para adotar analytics no futuro, adicione a categoria ao banner, à tabela de cookies da política e ao `connect-src` da CSP.

## Contato

- WhatsApp: `+55 (35) 98414-5998`
- E-mail: `hello@noctem.agency`
- Instagram e LinkedIn: `@noctem_technology`

Não há licença open source definida. Adicione uma licença somente depois de uma decisão explícita do titular do projeto.
