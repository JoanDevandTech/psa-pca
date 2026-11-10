# PCA-PSA

Este es el repositorio del modelo PCA-PSA para GEO (*Generative Engine Optimization*): su documentación, checklists de auditoría, implementaciones de referencia y un verificador.

## Qué es el modelo

PCA-PSA es un modelo para preparar un sitio web para los motores generativos. Separa el trabajo en dos capas:

- **PCA: Programación Cognitiva Artificial.** El contenido visible: qué dice cada página y cómo se estructura para que un fragmento responda solo a la consulta de quien pregunta. Tiene tres pilares: espejeo semántico, anclaje de entidades y reencuadre de intención.
- **PSA: Programación Semántica Artificial.** El código: las entidades del sitio como datos enlazados en JSON-LD, con un `@id` estable para cada una. Tiene tres reglas: lo visible manda; una entidad, un `@id`; en el HTML inicial.

Aquí PCA no significa Principal Component Analysis, como suele en ingeniería de datos, sino Programación Cognitiva Artificial. El modelo se presentó en el artículo [«Programación Neurolingüística en la época de la IA: el modelo PCA-PSA para GEO»](https://kromagency.es/blog/modelo-pca-psa-geo/).

## Qué hay aquí

| Ruta | Contenido |
| :-- | :-- |
| [`docs/pca.md`](docs/pca.md) | Los tres pilares de la PCA, con sus reglas y ejemplos |
| [`docs/psa.md`](docs/psa.md) | Las tres reglas de la PSA, el grafo objetivo por tipo de página y las convenciones de `@id` |
| [`docs/capas-complementarias.md`](docs/capas-complementarias.md) | 404, versión Markdown, `llms.txt` y rastreadores de IA en `robots.txt` |
| [`docs/medicion.md`](docs/medicion.md) | Línea base, grupo de control, registros, tráfico desde asistentes y batería de prompts |
| [`docs/metodo.md`](docs/metodo.md) | El método por fases, su orden y sus criterios de aceptación |
| [`checklists/auditoria-pca.md`](checklists/auditoria-pca.md) | Checklist de auditoría del contenido visible |
| [`checklists/auditoria-psa.md`](checklists/auditoria-psa.md) | Checklist de auditoría del grafo, del HTML inicial, de las capas complementarias y de la medición |
| [`implementaciones/`](implementaciones/README.md) | Implementaciones de referencia, con datos de una empresa ficticia |
| [`implementaciones/astro/`](implementaciones/astro/) | Implementación de referencia para Astro |
| [`implementaciones/react/`](implementaciones/react/) | Implementación de referencia para React |
| [`implementaciones/laravel/`](implementaciones/laravel/) | Implementación de referencia para Laravel |
| [`scripts/verificar-psa.mjs`](scripts/verificar-psa.mjs) | Comprueba la PSA de una página tal y como la recibe un rastreador que no ejecuta JavaScript |
| [`AGENTS.md`](AGENTS.md) | Instrucciones para que un agente de código (una IA) aplique el método paso a paso |
| [`LICENSE`](LICENSE) | Licencia MIT del código |

## Cómo empezar

1. Lee [`docs/pca.md`](docs/pca.md), [`docs/psa.md`](docs/psa.md) y [`docs/metodo.md`](docs/metodo.md).
2. Audita una página de cada tipo de tu sitio con las checklists de [PCA](checklists/auditoria-pca.md) y [PSA](checklists/auditoria-psa.md).
3. Elige en [`implementaciones/`](implementaciones/README.md) la que más se parezca a tu stack.
4. Comprueba cada página con el verificador. No tiene dependencias y necesita Node 18 o superior:

   ```sh
   node scripts/verificar-psa.mjs https://ejemplo.example/servicios/integracion-de-apis/
   node scripts/verificar-psa.mjs ./dist/index.html
   node scripts/verificar-psa.mjs <url> --ua "GPTBot/1.0" --json
   ```

   Sale con código 1 si encuentra errores y con 0 si solo hay avisos o todo está bien. `ejemplo.example` es un dominio reservado que no existe; sustitúyelo por tu URL.
5. Aplica el método fase a fase, en el orden de [`docs/metodo.md`](docs/metodo.md). Si lo aplica un agente de código, dale a leer [`AGENTS.md`](AGENTS.md).

## Qué no promete

- PCA-PSA es una propuesta metodológica, no un resultado demostrado. No garantiza que un motor generativo cite una página ni que aumente el tráfico.
- Publicar contenido no cambia lo que un modelo ya aprendió; como mucho, cambia lo que se recupera.
- No todos los rastreadores ni todos los sistemas RAG leen JSON-LD. Por eso el contenido visible nunca depende de él.
- La [guía de Google sobre IA generativa](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) dice que los datos estructurados, `llms.txt` y las versiones en Markdown no son requisitos para aparecer en sus funciones de IA.
- La analogía con la Programación Neurolingüística es solo eso, una analogía: el modelo no la valida como disciplina.

## Estado

El modelo está definido y se está aplicando en kromagency.es, con un grupo de páginas sin modificar como control. Los resultados se publicarán en el [artículo](https://kromagency.es/blog/modelo-pca-psa-geo/) como mediciones, con su método y sus límites.

## Autoría

Joan Sebastian Torres Velandia, Krom Agency.

## Licencia

El código ([`implementaciones/`](implementaciones/README.md) y [`scripts/`](scripts/verificar-psa.mjs)) se publica bajo [licencia MIT](LICENSE); la documentación (`docs/`, `checklists/`, `README.md` y `AGENTS.md`), bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es).
