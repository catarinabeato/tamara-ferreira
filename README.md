# Tamara Ferreira — website pessoal

Cartão de visita profissional digital. Bilingue Português de Portugal e Inglês.
Site estático, sem dependências externas e sem base de dados.

- **Páginas:** Home (página longa com âncoras), Sobre mim, Blog (listagem + artigo), Contactos, Política de Privacidade, Termos e Condições.
- **Idiomas:** `/pt/…` e `/en/…`, cada um com HTML próprio (indexável pelos motores de busca).
- **Sem dependências:** basta ter Node.js 18 ou superior instalado. Não há `npm install`.

---

## Começar

```bash
npm run build     # gera o site em dist/
npm start         # gera e abre a pré-visualização em http://localhost:4321
```

A pasta `dist/` é o site final: pode ser publicada tal como está em qualquer
alojamento estático (Netlify, Vercel, GitHub Pages, cPanel, FTP).

---

## Editar textos

Todo o conteúdo visível está em três ficheiros JSON. **Não é preciso tocar no código.**

| Ficheiro | O que contém |
| --- | --- |
| `content/pt.json` | Todos os textos em Português de Portugal |
| `content/en.json` | Todos os textos em Inglês |
| `content/site.json` | Domínio, email, morada, redes sociais, formulários e imagens |

Depois de editar, correr `npm run build`.

Regras a respeitar:

- **Nunca alterar os nomes das chaves** (o que está à esquerda dos dois pontos). Só os valores.
- `pt.json` e `en.json` têm de manter exactamente a mesma estrutura.
- Aspas dentro de um texto escrevem-se `\"`.

### Headlines com itálico

Os títulos grandes alternam maiúsculas e itálico na mesma frase. Cada linha é
um objecto, e as quebras de linha são intencionais:

```json
"taglineLines": [
  { "text": "Liderança",  "style": "italic" },
  { "text": "COM",        "style": "roman"  },
  { "text": "PROPÓSITO",  "style": "roman"  }
]
```

`italic` fica em itálico com caixa mista; `roman` fica em maiúsculas.
Acrescentar ou retirar linhas é seguro. O mesmo formato é usado em
`headlineLines`, nos títulos das páginas Sobre mim, Blog e Contactos.

### O nome na Home

O nome é o elemento com mais destaque do site: é o `h1` da Home, na maior
escala da página, e recebe o mesmo tratamento — `Tamara` em itálico, `FERREIRA`
em maiúsculas. Como não muda entre idiomas, está em `content/site.json`:

```json
"nameLines": [
  { "text": "Tamara",   "style": "italic" },
  { "text": "Ferreira", "style": "roman"  }
]
```

Para o pôr numa só linha, basta deixar uma entrada: `[{ "text": "Tamara
Ferreira", "style": "roman" }]`. A escala ajusta-se sozinha à largura do ecrã;
o tamanho máximo é `--fs-name`, no topo de `main.css`.

A frase de posicionamento (`taglineLines`) fica por baixo, a cerca de um terço
do tamanho do nome, para que a hierarquia se leia de imediato.

### Artigos do blog

Cada artigo é uma entrada em `posts`, dentro de `pt.json` e `en.json`:

```json
{
  "id": "clareza",                     // liga a versão PT à versão EN — tem de ser igual nos dois ficheiros
  "slug": "a-clareza-e-um-acto-de-lideranca",   // endereço da página, pode ser diferente em cada idioma
  "date": "2026-06-18",                // AAAA-MM-DD; a ordenação é automática, do mais recente para o mais antigo
  "category": "lideranca",             // lideranca | inspiracao | motivacao | marketing
  "image": "postLideranca",            // nome de uma entrada de site.json → images
  "title": "…",
  "excerpt": "…",
  "body": [
    { "type": "p",     "text": "parágrafo" },
    { "type": "h",     "text": "subtítulo" },
    { "type": "quote", "text": "citação em destaque" }
  ]
}
```

O `id` é o que permite ao selector PT|EN levar o visitante ao mesmo artigo no
outro idioma. Se um artigo só existir num idioma, o selector envia para a
listagem do blog — não dá erro.

Os nomes das categorias mostrados ao visitante estão em `categories`, nos dois
ficheiros de idioma. Para acrescentar uma categoria nova, basta acrescentá-la
em `categories` (PT e EN) e usar a chave no campo `category` de um artigo — o
filtro do blog actualiza-se sozinho.

