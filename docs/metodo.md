# Método

El método aplica el modelo PCA-PSA a un sitio en siete fases, en este orden: datos canónicos, medición y línea base, grafo de la PSA, anclaje de entidades, capas complementarias, espejeo semántico por lotes y reencuadre de intención. Cada fase es un cambio independiente y revisable, con un criterio de aceptación que se puede comprobar antes de pasar a la siguiente. La teoría de cada capa está en [PCA](pca.md), [PSA](psa.md), [capas complementarias](capas-complementarias.md) y [medición](medicion.md); aquí solo se ordena el trabajo.

El modelo se presentó en el artículo [«Programación Neurolingüística en la época de la IA: el modelo PCA-PSA para GEO»](https://kromagency.es/blog/modelo-pca-psa-geo/). Es una propuesta metodológica, no un resultado demostrado: aplicar el método no garantiza citas ni tráfico.

## Por qué este orden

| Orden | Fase | Depende de | Por qué va aquí |
| :-- | :-- | :-- | :-- |
| 0 | Datos canónicos | — | La PCA y la PSA leen de aquí. Si un nombre o una cifra no tiene una única fuente, el texto y el marcado acaban diciendo cosas distintas. |
| 1 | Medición y línea base | — | Sin el punto de partida, un grupo de control y un canal propio para los asistentes de IA, ningún cambio posterior se puede atribuir al modelo. Puede avanzar en paralelo a las fases 0 y 2, pero la línea base tiene que estar tomada antes de desplegar cualquier cambio que altere lo que publican las páginas. |
| 2 | Grafo de la PSA | 0 | Las fases siguientes se comprueban contra el grafo: el verificador detecta cuándo un cambio de texto deja un `name` del marcado sin respaldo visible. |
| 3 | Anclaje de entidades | 0 | Unifica nombres y cifras con la fuente única antes de reescribir encabezados. |
| 4 | Capas complementarias | 2 | La firma de la versión Markdown lee los datos de contacto del nodo de la organización. |
| 5 | Espejeo semántico, por lotes | 2, 3 | Reescribe encabezados y primeras frases con los nombres ya anclados, y cada cambio de nombre de un servicio se refleja en su nodo `Service`. |
| 6 | Reencuadre de intención | 5 | Diferencia páginas que compiten cuando sus títulos y encabezados ya son definitivos. |

Reglas comunes a todas las fases:

- **No se inventa nada.** Si un paso necesita un dato que no está en el sitio ni en sus fuentes, se pregunta a quien lo sabe y el paso afectado espera.
- **El grupo de control no se toca.** Sus páginas conservan contenido, marcado y versión Markdown (ver [medición](medicion.md#grupo-de-control)). Cada fase termina comprobando que siguen idénticas.
- **No se cambia ninguna URL.** Ninguna fase fusiona, redirige ni borra páginas.
- **No se publican resultados** que no estén medidos con el método de [medición](medicion.md).

## Fase 0: datos canónicos

**Objetivo.** Que el nombre de la marca, de cada persona, de cada servicio y las cifras que se repiten vivan en un único sitio del código, del que leen tanto las plantillas como el JSON-LD.

**Qué necesitas.**

- El nombre canónico de la marca y su forma corta, si la hay.
- Cada persona que aparece en el sitio: su nombre tal como se lee en la página, su cargo y sus perfiles públicos.
- El nombre canónico de cada servicio.
- Las cifras que se repiten entre páginas (años, número de proyectos, plazos) con su valor correcto, confirmado por quien lo sabe.
- La autoría de los artículos: quién firma cada uno.

**Qué haces.**

1. Crea o amplía la fuente única (un archivo de configuración, por ejemplo) con esos datos. A cada persona le das un identificador corto que formará su `@id` y que no cambiará aunque cambie el cargo.
2. Normaliza la autoría de los artículos: cada uno se atribuye a una persona solo si consta que lo firma; si no, a la organización.
3. Si el sistema de contenidos admite fecha de revisión, añade el campo, opcional y vacío por defecto. Es la fuente real de `dateModified`; no se rellena con la fecha del build.

**Criterio de aceptación.** Buscar en el código cualquier forma antigua o alternativa de los nombres (por ejemplo, el usuario por defecto del gestor de contenidos como autor) no devuelve resultados fuera de la fuente única y de las citas literales de terceros. El build pasa.

**Qué no haces.** No eliges tú una cifra cuando dos páginas dan versiones distintas: mientras no haya respuesta, no se toca. No atribuyes un artículo a una persona sin confirmarlo. No despliegas ningún cambio que altere lo que publican las páginas antes de que la línea base de la fase 1 esté tomada.

## Fase 1: medición y línea base

**Objetivo.** Fijar el punto de partida, apartar un grupo de control y separar en la analítica el tráfico que llega desde asistentes de IA. El detalle está en [medición](medicion.md).

**Qué necesitas.** Acceso a Search Console, a la herramienta de analítica y, si se conservan, a los registros de acceso del servidor. La lista de páginas que formarán el grupo de control, acordada con la persona responsable del sitio.

**Qué haces.**

1. Exporta la línea base: clics, impresiones y posición por página de los últimos tres meses (con el grupo de control separado), sesiones por fuente/medio y página de entrada, y las visitas de rastreadores de IA en los registros si existen.
2. Elige el grupo de control entre páginas que ya tengan tráfico. Si comparten plantilla o scripts de build con el resto, protégelas en el código para que sigan emitiendo exactamente el marcado y el Markdown de antes.
3. Guarda una copia del HTML y del Markdown generados de cada página de control. Es la referencia con la que se comparará tras cada fase.
4. Añade a la analítica un canal para asistentes de IA, con sus reglas **antes** que las de los buscadores, y documenta qué parámetros llegan a la capa de datos en una visita desde un asistente.
5. Redacta la batería fija de prompts y haz la primera pasada completa.
6. Abre un registro con la fecha de despliegue de cada fase.

**Criterio de aceptación.** Los ficheros de la línea base están guardados con su fecha. La lista del grupo de control está escrita. Leyendo el código de la analítica, la primera regla que coincide con `gemini.google.com` y con `copilot.microsoft.com` es la del canal de asistentes, no la de un buscador. La primera pasada de la batería está anotada por consulta y por asistente.

**Qué no haces.** No cambias la batería de prompts entre mediciones. No excluyes al grupo de control de lo que afecta a todo el dominio (el `robots.txt`, el script de analítica): el canal de IA tiene que medirse igual en los dos grupos.

## Fase 2: grafo de la PSA

**Objetivo.** Un único bloque `<script type="application/ld+json">` por página, con un `@graph` en el que todos los nodos tienen `@id` y se enlazan por referencia, entregado en el HTML inicial. Cumple las tres reglas de la [PSA](psa.md#las-tres-reglas-de-la-psa): lo visible manda; una entidad, un `@id`; en el HTML inicial.

**Qué necesitas.** Los datos canónicos de la fase 0. La lista de tipos de página del sitio y, para cada tipo, una o dos páginas representativas. La lista del grupo de control.

**Qué haces.**

1. Escribe en un único módulo las funciones que construyen los `@id` y los nodos, siguiendo las [convenciones de `@id`](psa.md#convenciones-de-id). Ningún `@id` se escribe a mano fuera de ese módulo.
2. Haz que la plantilla común monte un solo `@graph` por página con `#organization`, `#website`, el nodo `#page` y los nodos propios de cada tipo, según el [grafo objetivo](psa.md#grafo-objetivo-por-tipo-de-página).
3. Migra cada plantilla: los bloques sueltos (migas, FAQ, listas) pasan a ser nodos del grafo con su `@id`, y desaparecen sus `<script>` separados.
4. Haz que el build falle si dos nodos de la misma página comparten `@id`, que no publique campos vacíos y que escape el signo «menor que» al incrustar el JSON.
5. Deja intacto el marcado de las páginas de control.

**Criterio de aceptación.**

- [`scripts/verificar-psa.mjs`](../scripts/verificar-psa.mjs) da 0 errores en las páginas representativas de cada tipo, sobre el HTML generado o sobre la URL servida:

  ```sh
  node scripts/verificar-psa.mjs ./dist/index.html
  node scripts/verificar-psa.mjs https://ejemplo.example/servicios/integracion-de-apis/ --ua "GPTBot/1.0"
  ```

  (`dist/` es la carpeta de salida del build; `ejemplo.example` es un dominio ficticio.) El script sale con código 1 si hay errores. Los avisos se revisan uno a uno: si un `name` no aparece en el texto visible, se corrige el dato, no el aviso.
- Fuera del grupo de control, cada página generada tiene exactamente un bloque JSON-LD. Este comando no debe listar ninguna:

  ```sh
  for f in $(find dist -name index.html); do
    n=$(grep -o 'application/ld+json' "$f" | wc -l | tr -d ' ')
    [ "$n" -eq 1 ] || echo "$f: $n"
  done
  ```

  (excluye de la lista las rutas del grupo de control).
- El JSON-LD y el Markdown de las páginas de control son idénticos a la copia de la fase 1 (`diff` vacío).
- Si el sitio ya generaba versiones Markdown o `llms.txt`, se siguen generando.
- Tras desplegar, la portada, un servicio, un artículo y un proyecto pasan por [validator.schema.org](https://validator.schema.org/) y por la [prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results), y la fecha de despliegue queda anotada.

**Qué no haces.** No pones en el marcado ningún dato que la página no muestre. No emites `Person` ni `founder` donde la persona no se nombra en el texto. No publicas `foundingDate` ni `legalName` si no son ciertos, ni `aggregateRating` o `Review` con reseñas de plataformas de terceros. No usas la fecha del build como `dateModified`. No inyectas el JSON-LD en el navegador.

## Fase 3: anclaje de entidades

**Objetivo.** Que cada entidad tenga un solo nombre y cada dato un solo valor en todo el sitio. Aplica las reglas del [anclaje de entidades](pca.md#anclaje-de-entidades).

**Qué necesitas.** La fuente única de la fase 0, con las respuestas sobre cifras y autoría ya confirmadas.

**Qué haces.**

1. Sustituye los nombres antiguos de la marca en el contenido propio por el nombre canónico. Las citas literales de terceros, como las reseñas, se quedan como están.
2. Aplica la regla del nombre completo primero: la primera mención de la empresa en el cuerpo de cada página y en el `<title>` usa el nombre completo. Lleva todos los `<title>` a un único patrón.
3. Haz que cada cifra repetida se lea de la fuente única en todas las páginas.
4. Pon los datos de contacto en el cuerpo de la página de contacto, leídos de la fuente única.
5. Añade junto a cada persona una frase de identidad que se entienda sola, construida solo con datos ya publicados.
6. Elimina restos que no son contenido (texto pegado por error de otra herramienta, por ejemplo).

**Criterio de aceptación.** Buscar en el código las formas antiguas del nombre solo devuelve citas literales de terceros. Cada cifra repetida aparece en el código una sola vez, en la fuente única. La versión Markdown de la página de contacto contiene los datos de contacto. El verificador no da errores nuevos y el grupo de control sigue idéntico.

**Qué no haces.** No corriges una cifra sin confirmación. No añades datos nuevos en la frase de identidad. No tocas citas de terceros.

## Fase 4: capas complementarias

**Objetivo.** Aplicar los cuatro ajustes de las [capas complementarias](capas-complementarias.md): la 404 sin canónica y con `noindex`, una versión Markdown de cada página, el índice `llms.txt` y el bloque de rastreadores de IA en `robots.txt`.

**Qué necesitas.** El grafo de la fase 2 (la firma del Markdown lee el nodo `#organization`). La documentación oficial de cada proveedor cuyos rastreadores vayas a nombrar.

**Qué haces.** Lo que describe cada sección de [capas complementarias](capas-complementarias.md), omitiendo lo que el sitio ya tenga hecho.

**Criterio de aceptación.**

- El HTML generado de la 404 contiene `noindex` y no contiene `rel="canonical"`.
- Cada página indexable tiene su versión Markdown, anunciada con `<link rel="alternate" type="text/markdown">`, y la firma lleva los datos de contacto de la organización.
- `llms.txt` se genera en el build y no lista páginas con `noindex`.
- Cada user-agent del `robots.txt` está confirmado en la documentación oficial de su proveedor.
- El Markdown de las páginas de control es idéntico a la copia de la fase 1.

**Qué no haces.** No incluyes un user-agent cuyo nombre no hayas podido confirmar. No presentas estas capas como requisito para aparecer en ningún buscador o asistente. No cambias el Markdown de las páginas de control.

## Fase 5: espejeo semántico, por lotes

**Objetivo.** Que cada encabezado sea una pregunta real o una afirmación autocontenida y que la primera frase debajo la responda. Aplica las siete reglas del [espejeo semántico](pca.md#espejeo-semántico).

**Qué necesitas.** Los nombres anclados de la fase 3. Los lotes en que se divide el sitio: por ejemplo, servicios, portada, blog, guías y resto.

**Qué haces.**

1. Trabaja un lote cada vez, en un cambio independiente.
2. Prepara una tabla antes/después con todos los encabezados y primeras frases que cambian en el lote, y deja que la persona responsable la revise antes de publicar.
3. Si un eslogan deja de ser H1, pásalo a la línea sobre el H1 o al subtítulo.
4. Cuando las FAQ se pinten y se marquen, haz que el texto visible y el nodo `FAQPage` lean las mismas preguntas y respuestas de una sola lista.
5. Si cambias el H1 de un servicio, actualiza el `name` de su nodo `Service`.
6. Cambia a la vez todas las versiones de idioma de cada texto.

**Criterio de aceptación.** La tabla antes/después está revisada. Leída la versión Markdown de cada página tocada, cada sección se entiende sola. El verificador no da errores nuevos y no aparecen avisos nuevos de `name` no visible. El grupo de control sigue idéntico.

**Qué no haces.** No cambias el significado de ninguna frase ni añades datos, cifras o afirmaciones de resultados: solo reordenas y reformulas lo que la página ya dice. Si para responder en la primera frase falta un dato, lo preguntas. No mezclas lotes en un mismo cambio.

## Fase 6: reencuadre de intención

**Objetivo.** Que las páginas que compiten por la misma consulta apunten cada una a una intención distinta. Aplica el [reencuadre de intención](pca.md#reencuadre-de-intención).

**Qué necesitas.** Los títulos y encabezados ya espejeados de la fase 5. Datos de Search Console sobre qué páginas aparecen para las mismas consultas, si los hay.

**Qué haces.**

1. Detecta los pares o grupos de páginas que compiten: `<title>`, H1 o descripción casi iguales, o la misma consulta.
2. Asigna una intención a cada página (por ejemplo, empresa frente a servicio, o enfoque técnico frente a enfoque local) y diferencia `<title>`, H1 y descripción para que apunten a ella.
3. Enlaza las páginas hermanas con un texto que diga la diferencia.
4. Si crees que dos páginas deberían fusionarse, redirigirse o borrarse, escribe una propuesta razonada aparte para que la persona responsable decida. Si se aprueba, irá en otro cambio, con su redirección 301.

**Criterio de aceptación.** Hay una tabla con cada grupo de páginas que competían y la intención asignada a cada una. Ninguna pareja del grupo comparte `<title>` ni H1. Los enlaces cruzados existen. La lista de URL del sitemap es la misma antes y después del cambio. El verificador no da errores nuevos y el grupo de control sigue idéntico.

**Qué no haces.** En esta fase nunca se fusionan, redirigen ni borran URL. Tampoco se toca el grupo de control.

## Después de aplicar el método

Repite la batería de prompts a las 4–6 semanas del despliegue y compara las fuentes de [medición](medicion.md) entre las páginas modificadas y las de control. Publica solo lo medido, con su método y sus límites, aunque el resultado sea nulo.

Para auditar un sitio antes o después de cada fase, usa las checklists de [PCA](../checklists/auditoria-pca.md) y de [PSA](../checklists/auditoria-psa.md).
