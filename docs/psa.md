# PSA: Programación Semántica Artificial

La Programación Semántica Artificial (PSA) es la capa técnica del modelo PCA-PSA: codifica las entidades de un sitio (la organización, las personas, los servicios, los artículos y las propias páginas) como datos enlazados en JSON-LD con vocabulario de Schema.org, con un identificador estable (`@id`) para cada una, y los entrega en el HTML inicial de cada página. Su objetivo es que un sistema pueda saber sin ambigüedad de quién es un contenido y cómo se relacionan sus entidades. Describe lo mismo que ya dice el contenido visible, que es responsabilidad de la [PCA](pca.md).

El modelo se presentó en el artículo [«Programación Neurolingüística en la época de la IA: el modelo PCA-PSA para GEO»](https://kromagency.es/blog/modelo-pca-psa-geo/).

## Las tres reglas de la PSA

1. **Lo visible manda.** Todo dato del JSON-LD está también escrito en la página. Las directrices de datos estructurados de Google exigen que el marcado refleje el contenido visible, y muchos sistemas generativos descartan los `<script>` y solo leen el texto. El marcado no puede decir nada que el texto no diga.
2. **Una entidad, un `@id`.** Cada organización, persona, servicio y página tiene un identificador estable, y los nodos se enlazan por referencia (`{ "@id": "…" }`) en lugar de copiarse. Un bloque suelto sin `@id` no dice a qué página ni a qué empresa pertenece.
3. **En el HTML inicial.** Muchos rastreadores de IA no ejecutan JavaScript, aunque Googlebot sí renderice. Un JSON-LD inyectado en el navegador, por ejemplo en una SPA, es invisible para ellos. El bloque se entrega con renderizado en servidor o con generación estática.

El verificador [`scripts/verificar-psa.mjs`](../scripts/verificar-psa.mjs), que lee la página como la recibe un rastreador sin JavaScript, comprueba automáticamente parte de la segunda y la tercera regla (`@id` duplicados, referencias sin resolver, nodos sin `@id`, y que el JSON-LD esté en el HTML inicial y sea válido) y avisa cuando un `name` o un `headline` no aparece ni en el texto visible ni en el `<title>`. El resto se revisa a mano con la [checklist de la PSA](../checklists/auditoria-psa.md).

## La PSA como «API pasiva», con salvedades

Se puede pensar en la PSA como una «API pasiva» incrustada en la página: no es un endpoint al que se llama, pero ofrece a quien la lee un conjunto de datos limpio en lugar de obligarle a deducir relaciones a partir de cómo está maquetado el HTML.

La analogía tiene un límite claro. No todos los rastreadores de IA ni todos los sistemas RAG procesan JSON-LD; muchos convierten el HTML a Markdown y tiran las etiquetas `<script>`. La PSA no garantiza que alguien lea los datos; facilita el mapeo de entidades a los sistemas que sí trabajan con grafos de conocimiento. Por eso el contenido visible nunca depende de ella: si una información solo está en el JSON-LD, para muchos sistemas no existe.

## De nodos aislados a un grafo

Un error habitual es emitir varios bloques JSON-LD independientes en la misma página: uno para la organización, otro para las migas de pan, otro para las FAQ, cada uno sin `@id`. Son esquemas desconectados. La PSA los sustituye por **un único bloque por página** con un `@graph` en el que todos los nodos tienen `@id` y se enlazan entre sí: la página pertenece al sitio, el sitio lo publica la organización, el servicio lo presta la organización y la página trata del servicio.

Este es el ejemplo publicado en el artículo, con las entidades de Krom Agency (organización, persona y servicio), tal cual:

```html
<!-- PSA (JSON-LD): conexión de entidades explícitas mediante @id -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://kromagency.es/#organization",
      "name": "Krom Agency",
      "url": "https://kromagency.es/",
      "founder": { "@id": "https://kromagency.es/#joan-torres" },
      "sameAs": ["https://www.linkedin.com/company/krom-agency-es/"]
    },
    {
      "@type": "Person",
      "@id": "https://kromagency.es/#joan-torres",
      "name": "Joan Sebastian Torres Velandia",
      "jobTitle": "Fundador",
      "worksFor": { "@id": "https://kromagency.es/#organization" },
      "sameAs": ["https://www.linkedin.com/in/joantorreses"]
    },
    {
      "@type": "Service",
      "@id": "https://kromagency.es/servicios/auditoria-de-software/#service",
      "name": "Auditoría de software",
      "provider": { "@id": "https://kromagency.es/#organization" }
    }
  ]
}
</script>
```

Las [implementaciones de referencia](../implementaciones/README.md) generan este tipo de grafo con datos de una empresa ficticia.

## Grafo objetivo por tipo de página

Los nodos `#organization` y `#website` van en todas las páginas. El nodo `#page` es la propia página; los demás son las entidades de las que trata.

| Tipo de página | Nodo `#page` | Nodos propios | Enlaces |
| :-- | :-- | :-- | :-- |
| Portada | `WebPage` | — | `#page.mainEntity → #organization` |
| Servicio | `WebPage` | `Service #service`, `BreadcrumbList #breadcrumb`, `FAQPage #faq` si hay FAQ | `#page.mainEntity → #service`; `#service.provider → #organization`; `#page.breadcrumb → #breadcrumb`; `#faq.isPartOf → #page` |
| Entrada de blog | `WebPage` | `BlogPosting #article`, `BreadcrumbList`, `Person` si firma una persona | `#page.mainEntity → #article`; `#article.author → Person` u `#organization`; `#article.publisher → #organization` |
| Guía o artículo de ayuda | `WebPage` | `Article #article`, `BreadcrumbList` | `#article.author` y `#article.publisher → #organization` |
| Proyecto o caso | `WebPage` | `CreativeWork #project`, `BreadcrumbList` | `#page.mainEntity → #project`; `#project.creator → #organization` |
| Listado de una categoría | `CollectionPage` | `ItemList #list`, `BreadcrumbList` | `#page.mainEntity → #list` |
| Quiénes somos | `AboutPage` | `Person` | `#page.mainEntity → #organization`; `#organization.founder → Person` |
| Contacto y citas | `ContactPage` | — | `#page.mainEntity → #organization` |
| Listados e índices | `CollectionPage` | `BreadcrumbList` donde haya migas | — |
| Legales, error y utilidades | `WebPage` | — | — |
| Páginas del grupo de control | sin cambios | sin cambios | sin cambios |

Las páginas del grupo de control conservan exactamente el marcado que tenían antes de aplicar el modelo, para poder comparar su evolución con la del resto (ver [medición](medicion.md)).

Una página no es lo mismo que la entidad que describe: la página de un servicio es un `WebPage` cuyo `mainEntity` es un nodo `Service` distinto. `Service` o `Article` no se usan como tipo de la página.

## Convenciones de `@id`

- **Entidades globales**, sobre la raíz del sitio con barra final, igual que su canónica:
  - `https://ejemplo.example/#organization`
  - `https://ejemplo.example/#website`
  - la persona, con un fragmento formado a partir de su nombre: `https://ejemplo.example/#ana-ejemplo`. Ese fragmento no cambia aunque cambie el cargo.
- **Entidades de página**, sobre la URL canónica de la página:
  - `#page` (la página), `#service`, `#article`, `#project`, `#breadcrumb`, `#faq`, `#list`.
  - Por ejemplo: `https://ejemplo.example/servicios/integracion-de-apis/#service`.

Los identificadores se construyen siempre con las mismas funciones y nunca se escriben a mano en otro sitio; así una referencia no puede apuntar a un `@id` distinto del que define el nodo. Si dos nodos de la misma página comparten `@id`, el build debe fallar. Los campos vacíos no se publican (nada de `"sameAs": []`). Al incrustar el JSON en `<script>`, el signo «menor que» se escapa como la secuencia `\u003c` (barra invertida, u, 0, 0, 3, c) para que un valor nunca cierre el bloque.

(Estudio Ejemplo, Ana Ejemplo y `ejemplo.example` son ficticios.)

## Decisiones que se pueden generalizar

- **`Person` y `founder` solo donde la persona se nombra en el texto visible.** En el resto de páginas, la organización no lleva `founder` y no se emite el nodo `Person`. El `name` de la persona es el que se lee en la página.
- **No se publican `foundingDate` ni `legalName` si no son ciertos.** Si hay dudas sobre el dato, o la página no lo dice, el campo se omite.
- **No se marcan `aggregateRating` ni `Review` con reseñas de plataformas de terceros.** Las reseñas pueden seguir visibles con enlace a la plataforma donde se publicaron, pero no se presentan en el marcado como propias.
- **`FAQPage` sigue siendo Schema.org válido.** Según el [registro de cambios de Google Search Central](https://developers.google.com/search/updates), Google retiró en mayo de 2026 el resultado enriquecido de FAQ para todos los sitios. Se puede seguir marcando, porque da a cada pregunta y respuesta una forma inequívoca, pero no hay que esperar ningún resultado enriquecido. Las preguntas y respuestas del marcado son las mismas cadenas que pinta la página, leídas de la misma fuente.
- **`dateModified` necesita una fuente real.** Es la fecha de la última revisión de fondo del contenido; si no existe, se usa la de publicación. Nunca la fecha del build.
- **Solo campos que la página muestra.** Fechas, imágenes, tecnologías o autor se pasan al nodo únicamente si la página los pinta.

## Validación

Google aplica directrices estrictas: el marcado tiene que reflejar fielmente el contenido visible, y las incongruencias pueden acabar en acciones manuales. Para un sistema de IA, mantener esa congruencia reduce la fricción al extraer los datos.

En la práctica:

1. Antes de desplegar, pasa [`scripts/verificar-psa.mjs`](../scripts/verificar-psa.mjs) por las páginas representativas de cada tipo. Un error bloquea; un aviso de `name` no visible significa que el marcado dice algo que la página no dice, y se corrige el dato, no el aviso.
2. Después de desplegar, pasa la portada, un servicio, un artículo y un proyecto por [validator.schema.org](https://validator.schema.org/) y por la [prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results), y anota la fecha de despliegue.

La lista completa está en la [checklist de auditoría de la PSA](../checklists/auditoria-psa.md).

## Qué no promete

- PCA-PSA es una propuesta metodológica, no un resultado demostrado. La PSA no garantiza citas ni que un motor lea el JSON-LD.
- La [guía de Google sobre IA generativa](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) dice que los datos estructurados no son un requisito para aparecer en sus funciones de IA.
- Lo que hace la PSA es ordenar las entidades del sitio y hacerlas inequívocas para quien sí procese el marcado. El efecto se mide aparte (ver [medición](medicion.md)).
