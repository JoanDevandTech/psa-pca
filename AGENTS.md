# Instrucciones para agentes

Este archivo dice a un agente de código cómo aplicar el modelo PCA-PSA, paso a paso, en el repositorio de un sitio web. La teoría está en [`docs/pca.md`](docs/pca.md), [`docs/psa.md`](docs/psa.md) y [`docs/metodo.md`](docs/metodo.md); aquí solo está lo operativo. Si algo de lo que encuentras en el sitio no coincide con lo que describen estas instrucciones, para y pregunta.

## Lee primero, en este orden

1. [`README.md`](README.md): qué es el modelo y qué no promete.
2. [`docs/metodo.md`](docs/metodo.md): las fases, su orden y sus criterios de aceptación. Es tu guía de trabajo.
3. [`docs/pca.md`](docs/pca.md) y [`docs/psa.md`](docs/psa.md): las reglas de cada capa.
4. [`docs/capas-complementarias.md`](docs/capas-complementarias.md) y [`docs/medicion.md`](docs/medicion.md).
5. [`implementaciones/README.md`](implementaciones/README.md): elige la implementación de referencia que se parezca al stack del sitio. Sus datos son ficticios; no copies ningún nombre ni URL de ejemplo al sitio.
6. Las reglas propias del repositorio del sitio (su README, guías de contribución, de despliegue o de marca). Si contradicen estas instrucciones, pregunta cuál manda.

## Antes de empezar: pide los datos canónicos

No escribas nada hasta tener estas respuestas de la persona responsable del sitio. Pídelas todas juntas:

- El nombre canónico de la marca y su forma corta, si la hay.
- Cada persona que aparece en el sitio: nombre tal como debe leerse, cargo y perfiles públicos.
- El nombre canónico de cada servicio y la URL de su página.
- Cada cifra que se repite entre páginas (años, número de proyectos, plazos) y su valor correcto.
- Quién firma cada artículo cuya autoría no esté clara.
- Los datos de contacto que deben verse en la página de contacto.
- Qué páginas forman el grupo de control.
- Si la línea base de medición ya está tomada y quién la toma.

Si encuentras en el sitio dos versiones de un mismo dato, enséñale las dos y pregunta cuál es la correcta.

**Regla de parada.** Si un paso necesita un dato que no está en el repositorio ni en las respuestas recibidas, no lo inventes ni lo deduzcas: para ese paso, pregunta y sigue con lo que no dependa de él. Esto vale para nombres, cifras, fechas, cargos, autorías, URL y user-agents.

## Fases

Trabaja una fase cada vez, en el orden de [`docs/metodo.md`](docs/metodo.md), cada una en un cambio independiente y revisable (por ejemplo, una rama y una solicitud de fusión por fase). No mezcles fases. Una fase está hecha cuando cumple todos sus criterios y el grupo de control sigue idéntico.

Para comprobar el grupo de control, antes del primer cambio guarda una copia del HTML y del Markdown generados de sus páginas; al cerrar cada fase, compara su JSON-LD y su Markdown con esa copia. Cualquier diferencia significa que la fase no está hecha.

El verificador se usa así, sobre el HTML generado o sobre la URL servida:

```sh
node scripts/verificar-psa.mjs <url | archivo.html> [--ua <user-agent>] [--json]
```

Sale con código 1 si hay errores. Revisa cada aviso; si dice que un `name` no está en el texto visible, corrige el dato, no el aviso.

### Fase 0: datos canónicos

Crea la fuente única con las respuestas recibidas y haz que plantillas y marcado lean de ella. Normaliza la autoría de los artículos.

**Hecho cuando:** buscar las formas antiguas de los nombres solo devuelve la fuente única y citas literales de terceros, y el build pasa. No despliegues cambios visibles hasta que la línea base esté tomada.

### Fase 1: medición y línea base

Confirma que la línea base está guardada. Protege en el código las páginas de control. Añade el canal de asistentes de IA a la analítica, con sus reglas antes que las de los buscadores, y documenta los parámetros que llegan a la capa de datos. La batería de prompts y las exportaciones las hace una persona: no las simules.