---

## Substituir as fotografias

As imagens actuais são marcadores de posição em SVG, com a proporção escrita
na própria imagem. Cada uma está descrita em `content/site.json → images`, e o
campo `ratio` indica a proporção e o tamanho recomendado.

Para substituir:

1. Colocar a fotografia em `src/assets/img/` (por exemplo `tamara-hero.jpg`).
2. Em `content/site.json`, actualizar a entrada correspondente:

```json
"heroPortrait": {
  "src": "/assets/img/tamara-hero.jpg",
  "width": 1600,
  "height": 2000,
  "ratio": "4:5 (retrato) …"
}
```

3. Corrigir o texto alternativo em `content/pt.json` e `content/en.json`, em
   `imageAlt` — descreve a fotografia para quem não a consegue ver.
4. `npm run build`.

`width` e `height` devem corresponder aos pixels reais do ficheiro: é isso que
reserva o espaço na página e evita que o texto salte enquanto a imagem carrega.

### Proporções usadas

| Entrada | Proporção | Onde aparece |
| --- | --- | --- |
| `heroPortrait` | 4:5 — 1600×2000 | Fotografia principal da Home |
| `aboutPortrait` | 3:4 — 1200×1600 | Retrato na secção Sobre mim da Home |
| `aboutFull` | 4:5 — 1600×2000 | Retrato da página Sobre mim |
| `projectOne` / `projectTwo` | 16:9 — 1600×900 | Projectos na Home |
| `post…` | 3:2 — 1200×800 | Artigos. Nos cartões aparece a 3:2; no topo do artigo é recortada para 16:9, por isso convém deixar margem em cima e em baixo |
| `ogImage` | 1.91:1 — 1200×630 | Partilha em redes sociais |

### Formatos modernos (WebP / AVIF)

Por omissão é servido o ficheiro indicado em `src`. Se gerar versões mais leves
com o mesmo nome base — `tamara-hero.webp`, `tamara-hero.avif`, na mesma pasta —
active-as na entrada da imagem:

```json
"formats": ["avif", "webp"]
```

O gerador passa a produzir um `<picture>` e o browser escolhe o formato mais
leve que suporta. **Só activar depois de os ficheiros existirem**, senão a
imagem não aparece.

Todas as imagens já carregam com `loading="lazy"`, excepto as que estão acima da
dobra.

---

## Cores

Todas as cores estão no topo de `src/assets/css/main.css`, num único bloco
`:root`. Alterar aí muda o site inteiro.

O bloco tem duas partes:

- **Paleta da marca** (`--c-black`, `--c-bege`, `--c-gold`, …) — os valores
  entregues, tal como estão.
- **Tons de trabalho** (`--bg`, `--ink`, `--accent`, …) — o que os componentes
  usam de facto.

Os dourados da marca são luminosos de mais para texto pequeno sobre o bege
(`Gold #A07F3A` dá 3.19:1, abaixo do mínimo AA de 4.5:1). Por isso o texto de
acento usa versões escurecidas da mesma matiz, e os tons originais ficam
reservados para áreas grandes, fundos escuros e elementos decorativos. Se
alterar estes valores, vale a pena reverificar o contraste.

Outras variáveis úteis, no mesmo bloco:

- `--fs-name` — tamanho máximo do nome na Home. É a maior escala do site; se o
  aumentar, confirme que o botão da newsletter continua visível sem rolar.
- `--fs-tagline` — tamanho da frase de posicionamento, por baixo do nome.
- `--hero-overlap` — quanto a frase de apoio avança por cima da fotografia da
  Home (`0%` desliga a sobreposição, útil se a foto escolhida for escura do
  lado esquerdo).
- `--wrap`, `--wrap-narrow`, `--gutter` — largura da grelha e das colunas de texto.
- `--fs-display`, `--fs-title`, … — restante escala tipográfica.

---

## Tipografia

- **Playfair Display** — headlines (romano e itálico, contraste alto)
- **Barlow Condensed** — kickers, navegação e etiquetas, sempre em maiúsculas espaçadas
- **Lora** — corpo de texto

Os ficheiros estão alojados no próprio servidor, em `src/assets/fonts/`, e
declarados em `src/assets/css/fonts.css`. Não há qualquer pedido ao Google:
o IP dos visitantes nunca sai deste servidor, o que é coerente com a Política
de Privacidade e simplifica o cumprimento do RGPD.

