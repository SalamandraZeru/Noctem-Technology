# Registro de validação

Data: 24 de agosto de 2026.

## Escopo validado

- home em português e inglês;
- páginas de projetos, serviços, sobre e contato;
- cinco cases completos em PT e EN;
- desktop `1440 × 900`, tablet `1024 × 1366` e mobile `390 × 844`;
- preloader, menu mobile, motion, retorno após scroll, formulário, WhatsApp, e-mail, 404 e fallback sem JavaScript;
- enquadramento dos mockups e das quatro telas adicionais de cada projeto.

## Evidência automatizada

- `astro check`: 0 erros, 0 warnings e 0 hints;
- Vitest: 3 testes aprovados;
- build Astro: 24 páginas estáticas e sitemap gerados sem erros;
- Playwright: 36 cenários aprovados e 6 ignorados por serem verificações exclusivas de outro viewport;
- `npm audit --omit=dev`: 0 vulnerabilidades encontradas.

## Evidência visual

- capturas de página inteira nos três viewports mantidas fora do repositório;
- largura final das capturas igual à largura do viewport, sem overflow horizontal;
- 15 capturas responsivas reais dos projetos: desktop, tablet e mobile para cada case;
- 20 capturas complementares: quatro por projeto;
- imagens das galerias conferidas com proporção integral e `object-fit: contain`;
- preloader do Dom Pedro ausente em todas as capturas usadas no portfólio;
- hero PT/EN conferida sem corte e com recuperação de opacidade após rolar para baixo e voltar ao topo;
- fita cinética conferida em português e inglês.

As capturas de QA são artefatos temporários e ficam fora do repositório. O script reproduzível está em `scripts/capture-visual-qa.mjs`.

## Limite da entrega

O código está validado localmente e preparado para versionamento. Publicação, DNS, revisão jurídica e eventual analytics continuam dependendo de autorização externa; consulte `CONTENT_NEEDED.md`.