**Hecho cuando:** leyendo el código de la analítica, la primera regla que coincide con `gemini.google.com` y `copilot.microsoft.com` es la de asistentes, y la copia de referencia del grupo de control está guardada.

### Fase 2: grafo de la PSA

Monta un solo `@graph` por página según el [grafo objetivo](docs/psa.md#grafo-objetivo-por-tipo-de-página), con los `@id` construidos desde un único módulo.

**Hecho cuando:** el verificador da 0 errores en una o dos páginas de cada tipo, cada página fuera del control tiene exactamente un bloque JSON-LD (`grep -o 'application/ld+json' archivo.html | wc -l` da 1), el build pasa y el control sigue idéntico. Recuerda a la persona responsable la validación posterior al despliegue que describe el método.

### Fase 3: anclaje de entidades

Unifica nombres, cifras, autoría y datos de contacto según las reglas del [anclaje de entidades](docs/pca.md#anclaje-de-entidades).

**Hecho cuando:** cada cifra repetida vive solo en la fuente única, las formas antiguas del nombre solo quedan en citas de terceros, el verificador no da errores nuevos y el control sigue idéntico.

### Fase 4: capas complementarias

Aplica la 404, la versión Markdown, `llms.txt` y el bloque de `robots.txt` según [capas complementarias](docs/capas-complementarias.md), sin rehacer lo que ya exista. Confirma cada user-agent en la documentación oficial de su proveedor antes de escribirlo; si no puedes, déjalo fuera y dilo.

**Hecho cuando:** la 404 generada no contiene `rel="canonical"`, cada página indexable tiene su Markdown con la firma de contacto, `llms.txt` no lista páginas con `noindex` y el Markdown del control sigue idéntico.

### Fase 5: espejeo semántico, por lotes

Un lote de páginas por cambio. Aplica las siete reglas del [espejeo semántico](docs/pca.md#espejeo-semántico).

**Hecho cuando:** la tabla antes/después del lote está entregada para revisión, cada sección de la versión Markdown se entiende sola, el verificador no da errores ni avisos nuevos de `name` no visible y el control sigue idéntico.

### Fase 6: reencuadre de intención

Diferencia `<title>`, H1 y descripción de las páginas que compiten y enlázalas entre sí según el [reencuadre de intención](docs/pca.md#reencuadre-de-intención).

**Hecho cuando:** hay una tabla de páginas que competían con la intención de cada una, ninguna pareja comparte `<title>` ni H1, la lista de URL del sitemap es la misma que antes y el control sigue idéntico.

## Límites

- No cambies el significado de ningún texto. Reordena y reformula lo que la página ya dice.
- No añadas datos, cifras, fechas, cargos, testimonios ni afirmaciones de resultados.
- No toques las páginas del grupo de control: ni contenido, ni marcado, ni Markdown.
- No fusiones, redirijas ni borres URL. Si crees que hace falta, escríbelo como propuesta razonada para que la persona responsable decida.
- No pongas en el marcado nada que la página no muestre.
- No modifiques citas literales de terceros, como las reseñas.
- No prometas, ni en el sitio ni en tus informes, que el modelo mejora citas, tráfico o posiciones. Es una propuesta metodológica, no un resultado demostrado.

## Cómo informar al terminar cada fase

Entrega un informe corto con:

1. La fase y qué ha cambiado, agrupado por área.
2. La salida del verificador en las páginas comprobadas (errores y avisos, con lo que has hecho con cada aviso).
3. El resultado de la comparación del grupo de control.
4. En la fase 5, la tabla antes/después de encabezados y primeras frases; en la fase 6, la tabla de páginas e intenciones y, si la hay, la propuesta de fusión aparte.
5. Las preguntas abiertas y los pasos que han quedado parados por falta de un dato.
6. Lo que debe hacer una persona después de desplegar (validación, fecha de despliegue, medición).
