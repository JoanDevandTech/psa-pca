# Medición

La medición es la parte del modelo PCA-PSA que permite saber si aplicarlo cambia algo: se fija una línea base antes de desplegar, se deja un grupo de páginas sin modificar como control y, después, se comparan cuatro fuentes (los registros del servidor, el tráfico que llega desde asistentes de IA, una batería fija de prompts y los datos de buscadores) entre las páginas modificadas y las de control. Como PCA-PSA es una propuesta metodológica y no un resultado demostrado, solo se publican datos medidos así, sea cual sea el resultado.

Las herramientas SEO habituales no bastan por sí solas: la analítica que funciona en el navegador no registra a los rastreadores que no ejecutan JavaScript, y el tráfico que llega desde un asistente hay que separarlo con un canal propio.

## Antes de desplegar: línea base

Anota el punto de partida antes de publicar el primer cambio del modelo (normalmente, el grafo de la [PSA](psa.md)):

- **Search Console:** clics, impresiones y posición media por página de los últimos tres meses, con las páginas del grupo de control separadas del resto.
- **Analítica web:** sesiones por fuente/medio y por página de entrada.
- **Registros del servidor:** las visitas de los rastreadores de IA del mismo periodo, si los registros se conservan.
- **Batería de prompts:** una primera pasada completa (ver más abajo).
- **Fechas:** la fecha de despliegue de cada fase, a medida que ocurran. Sin ellas no se puede atribuir ningún cambio.

## Grupo de control

Elige un grupo de páginas que ya tengan tráfico y no las modifiques: ni contenido (PCA) ni marcado (PSA) ni versión Markdown. Su evolución es la referencia con la que comparar la del resto del sitio; sin ella, un cambio de tendencia general (una actualización del buscador, la estacionalidad) se confundiría con el efecto del modelo.

Si comparten plantilla o scripts de build con el resto, el control se garantiza en el código: la plantilla sigue emitiendo para ellas el JSON-LD anterior y el generador de Markdown no les aplica los cambios. Tras cada despliegue, comprueba con un `diff` que su JSON-LD y su Markdown son idénticos a los de antes. Si cambian, el control se ha roto.

Lo que afecta a todo el dominio por igual (el `robots.txt`, el script de analítica) también se aplica al grupo de control, y debe ser así: el canal de IA tiene que medirse igual en los dos grupos.

## Auditoría de registros del servidor

Muchos rastreadores de IA no ejecutan JavaScript, así que ninguna analítica que funcione en el navegador los registra. La única forma de ver sus visitas es procesar los registros de acceso del servidor web.

- Filtra por user-agent: `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot` y los demás de la tabla de [capas complementarias](capas-complementarias.md#rastreadores-de-ia-en-robotstxt).
- Cuenta visitas por URL y por semana, separando las páginas modificadas de las de control.
- Fíjate también en qué piden: si son las versiones Markdown, `llms.txt` o solo el HTML.

## Tráfico referido desde asistentes

Cuando alguien hace clic en un enlace dentro de la respuesta de un asistente, la visita puede llegar con el host del asistente como referente. Para medirlo, la analítica necesita un canal propio para la IA. Hosts que conviene reconocer:

- `chatgpt.com` y `chat.openai.com`
- `perplexity.ai`
- `claude.ai`
- `gemini.google.com`
- `copilot.microsoft.com`

**El orden importa.** Si tu clasificador de referentes recorre una lista de reglas y se queda con la primera que coincide, las reglas de los asistentes tienen que ir antes que las de los buscadores. Si no, una regla genérica de Google se queda con `gemini.google.com` y una de Bing con `copilot.microsoft.com`, y ese tráfico se cuenta como orgánico. Compruébalo leyendo cómo recorre la lista tu código.

Documenta qué parámetros llegan a la capa de datos en una visita desde un asistente, para poder crear la dimensión correspondiente en la herramienta de analítica.

## Batería fija de prompts

- Redacta una lista fija de consultas sobre los servicios y temas del sitio, como las haría un usuario real. No la cambies entre mediciones.
- Lánzala en los principales asistentes (por ejemplo ChatGPT, Perplexity, Claude y Gemini) en sesiones sin historial ni memoria.
- Repite cada consulta varias veces: las respuestas no son deterministas y una sola pasada no dice nada.
- Anota, por consulta y por asistente, si la respuesta cita el dominio y qué URL.
- Repite la batería completa a las 4–6 semanas del despliegue, con el mismo procedimiento.

## Cómo se publican los resultados

- Solo datos medidos, cada uno con su periodo, su fuente y la comparación con el grupo de control.
- Con el método y sus límites: qué no se pudo medir, qué cambió además del modelo en ese periodo.
- Un resultado nulo o negativo también se publica.
- Ninguna página del sitio afirma resultados que no estén medidos y publicados así.

Consulta el [método](metodo.md) para ver en qué momento de la aplicación encaja cada paso.