Estão incluídos os subconjuntos `latin` e `latin-ext` (cobrem PT-PT e EN), com
`font-display: swap`. Os quatro cortes visíveis acima da dobra são
pré-carregados (`<link rel="preload">`); a lista está em
`src/templates/layout.js`, na constante `PRELOAD_FONTS`.

As fontes são distribuídas sob a SIL Open Font License 1.1.

---

## Formulários

Os formulários de newsletter e de contacto funcionam sem servidor.

Por omissão, `content/site.json → forms` está vazio e o botão abre o cliente de
email do visitante com a mensagem já preenchida. Funciona, mas depende do
visitante carregar em "enviar".

Para receber as mensagens directamente, criar um formulário num serviço como
Formspree, Netlify Forms ou Buttondown e colar o endereço:

```json
"forms": {
  "newsletterEndpoint": "https://formspree.io/f/xxxxxxxx",
  "contactEndpoint": "https://formspree.io/f/yyyyyyyy"
}
```

A partir daí o envio é feito em segundo plano e o visitante vê a mensagem de
confirmação sem sair da página.

O consentimento RGPD é obrigatório nos dois formulários e a Política de
Privacidade está ligada a partir de ambos.

---

## Morada e mapa

Em `content/site.json → contact`. Os valores actuais são de exemplo e **têm de
ser substituídos** antes de publicar:

- `addressLines` — morada, uma linha por elemento
- `email`, `phone`, `phoneHref`
- `mapEmbed` — endereço do mapa incorporado (Google Maps → Partilhar → Incorporar um mapa → copiar o `src` do iframe)
- `mapLink` — endereço para abrir o mapa numa janela nova

---

## Publicar

1. Em `content/site.json`, pôr o domínio final em `baseUrl` (sem barra no fim).
   É a partir daí que são gerados o `sitemap.xml`, os endereços canónicos e as
   etiquetas de partilha.
2. `npm run build`
3. Publicar o conteúdo de `dist/`.

Se o site ficar numa subpasta (por exemplo `exemplo.pt/tamara/`), preencher
também `basePath` com `"/tamara"`.

A raiz do site (`/`) detecta o idioma do browser e encaminha para `/pt/` ou
`/en/`, com ligações visíveis para quem tenha o JavaScript desactivado.

---

## O que está incluído

**SEO** — `title` e `meta description` por página, Open Graph e Twitter Card,
endereços canónicos, `hreflang` recíproco entre PT e EN com `x-default`,
`sitemap.xml` com alternativas de idioma, `robots.txt`, e dados estruturados
schema.org (`Person`, `WebSite`, `Blog`, `BlogPosting`, `ContactPage`).

**Acessibilidade** — contraste mínimo AA verificado em todas as páginas nos dois
idiomas, texto alternativo em todas as imagens, hierarquia de headings correcta
(um `h1` por página, sem saltos de nível), navegação completa por teclado, link
"saltar para o conteúdo", `aria-current` na página activa e estados anunciados
nos formulários e no filtro do blog.

**Performance** — HTML estático, uma folha de estilos, cerca de 6 kB de
JavaScript, tipos de letra locais com `preload` e `swap`, imagens com dimensões
declaradas e carregamento diferido. Zero pedidos a terceiros (excepto o mapa
incorporado, apenas na página de contactos).

**Movimento** — apenas uma transição de opacidade ao entrar no ecrã e um hover
discreto em links e botões. Sem carrosséis, vídeo de fundo, parallax,
contadores animados ou cursores personalizados. `prefers-reduced-motion` é
respeitado.

---

## Estrutura de ficheiros

```
content/          textos e configuração — é aqui que se edita
  site.json
  pt.json
  en.json

src/
  lib/html.js           utilitários de renderização
  templates/            modelos de cada página
  assets/css/main.css   estilos (cores no topo)
  assets/css/fonts.css  declarações dos tipos de letra
  assets/fonts/         ficheiros .woff2
  assets/img/           imagens e marcadores de posição

build.js          gerador estático
serve.js          servidor de pré-visualização
dist/             resultado gerado — não editar à mão
```

`dist/` é apagada e reconstruída a cada `npm run build`. Qualquer alteração
feita directamente nessa pasta perde-se.
