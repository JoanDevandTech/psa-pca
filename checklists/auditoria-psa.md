# Auditoría de la PSA

Checklist para auditar el grafo JSON-LD y el HTML inicial de una página según las tres reglas de la [PSA](../docs/psa.md), más las [capas complementarias](../docs/capas-complementarias.md) y la [medición](../docs/medicion.md). Revisa una o dos páginas por tipo y las del grupo de control.

Los puntos marcados **[script: error]** o **[script: aviso]** los comprueba automáticamente [`scripts/verificar-psa.mjs`](../scripts/verificar-psa.mjs); el resto se revisa a mano. El script lee la página como la recibe un rastreador que no ejecuta JavaScript:

```sh
node scripts/verificar-psa.mjs https://ejemplo.example/servicios/integracion-de-apis/
node scripts/verificar-psa.mjs ./dist/index.html
node scripts/verificar-psa.mjs <url> --ua "GPTBot/1.0" --json
```

(`ejemplo.example` es un dominio ficticio.) Necesita Node 18 o superior. Sale con código 1 si hay algún error y con 0 si solo hay avisos o todo está bien. Un aviso no bloquea, pero se revisa: si señala un `name` no visible, se corrige el dato.

## Lo visible manda

- [ ] **[script: aviso]** El `name` y el `headline` de cada nodo aparecen en el texto visible o en el `<title>`. Se comprueba también el texto de cada pregunta (`Question`) de las FAQ; no se comprueban las respuestas ni los nodos auxiliares (direcciones, elementos de lista, imágenes…).
- [ ] Las respuestas del nodo `FAQPage` son las mismas que se leen en la página, y ambas salen de la misma fuente en el código.
- [ ] El resto de datos del marcado (descripción, teléfono, fechas, imagen, tecnologías, autor) también se ven en la página.
- [ ] El nombre de cada persona en el marcado es el que está escrito en la página.
- [ ] `Person` y `founder` solo aparecen en páginas que nombran a esa persona en el texto.
- [ ] No hay `foundingDate` ni `legalName` que no sean ciertos.
- [ ] No hay `aggregateRating` ni `Review` construidos con reseñas de plataformas de terceros.
- [ ] `dateModified` sale de una fecha real de revisión del contenido o, si no existe, de la de publicación; nunca de la fecha del build.

## Una entidad, un `@id`

- [ ] **[script: error]** No hay dos nodos con el mismo `@id` en la página.
- [ ] **[script: error]** Cada referencia `{ "@id": "…" }` apunta a un nodo definido en la misma página.
- [ ] **[script: aviso]** Ningún nodo queda sin `@id`, salvo los auxiliares que el script reconoce como anidados (direcciones, elementos de lista, preguntas y respuestas, imágenes, ofertas…).
- [ ] **[script: aviso]** La página declara `<link rel="canonical">`.
- [ ] **[script: aviso]** Algún nodo usa la canónica como `url` (normalmente, `#page`).
- [ ] Hay un único bloque JSON-LD por página, con un `@graph`. El script acepta varios bloques, así que esto se comprueba aparte: `grep -o 'application/ld+json' archivo.html | wc -l` sobre el HTML generado debe dar 1.
- [ ] `#organization` y `#website` están en todas las páginas y el resto de nodos sigue el [grafo objetivo](../docs/psa.md#grafo-objetivo-por-tipo-de-página) de su tipo.
- [ ] La página y la entidad que describe son nodos distintos: `#page` es un `WebPage` (o `AboutPage`, `ContactPage`, `CollectionPage`) y su `mainEntity` apunta al `Service`, `BlogPosting`, `CreativeWork`… correspondiente.
- [ ] Los `@id` siguen las [convenciones](../docs/psa.md#convenciones-de-id): los globales sobre la raíz con barra final, los de página sobre la URL canónica.
- [ ] En el código, los `@id` se construyen con las mismas funciones y no se escriben a mano en otro sitio.
- [ ] No se publican campos vacíos (`"sameAs": []`).

## En el HTML inicial

- [ ] **[script: error]** Hay al menos un `<script type="application/ld+json">` en el HTML que devuelve el servidor. Si el navegador lo muestra pero el script no lo encuentra, se está inyectando en cliente.
- [ ] **[script: error]** Cada bloque JSON-LD es JSON válido.
- [ ] Se ha probado la URL publicada, no solo el archivo generado, si el sitio usa renderizado en servidor; y con el user-agent de algún rastreador de IA (`--ua`) si el servidor responde distinto según quién pide.
- [ ] Al incrustar el JSON, el signo «menor que» se escapa como la secuencia `\u003c` (barra invertida, u, 0, 0, 3, c).
- [ ] Tras desplegar, la portada, un servicio, un artículo y un proyecto pasan por [validator.schema.org](https://validator.schema.org/) y por la [prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results), con la fecha anotada.

## Capas complementarias

- [ ] La página 404 lleva `noindex` y no emite `rel="canonical"` ni el enlace a una versión Markdown.
- [ ] Cada página indexable tiene su versión Markdown, sin navegación, pie, banner de cookies ni scripts.
- [ ] El HTML anuncia esa versión con `<link rel="alternate" type="text/markdown">`.
- [ ] La versión Markdown termina con una firma que lleva los datos de contacto de la organización, leídos del nodo `#organization`.
- [ ] `llms.txt` existe en la raíz, se genera en el build, ordena las páginas por importancia y no lista páginas con `noindex`.
- [ ] El `robots.txt` tiene un bloque para los rastreadores de IA encima de la regla general.
- [ ] Cada user-agent de ese bloque está confirmado en la documentación oficial de su proveedor.

## Medición

- [ ] La línea base está guardada con su fecha antes del primer despliegue del modelo.
- [ ] Hay un grupo de control escrito, y su JSON-LD y su Markdown son idénticos a los de antes del modelo (`diff` vacío tras cada despliegue).
- [ ] La analítica tiene un canal para asistentes de IA cuyas reglas van antes que las de los buscadores.
- [ ] Está documentado qué parámetros llegan a la capa de datos en una visita desde un asistente.
- [ ] Los registros del servidor se conservan y se pueden filtrar por user-agent de los rastreadores de IA.
- [ ] La batería fija de prompts está escrita y tiene anotada al menos una pasada completa.
- [ ] Está anotada la fecha de despliegue de cada fase.

Para corregir lo que falle, sigue el orden del [método](../docs/metodo.md).
