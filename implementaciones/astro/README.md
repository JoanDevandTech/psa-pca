# Implementación de referencia en Astro

Sitio estático mínimo que aplica la PSA del modelo PCA-PSA: cada página sale del build con un único `<script type="application/ld+json">` cuyo `@graph` enlaza por `@id` la empresa, el sitio, la página y los nodos propios de esa página. Es la implementación canónica: las de React y Laravel generan las mismas tres páginas con el mismo grafo.

La empresa del ejemplo, «Estudio Ejemplo», es ficticia, y `ejemplo.example` es un dominio reservado que no existe. El modelo se explica en [docs/psa.md](../../docs/psa.md) y en el [artículo original](https://kromagency.es/blog/modelo-pca-psa-geo/).

## Estructura

```
astro.config.mjs            site y barra final en las rutas
src/sitio.config.ts         datos canónicos de la empresa y la fundadora
src/lib/schema.ts           funciones puras que crean los nodos de schema.org
src/layouts/Layout.astro    canónica, <title>, description y el bloque JSON-LD
src/pages/index.astro                      portada        -> WebPage, mainEntity #organization
src/pages/servicios/integracion-de-apis.astro  servicio   -> Service, BreadcrumbList, FAQPage
src/pages/blog/que-es-un-webhook.astro     artículo       -> BlogPosting, BreadcrumbList, Person
```

## Cómo ejecutarlo

```sh
npm install
npm run build       # genera dist/
npm run verificar   # pasa las tres páginas de dist/ por ../../scripts/verificar-psa.mjs
```

`verificar` termina con error si alguna página tiene errores. El resultado esperado es 0 errores y 0 avisos en las tres. Los avisos, como un `name` que no se lee en la página, no cambian el código de salida: revisa lo que imprime el verificador, no solo si el comando termina bien.

Probado con Node 24.13.0, npm 11.6.2 y Astro 7.4.8.

## Cómo adaptarlo a un sitio real

1. **Cambia `src/sitio.config.ts`.** Nombre canónico de la empresa, `url` sin barra final, tipo de schema.org (`Organization` o un subtipo más preciso, como `ProfessionalService`), idioma, correo, teléfono si lo publicas, logo, dirección, área servida, perfiles externos y los datos de la persona fundadora. Pon en `site` de `astro.config.mjs` el mismo valor que en `url`.
2. **Escribe en la página lo que publiques en la configuración.** El layout ya pinta el nombre, el área servida y el correo en el pie; si añades teléfono o dirección completa, píntalos también.
3. **Usa `conFundador` solo donde la persona aparece por su nombre** en el texto visible. Esa prop añade el nodo `Person` y el enlace `founder`.

### Añadir un tipo de página

1. Si schema.org tiene un tipo para la entidad de la que trata la página, añade su función en `src/lib/schema.ts` siguiendo el patrón de `servicio` o `articulo`: `@id` sacado de `ids`, enlaces con `ref()` y `mainEntityOfPage` hacia `#page`.
2. En la plantilla, calcula `url` igual que el layout (`new URL(Astro.url.pathname, SITIO.url).href`), crea el nodo con los mismos textos que pintas y pásalo al layout en `nodos`, con su `@id` en `entidadPrincipal`.
3. Si la página tiene migas, pásalas en `migas`: el layout las pinta y crea el `BreadcrumbList`.
4. Ejecuta `npm run build` y `npm run verificar`.

## Qué regla cubre cada pieza

| Pieza | Regla |
| :-- | :-- |
| `sitio.config.ts` | Anclaje de entidades: un nombre y unos datos, escritos una sola vez |
| `ids` y `ref()` en `schema.ts` | Una entidad, un `@id`: los identificadores solo se generan ahí y los nodos se enlazan por referencia |
| `grafo()` | Una entidad, un `@id`: el build falla si dos nodos comparten `@id` |
| `serializar()` | En el HTML inicial: el JSON se incrusta sin que un `</script>` en un valor pueda cerrar el bloque |
| `Layout.astro` | En el HTML inicial: el bloque se genera en el build, no en el navegador. Lo visible manda: pinta el nombre de la empresa, las migas y el contacto que publica el grafo |
| Array `preguntas` del servicio | Lo visible manda: las mismas cadenas pintan las preguntas frecuentes y forman el nodo `FAQPage` |
| `name` del `Service` y `headline` del `BlogPosting` | Lo visible manda: son el texto del H1 |
| Textos de las páginas | Espejeo semántico: H1 que nombra la cosa, H2 en forma de pregunta y una primera frase que responde |

## Limitaciones

- El logo (`/logo.svg`) se publica en el grafo pero el ejemplo no incluye el archivo.
- La PSA no garantiza que un motor lea el JSON-LD ni que cite la página. Ver [docs/psa.md](../../docs/psa.md).
