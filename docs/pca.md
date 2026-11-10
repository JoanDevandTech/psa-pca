# PCA: Programación Cognitiva Artificial

La Programación Cognitiva Artificial (PCA) es la capa de contenido del modelo PCA-PSA: decide qué dice el texto visible de cada página y cómo se estructura para que un motor generativo pueda recuperar un fragmento, entenderlo sin el resto de la página y usarlo para responder a la consulta tal como la formula quien pregunta. Se apoya en tres pilares: espejeo semántico, anclaje de entidades y reencuadre de intención. La capa técnica, el código que describe esas mismas entidades como datos enlazados, es la [PSA](psa.md).

El modelo se presentó en el artículo [«Programación Neurolingüística en la época de la IA: el modelo PCA-PSA para GEO»](https://kromagency.es/blog/modelo-pca-psa-geo/). Allí se explica por qué toma prestada la idea de la PNL solo como analogía, no como disciplina validada.

## Por qué hace falta una capa de contenido

Un buscador clásico devuelve una lista de enlaces. Un motor generativo, en cambio, suele recuperar fragmentos de varias páginas (normalmente con una arquitectura RAG, *Retrieval-Augmented Generation*) y redacta una respuesta con ellos. Lo que entra en esa respuesta no es la página entera, sino el trozo que el sistema de recuperación consideró relevante para la consulta. La PCA trabaja sobre esa unidad: el fragmento.

Los tres pilares que siguen se aplican al contenido visible. Nunca dependen del JSON-LD: muchos sistemas descartan los `<script>` y solo leen el texto, así que lo que la página no dice en su texto no cuenta para ellos.

## Espejeo semántico

**Qué es.** El texto visible refleja la forma y la intención de las preguntas reales de los usuarios. El encabezado es la pregunta que haría alguien; las primeras frases debajo la responden directamente; y el fragmento se entiende sin haber leído lo anterior. El artículo lo llama también *rapport estructural*.

**Por qué.** El sistema de recuperación compara la consulta con fragmentos. Un fragmento que repite la intención de la consulta y responde al principio es más fácil de seleccionar y de citar que uno que empieza por un eslogan o que solo se entiende con el párrafo anterior.

**Cómo se aplica.** Siete reglas, iguales para todas las páginas:

1. **El H1 nombra la cosa.** Dice qué servicio o qué página es, con el término que usaría quien lo busca. Si había un eslogan, no se pierde: pasa a la línea pequeña sobre el H1 o al subtítulo.
2. **Cada H2 es una pregunta real o una afirmación autocontenida,** y nombra la entidad cuando la pregunta lo necesita.
3. **La primera frase bajo cada encabezado responde** en una o dos oraciones, sin depender del párrafo anterior. El desarrollo va después.
4. **Las preguntas de las FAQ se entienden solas:** llevan sujeto y nombran el servicio o la entidad de la que hablan.
5. **No se cambia el significado ni se añaden datos.** Solo se reordena y se reformula lo que la página ya afirma. Si para responder en la primera frase falta un dato, se pregunta a quien lo sabe; no se inventa.
6. **Se mantienen las versiones de idioma alineadas y la voz de la marca.** Si la página tiene traducciones, cambian a la vez.
7. **Al cambiar el H1 de un servicio, se actualiza el `name` de su nodo `Service`** en la [PSA](psa.md), para que el marcado y el texto sigan diciendo lo mismo.

Conviene revisar cada cambio en una tabla antes/después de encabezados y primeras frases, y comprobar en la versión Markdown de la página (ver [capas complementarias](capas-complementarias.md)) que cada sección se entiende leída sola.

**Ejemplo publicado en el artículo.**

- Antes (manual técnico): «El endpoint `/v1/auth` requiere un token JWT en las cabeceras. La tasa de refresco es de 15 minutos».
- Después (espejeo de intención): «¿Cómo mantener segura la sesión de usuario? Para gestionar la autenticación sin interrupciones, envía un token JWT en la cabecera `Authorization` de tus peticiones a `/v1/auth`. El token se refresca cada 15 minutos».

La precisión técnica es la misma; cambia el orden: primero la pregunta, después la respuesta.

**Ejemplo con una empresa ficticia** (Estudio Ejemplo no existe):

| | Antes | Después |
| :-- | :-- | :-- |
| H1 | «Conectamos lo que otros separan» | «Integración de APIs para empresas» (el eslogan pasa al subtítulo) |
| H2 | «Qué incluye el servicio» | «¿Qué incluye la integración de APIs de Estudio Ejemplo?» |
| Pregunta de FAQ | «¿Cuánto tarda?» | «¿Cuánto tarda una integración de APIs?» |
| Primera frase | «Llevamos tiempo viendo sistemas que no se hablan entre sí…» | «La integración de APIs de Estudio Ejemplo conecta tus aplicaciones para que intercambien datos sin pasos manuales.» |

## Anclaje de entidades

**Qué es.** La marca, las personas y cada servicio tienen un nombre canónico, siempre el mismo, rodeado de los términos técnicos de su sector. Y los datos que se repiten entre páginas (años, cifras, plazos) son idénticos en todas. El artículo lo llama también *entity anchoring*.

**Por qué.** Publicar contenido no cambia los pesos de un modelo: eso solo ocurre durante su entrenamiento. Lo que el anclaje busca es mejorar la recuperación: que un motor de búsqueda semántica asocie de forma estable la marca con los conceptos de su sector. Un sistema que cruza varias páginas y encuentra tres nombres distintos para la misma empresa, o tres cifras distintas para el mismo dato, tiene más difícil consolidar la entidad.

**Cómo se aplica.**

1. **Una sola fuente para los datos canónicos.** El nombre de la empresa, el de cada persona con su cargo y las cifras que se repiten viven en un único sitio del código (un archivo de configuración, por ejemplo), y tanto el texto como el JSON-LD los leen de ahí. Si cambian, cambian a la vez en la página y en el marcado.
2. **El nombre del marcado es el visible.** Una persona se llama en el JSON-LD exactamente como aparece escrita en la página.
3. **Nombre completo primero, forma corta después.** La primera vez que se nombra a la empresa en el cuerpo de cada página, y en el `<title>`, se usa el nombre completo; la forma corta puede ir después. Los `<title>` siguen un único patrón en todo el sitio.
4. **Fuera los nombres antiguos en el contenido propio.** Si la marca cambió de nombre, el nombre anterior se sustituye en los textos propios. Las citas literales de terceros, como las reseñas, no se tocan.
5. **Autoría verificable.** Un artículo se atribuye a una persona solo si consta que lo firma; si no, se atribuye a la organización.
6. **Cada cifra, una vez.** Cuando dos páginas dan versiones distintas del mismo dato, se decide cuál es la correcta con quien lo sabe, se lleva a la fuente única y todas las páginas la leen de ahí. Mientras no haya respuesta, no se toca.
7. **Los datos de contacto, en el cuerpo de la página de contacto,** no solo en el pie, que suele desaparecer en las versiones Markdown.
8. **Una frase de identidad para cada persona** que se entienda sola, construida solo con datos que ya estén publicados.

**Ejemplo con una empresa ficticia:**

| | Antes | Después |
| :-- | :-- | :-- |
| Nombre de la empresa | «Ejemplo», «Estudio Ejemplo» y «Ejemplo Studio» en páginas distintas | «Estudio Ejemplo» la primera vez en cada página; «Ejemplo» después |
| Dato repetido | Una página dice «más de 100 proyectos» y otra «más de 120» | Una sola cifra, confirmada y leída de la misma fuente en ambas páginas |
| Autor de un artículo | El usuario del gestor de contenidos («admin») | «Estudio Ejemplo», salvo que conste quién lo firma |

## Reencuadre de intención

**Qué es.** Una misma base de conocimiento puede tener varias páginas si cada una responde a una intención distinta: por ejemplo, una con enfoque técnico para quien desarrolla, otra con enfoque de negocio para quien decide y otra con enfoque local. El artículo lo llama también *reframing contextual*.

**Por qué.** Amplía la cobertura semántica sin duplicar contenido. El riesgo es la canibalización: dos páginas que compiten por la misma consulta se debilitan entre sí. Por eso cada página tiene que apuntar a una intención y a unas consultas distintas.

**Cómo se aplica.**

1. **Primero se detectan las páginas que compiten:** las que tienen `<title>`, H1 o descripción casi iguales, o que responden a la misma consulta.
2. **Se asigna una intención a cada una** y se diferencian `<title>`, H1 y descripción para que apunten a ella (por ejemplo, la portada habla de la empresa y la página de servicio, del servicio).
3. **Se enlazan las páginas hermanas entre sí** con un texto que diga la diferencia, para que quien llega a la equivocada encuentre la otra.
4. **En este paso solo se diferencia por contenido.** Fusionar, redirigir o borrar páginas es una decisión de más riesgo para el posicionamiento: se propone por separado, razonada, y si se aprueba se hace en otro cambio con su redirección 301.

**Ejemplo con una empresa ficticia:**

| | Antes | Después |
| :-- | :-- | :-- |
| Portada | «Estudio Ejemplo — Integración de APIs para empresas» | «Estudio Ejemplo — estudio de ingeniería de software»: la empresa, quién es y qué hace |
| Página de servicio | «Integración de APIs — Ejemplo» | «Integración de APIs para empresas — Estudio Ejemplo»: el servicio, con enfoque técnico |
| Enlace cruzado | No existe | En la portada: «¿Necesitas conectar tus aplicaciones? Mira cómo trabajamos la integración de APIs» |

## Qué no promete

- PCA-PSA es una propuesta metodológica, no un resultado demostrado. No garantiza que un motor generativo cite una página.
- Publicar o reescribir contenido no modifica lo que un modelo ya aprendió; como mucho, cambia lo que se recupera.
- Las reglas ordenan y aclaran lo que la página ya dice. No sustituyen al contenido: si la página no tiene la respuesta, el espejeo no la crea.
- El efecto se mide después, con método y grupo de control (ver [medición](medicion.md)). Ninguna página debe afirmar resultados que no se hayan medido.

Para aplicarlo paso a paso, consulta el [método](metodo.md) y la [checklist de auditoría de la PCA](../checklists/auditoria-pca.md).
