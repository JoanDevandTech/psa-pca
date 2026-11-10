# Capas complementarias

Las capas complementarias son cuatro ajustes técnicos que acompañan al modelo PCA-PSA sin formar parte de sus dos capas principales: que la página de error no se declare canónica, que cada página tenga una versión en Markdown, que el sitio publique un índice `llms.txt` y que el `robots.txt` deje escrita la política para los rastreadores de IA. Cuestan poco de aplicar, pero no son requisitos: la [guía de Google sobre IA generativa](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) dice que los datos estructurados, `llms.txt` y las versiones en Markdown no hacen falta para aparecer en sus funciones de IA, y que Google Search no usa ni `llms.txt` ni el Markdown.

Se aplican después del grafo de la [PSA](psa.md), porque algunas leen sus datos de él.

## Página 404 sin canónica y con `noindex`

La página de error no debe declararse como versión canónica de nada. Lleva `<meta name="robots" content="noindex, follow">` y no emite `<link rel="canonical">` ni el enlace a su versión Markdown. En la plantilla basta una opción del layout (por ejemplo, `sinCanonical`) que omita ambas etiquetas.

Comprobación: en el HTML generado de la 404 no aparece `rel="canonical"`.

## Versión Markdown de cada página

Cada página tiene una versión en Markdown con solo su contenido: sin navegación, pie, banner de cookies, scripts, estilos ni textos duplicados en otro idioma. Es lo que puede consumir un sistema que pide Markdown.

- Se genera en el build, a partir del HTML final (por ejemplo, `ruta/index.md` junto a `ruta/index.html`).
- El HTML la anuncia con `<link rel="alternate" type="text/markdown" href="…/index.md">`.
- Opcionalmente, el servidor la entrega cuando la petición llega con la cabecera `Accept: text/markdown`.
- Como el pie desaparece, el Markdown termina con una firma que lleva los datos de contacto de la organización. Esos datos se leen del nodo `#organization` del JSON-LD, no se duplican en el script.
- Las páginas del grupo de control conservan su Markdown sin cambios.

Esta versión también sirve para revisar el [espejeo semántico](pca.md#espejeo-semántico): leída sin diseño, cada sección debería entenderse sola.

## `llms.txt`

`llms.txt` es un índice en Markdown en la raíz del sitio, con el formato propuesto en [llmstxt.org](https://llmstxt.org). Se genera en el build:

- Encabezado con el nombre de la organización y una línea de descripción.
- Una sección por grupo de páginas, ordenadas por importancia (servicios antes que textos legales), con enlaces a las versiones Markdown.
- La sección `## Optional`, que el formato define como la que se puede omitir si falta contexto, para las páginas secundarias.
- Las páginas con `noindex` no se listan: lo que no se quiere indexar tampoco se anuncia.

## Rastreadores de IA en `robots.txt`

Un bloque encima de la regla general que nombra a los rastreadores de IA y fija qué pueden recorrer. Ejemplo con el sitio ficticio `ejemplo.example`, que tiene una zona privada en `/privado/`:

```text
# Rastreadores de IA. Este bloque no cambia el comportamiento (User-agent: *
# ya les permite todo): deja la política escrita en un solo sitio.
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
Allow: /
Disallow: /privado/

User-agent: *
Allow: /
Disallow: /privado/

Sitemap: https://ejemplo.example/sitemap.xml
```

Hay que ser honesto con lo que hace este bloque: si la regla general ya es `User-agent: *` con `Allow: /`, esos rastreadores ya estaban permitidos. No cambia nada; deja la política escrita y da un único sitio donde cambiarla. Afecta a todo el dominio, también a las páginas del grupo de control, pero no altera su HTML.

Los nombres de los user-agents cambian con el tiempo. Antes de escribir el bloque, comprueba cada uno en la documentación oficial del proveedor, y si no puedes confirmar un nombre, no lo incluyas:

| Proveedor | Tokens | Documentación oficial |
| :-- | :-- | :-- |
| OpenAI | `GPTBot`, `OAI-SearchBot`, `ChatGPT-User` | [Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots) |
| Anthropic | `ClaudeBot`, `Claude-SearchBot`, `Claude-User` | [Centro de ayuda de Claude](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Perplexity | `PerplexityBot`, `Perplexity-User` | [Perplexity Crawlers](https://docs.perplexity.ai/guides/bots) |
| Google | `Google-Extended` | [Rastreadores comunes de Google](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) |

Cada proveedor distingue en su documentación entre el rastreador que recoge contenido para entrenar modelos, el que alimenta su buscador y el que visita una página cuando un usuario lo pide; léela para decidir qué permitir a cada uno. Los que actúan a petición de un usuario pueden no seguir las reglas de `robots.txt`, según indica la propia documentación de Perplexity.

**`Google-Extended` no es un rastreador.** Es un token de control: no tiene user-agent propio en las peticiones HTTP, Google rastrea con sus agentes habituales y el token solo indica si ese contenido puede usarse para los modelos Gemini. Según la documentación de Google, no afecta a la inclusión ni a la posición en la Búsqueda de Google.

## Qué no hacen estas capas

No garantizan que ningún sistema las lea ni que una página se cite. Ordenan cómo se entrega el sitio a quien sí las use; el efecto, si lo hay, se mide como se explica en [medición](medicion.md).
