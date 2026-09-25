# Inventário de assets

## Marca Noctem

| Asset | Origem | Uso |
|---|---|---|
| `assets-source/noctem-symbol-original.png` | arquivo oficial fornecido | fonte do símbolo, fora da saída pública |
| `public/assets/noctem-symbol.webp` | derivado otimizado | cabeçalho, preloader, footer e case |
| `public/assets/noctem-symbol-hero.webp` | derivado com brilho embutido | lagartixa do hero (evita `drop-shadow` animado) |
| `public/favicon.png`, `public/favicon.ico` | símbolo oficial | favicon e compatibilidade |
| `public/og.png` | composição da identidade com Geist e Instrument Serif (`npm run assets:og`) | Open Graph e social cards |

## Capturas responsivas

Cada projeto tem arquivos próprios, capturados da aplicação real em execução:

- desktop: `1440 × 900`;
- tablet: `1024 × 1366`;
- mobile: `390 × 844`.

As capturas ficam em `public/assets/projects/gallery/`, convertidas para WebP com qualidade 84 (cerca de 85% menores que a versão lossless, sem perda visível em texto de interface). O case Noctem também usa versões WebP em `public/assets/case/`.

## Telas adicionais dos cases

Cada projeto possui quatro capturas complementares:

- Noctem: projetos, serviços, sobre e contato;
- EletroCL: serviços, marcas, empresa e contato;
- Studio Bella: duas telas públicas atuais e duas telas administrativas;
- Dom Pedro: história, cardápio, encomendas e galeria;
- JK Copycenter: duas telas públicas atuais e duas telas administrativas.

As telas administrativas são capturadas manualmente e não exigem nem armazenam credenciais no projeto.

As galerias exibem a imagem inteira com `object-fit: contain`; não há recorte artificial de conteúdo. As capturas do Dom Pedro são feitas somente após o preloader da aplicação terminar.

## Mídia cinematográfica

Gerada por `npm run assets:cinema` (`scripts/generate-cinema-assets.mjs`), sem banco de imagens de terceiros:

- `public/assets/reel/*.webp`: frames do showreel e prévias de serviços, recortados das capturas reais acima;
- `src/data/globe-points.json`: pontos de terra do globo, calculados a partir do Natural Earth (domínio público, via `world-atlas`);
- fontes Geist, Geist Mono e Instrument Serif: licença SIL Open Font License 1.1, servidas pelo próprio site via Fontsource.
