# Auditoría de la PCA

Checklist para auditar el contenido visible de una página según los tres pilares de la [PCA](../docs/pca.md). Cada punto se comprueba mirando la página publicada o su versión Markdown; no hace falta leer el código. Revisa una página por tipo (portada, servicio, artículo, contacto…) y anota lo que no se cumple antes de cambiar nada.

Las páginas del grupo de control no se auditan para corregirlas: se dejan como están (ver [medición](../docs/medicion.md#grupo-de-control)).

## General

- [ ] Toda la información importante está en el texto visible de la página, no solo en el JSON-LD.
- [ ] La página no afirma resultados que no se hayan medido y publicado con método.

## Espejeo semántico

- [ ] El H1 dice qué servicio o qué página es, con el término que usaría quien lo busca.
- [ ] Si había un eslogan, sigue visible en la línea sobre el H1 o en el subtítulo, no en el H1.
- [ ] Cada H2 es una pregunta real o una afirmación que se entiende sola.
- [ ] Los H2 que lo necesitan nombran la entidad (el servicio, la empresa).
- [ ] No hay H2 genéricos repetidos idénticos en varias páginas («Qué incluye el servicio»).
- [ ] La primera o las dos primeras frases bajo cada encabezado responden a ese encabezado.
- [ ] Esa primera respuesta se entiende sin haber leído el párrafo anterior.
- [ ] Cada pregunta de las FAQ lleva sujeto y nombra el servicio o la entidad («¿Cuánto tarda una integración de APIs?», no «¿Cuánto tarda?»).
- [ ] Si la página tiene versiones en otros idiomas, dicen lo mismo que la principal.
- [ ] El nombre del servicio en el H1 coincide con el que se usa en el `<title>`, en las migas y en las tarjetas que enlazan a la página.
- [ ] Leída en su versión Markdown, sin diseño ni navegación, cada sección se entiende sola.

Al corregir: solo se reordena y se reformula lo que la página ya dice. Si falta un dato para responder, se pregunta.

## Anclaje de entidades

- [ ] La empresa se llama siempre igual en todo el sitio; no conviven nombres antiguos o variantes en el contenido propio.
- [ ] La primera mención de la empresa en el cuerpo de la página usa el nombre completo; la forma corta, si la hay, va después.
- [ ] El `<title>` usa el nombre completo de la empresa y sigue el mismo patrón que el resto de páginas.
- [ ] Cada persona se llama igual en todas las páginas.
- [ ] Cada servicio se llama igual en todas las páginas.
- [ ] Las cifras que se repiten entre páginas (años, número de proyectos, plazos) tienen el mismo valor en todas.
- [ ] Cada artículo está firmado por una persona solo si consta que lo firma; si no, por la organización. Ningún artículo aparece firmado por un usuario técnico del gestor de contenidos.
- [ ] Los datos de contacto están en el cuerpo de la página de contacto, no solo en el pie.
- [ ] Cada persona tiene, junto a su nombre y cargo, una frase que dice quién es y se entiende sola.
- [ ] Las citas de terceros (reseñas, testimonios) se reproducen literalmente, aunque usen un nombre antiguo.
- [ ] No quedan restos que no son contenido (texto pegado por error de otra herramienta, marcadores de plantilla).

## Reencuadre de intención

- [ ] No hay dos páginas con `<title>`, H1 o descripción casi iguales.
- [ ] Cada página que trata un tema compartido con otra apunta a una intención distinta (por ejemplo, empresa frente a servicio, enfoque técnico frente a enfoque local).
- [ ] La portada habla de la empresa y cada página de servicio, de su servicio.
- [ ] Las páginas hermanas se enlazan entre sí con un texto que dice en qué se diferencian.
- [ ] Si dos páginas son el mismo contenido en dos URL, está anotado como propuesta aparte; no se ha fusionado, redirigido ni borrado nada sin esa decisión.

Para corregir lo que falle, sigue el orden del [método](../docs/metodo.md).
