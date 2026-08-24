# Inventário de assets

## Marca Noctem

| Asset | Origem | Uso |
|---|---|---|
| `assets-source/noctem-symbol-original.png` | arquivo oficial fornecido | fonte do símbolo, fora da saída pública |
| `public/assets/noctem-symbol.webp` | derivado otimizado | cabeçalho, preloader, hero, footer e case |
| `public/favicon.*` | símbolo oficial | favicon e compatibilidade |
| `public/og.png` | composição da identidade | Open Graph e social cards |

## Capturas responsivas

Cada projeto tem arquivos próprios, capturados da aplicação real em execução:

- desktop: `1440 × 900`;
- tablet: `1024 × 1366`;
- mobile: `390 × 844`.

As capturas ficam em `public/assets/projects/gallery/`, convertidas para WebP lossless para reduzir o peso sem alterar o conteúdo. O case Noctem também usa versões WebP em `public/assets/case/`.

## Telas adicionais dos cases

Cada projeto possui quatro capturas complementares:

- Noctem: projetos, serviços, sobre e contato;
- EletroCL: serviços, marcas, empresa e contato;
- Studio Bella: duas telas públicas atuais e duas telas administrativas;
- Dom Pedro: história, cardápio, encomendas e galeria;
- JK Copycenter: duas telas públicas atuais e duas telas administrativas.

As telas administrativas são capturadas manualmente e não exigem nem armazenam credenciais no projeto.

As galerias exibem a imagem inteira com `object-fit: contain`; não há recorte artificial de conteúdo. As capturas do Dom Pedro são feitas somente após o preloader da aplicação terminar.
