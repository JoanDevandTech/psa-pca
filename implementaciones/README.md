# Implementaciones de referencia

Tres ejemplos mínimos que aplican la [PSA](../docs/psa.md) con stacks distintos. Los tres generan las mismas tres páginas (portada, servicio y artículo) con el mismo grafo JSON-LD; solo cambia cómo llega ese grafo al HTML inicial.

| Carpeta | Qué es | Cómo llega el grafo al HTML inicial |
| :-- | :-- | :-- |
| [`astro/`](astro/README.md) | Sitio estático con Astro. Es la implementación canónica | Generación estática en el build |
| [`react/`](react/README.md) | Generador estático con componentes de React | `renderToStaticMarkup` de `react-dom/server`, en el build |
| [`laravel/`](laravel/README.md) | Archivos para copiar en una aplicación Laravel existente | Renderizado en servidor con Blade |

Elige la que más se parezca a tu stack y lee su README: explica dónde va cada archivo, cómo ejecutarla y qué hay que cambiar para adaptarla.

## Los datos son ficticios

«Estudio Ejemplo», «Ana Ejemplo» y el dominio `ejemplo.example` no existen. Están para que el ejemplo se pueda ejecutar. No copies a un sitio real ningún nombre, URL ni dato de contacto de estas carpetas: sustitúyelos por los datos canónicos del sitio, como pide el [método](../docs/metodo.md).

## Qué tienen en común

- **Una fuente única de datos.** El nombre de la organización, las personas, los servicios y los datos de contacto viven en un solo archivo (`src/sitio.config.ts` en Astro y React, `config/psa.php` en Laravel). Las plantillas y el marcado leen de ahí, así que lo que se ve y lo que se declara no pueden divergir.
- **Un único módulo construye los nodos y sus `@id`** (`src/lib/schema.ts` en Astro y React, `app/Support/Psa.php` en Laravel). Ningún `@id` se escribe a mano en otro sitio, y el módulo falla si una página repite un `@id`.
- **Un solo bloque JSON-LD por página**, con un `@graph`, dentro del HTML que devuelve el servidor.

Los nodos que emite cada página:

| Página | Nodos del grafo |
| :-- | :-- |
| Portada | `ProfessionalService` (`#organization`), `WebSite` (`#website`), `WebPage` (`#page`) |
| Servicio | Los tres anteriores, más `BreadcrumbList` (`#breadcrumb`), `Service` (`#service`) y `FAQPage` (`#faq`) |
| Artículo | Los tres de la portada, más `Person`, `BreadcrumbList` (`#breadcrumb`) y `BlogPosting` (`#article`) |

Es un subconjunto del [grafo objetivo](../docs/psa.md#grafo-objetivo-por-tipo-de-página): los ejemplos no incluyen página de proyecto ni listados.

## Cómo comprobarlas

En Astro y en React, desde la carpeta de cada una:

```sh
npm install
npm run build
npm run verificar
```

`npm run verificar` pasa [`scripts/verificar-psa.mjs`](../scripts/verificar-psa.mjs) por las tres páginas generadas. En Laravel no hay build: se copian los archivos a una aplicación, se arranca el servidor y se pasa el verificador por las tres URL, como explica [su README](laravel/README.md).

El resultado esperado en las tres implementaciones es 0 errores y 0 avisos en cada página.

## En qué se diferencian

- **Astro y React comparten código.** `src/sitio.config.ts` y `src/lib/schema.ts` son copias exactas entre las dos carpetas; solo cambian las plantillas.
- **Las URL.** Astro y React generan rutas con barra final (`/servicios/integracion-de-apis/`); Laravel las sirve sin ella (`/servicios/integracion-de-apis`). El grafo es el mismo salvo por esa barra en las URL de página y en los `@id` que cuelgan de ellas.

## Qué no cubren

Implementan el grafo de la PSA y, en los textos de ejemplo, el [espejeo semántico](../docs/pca.md#espejeo-semántico) de la PCA. No incluyen las [capas complementarias](../docs/capas-complementarias.md) (versión Markdown, `llms.txt`, `robots.txt`) ni la [medición](../docs/medicion.md).
