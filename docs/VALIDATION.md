# Registro de validação

Última revisão: 25 de setembro de 2026.

## Escopo

- 26 páginas estáticas: home, projetos, cinco cases, serviços, sobre, contato, política de privacidade e termos de uso, em PT e EN, mais as páginas 404;
- viewports: desktop `1440 × 900`, tablet `1024 × 1366` e mobile `390 × 844`, além de telas largas (até `2560 px`) em pontos específicos;
- modos: completo, `prefers-reduced-motion`, sem JavaScript e *lite* (aparelhos modestos).

## Evidência automatizada

| Verificação | Resultado |
|---|---|
| `astro check` | 0 erros, 0 warnings, 0 hints |
| Vitest | 7 testes (configuração do site e registro de consentimento) |
| Build | 26 páginas e sitemap |
| Playwright | 48 cenários em 3 viewports, 9 ignorados por serem exclusivos de outro viewport |
| `npm audit` | 0 vulnerabilidades |
| Varredura das 25 páginas do sitemap | nenhum erro de JavaScript, nenhuma violação de CSP, nenhum scroll horizontal |

O teste do link do WhatsApp abre `wa.me` e por isso precisa de acesso à internet. Ele passa no CI do GitHub.

## Desempenho (home, mesmo ambiente headless antes e depois das otimizações)

| Métrica | Antes | Depois |
|---|---|---|
| Download inicial | 737 KB | 459 KB |
| Rolagem no desktop | ~8,5 fps | ~20,7 fps |
| Tempo de CPU na rolagem (desktop) | ~25 s | ~4,3 s |
| Rolagem no mobile | ~50 fps | ~59 fps |

O ambiente de medição renderiza sem GPU, então os valores absolutos são baixos. Os números servem para comparação, não como referência de aparelhos reais.

## Evidência visual

- capturas de página inteira com e sem JavaScript, comparadas pixel a pixel após a limpeza de CSS legado (sem diferenças fora do conteúdo carregado sob demanda);
- abertura conferida quadro a quadro (um número da contagem por vez);
- mockups dentro do palco em todos os viewports e sem cantos das imagens para fora das molduras;
- contornos tipográficos sem sobreposição interna, também com `paint-order` desativado.

As capturas de QA são artefatos temporários e ficam fora do repositório (`.qa/`, via `npm run qa:capture`).
