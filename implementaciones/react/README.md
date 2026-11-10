# Implementación de referencia en React

Generador estático mínimo que aplica la PSA del modelo PCA-PSA con componentes de React: cada página se renderiza con `react-dom/server` durante el build y sale con un único `<script type="application/ld+json">` cuyo `@graph` enlaza por `@id` la empresa, el sitio, la página y los nodos propios de esa página. Genera las mismas tres páginas, con el mismo grafo y los mismos textos visibles, que la [implementación de Astro](../astro/), que es la canónica.

Lo que demuestra es la tercera regla de la PSA, **en el HTML inicial**: el JSON-LD lo escribe el servidor (aquí, el build), no el navegador.

La empresa del ejemplo, «Estudio Ejemplo», es ficticia, y `ejemplo.example` es un dominio reservado que no existe. El modelo se explica en [docs/psa.md](../../docs/psa.md) y en el [artículo original](https://kromagency.es/blog/modelo-pca-psa-geo/).

## Estructura

```
src/sitio.config.ts          datos canónicos de la empresa y la fundadora (copia exacta de Astro)
src/lib/schema.ts            funciones puras que crean los nodos de schema.org (copia exacta de Astro)
src/componentes/GrafoPSA.tsx el <script type="application/ld+json"> con serializar(grafo(...))
src/componentes/Documento.tsx  html, head (canónica, <title>, description, GrafoPSA) y body
src/paginas/Inicio.tsx       portada   -> WebPage, mainEntity #organization
src/paginas/Servicio.tsx     servicio  -> Service, BreadcrumbList, FAQPage
src/paginas/Articulo.tsx     artículo  -> BlogPosting, BreadcrumbList, Person
src/generar.tsx              renderiza las tres páginas y las escribe en dist/
```

`sitio.config.ts` y `schema.ts` son idénticos a los de Astro: el grafo no depende del framework, solo de los datos.

## Cómo ejecutarlo

```sh
npm install
npm run build       # genera dist/ con renderToStaticMarkup
npm run verificar   # pasa las tres páginas de dist/ por ../../scripts/verificar-psa.mjs
```

El resultado esperado es 0 errores y 0 avisos en las tres páginas. Los avisos, como un `name` que no se lee en la página, no cambian el código de salida: revisa lo que imprime el verificador, no solo si el comando termina bien.

Probado con Node 24.13.0, npm 11.6.2, React y React DOM 19.3.1 y tsx 4.23.15. `tsx` solo sirve para ejecutar los archivos `.tsx` sin un paso de compilación aparte; no comprueba tipos.

## Por qué una SPA que solo renderiza en cliente incumple la regla

En una SPA renderizada solo en el navegador, el HTML que entrega el servidor es casi un contenedor vacío y un script; el contenido y el JSON-LD aparecen después, cuando el navegador ejecuta ese script. Muchos rastreadores de IA no ejecutan JavaScript, así que para ellos ese grafo no existe, aunque Googlebot sí lo vea porque renderiza. Da igual lo bien construido que esté el grafo: si no está en el HTML inicial, no cumple la PSA.

El artículo pide entregar el bloque mediante renderizado en servidor o generación estática, y nombra como opciones Laravel con Blade o Inertia SSR, Next.js y Nuxt. Este ejemplo usa la segunda vía, generación estática, con la función `renderToStaticMarkup` de `react-dom/server`, que es lo único que se ha ejecutado aquí. Si tu proyecto ya usa un framework con render en servidor, lo que importa es lo mismo: que `GrafoPSA` se renderice en el servidor junto al resto de la página.

Para comprobarlo en un sitio publicado, pasa la URL al verificador. La de este ejemplo es la del sitio ficticio; cámbiala por la tuya:

```sh
node ../../scripts/verificar-psa.mjs https://ejemplo.example/servicios/integracion-de-apis/
```

El script descarga la página sin ejecutar JavaScript. Si el grafo solo se inyecta en el navegador, informa de que no hay ningún bloque JSON-LD en el HTML inicial.

## Cómo adaptarlo a un sitio real

1. **Cambia `src/sitio.config.ts`.** Nombre canónico de la empresa, `url` sin barra final, tipo de schema.org (`Organization` o un subtipo más preciso, como `ProfessionalService`), idioma, correo, teléfono si lo publicas, logo, dirección, área servida, perfiles externos y los datos de la persona fundadora. Si mantienes también la versión de Astro, cambia los dos archivos igual.
2. **Escribe en la página lo que publiques en la configuración.** `Documento` ya pinta el nombre, el área servida y el correo en el pie; si añades teléfono o dirección completa, píntalos también.
3. **Usa `conFundador` solo donde la persona aparece por su nombre** en el texto visible. Esa prop añade el nodo `Person` y el enlace `founder`.
4. **Sirve `dist/` como archivos estáticos**, o sustituye `generar.tsx` por el render en servidor de tu aplicación. Lo que no puede hacerse es montar `GrafoPSA` solo en el navegador.

### Añadir una página

1. Crea el componente en `src/paginas/` con su `ruta` (con barra final) y calcula `url` con `urlDe(ruta)`, igual que `Documento` calcula la canónica.
2. Si schema.org tiene un tipo para la entidad de la que trata la página, añade su función en `src/lib/schema.ts` siguiendo el patrón de `servicio` o `articulo`, crea el nodo con los mismos textos que pintas y pásalo a `Documento` en `nodos`, con su `@id` en `entidadPrincipal`.
3. Si la página tiene migas, pásalas en `migas`: `Documento` las pinta y crea el `BreadcrumbList`.
4. Añade la página a la lista de `generar.tsx` y ejecuta `npm run build` y `npm run verificar`.

## Qué regla cubre cada pieza

| Pieza | Regla |
| :-- | :-- |
| `sitio.config.ts` | Anclaje de entidades: un nombre y unos datos, escritos una sola vez |
| `ids` y `ref()` en `schema.ts` | Una entidad, un `@id`: los identificadores solo se generan ahí y los nodos se enlazan por referencia |
| `grafo()` | Una entidad, un `@id`: el build falla si dos nodos comparten `@id` |
| `GrafoPSA.tsx` y `generar.tsx` | En el HTML inicial: el bloque se escribe en el build con `react-dom/server`, no en el navegador |
| `serializar()` | En el HTML inicial: el JSON se incrusta sin que un `</script>` en un valor pueda cerrar el bloque |
| `Documento.tsx` | Lo visible manda: pinta el nombre de la empresa, las migas y el contacto que publica el grafo |
| Array `preguntas` del servicio | Lo visible manda: las mismas cadenas pintan las preguntas frecuentes y forman el nodo `FAQPage` |
| Textos de las páginas | Espejeo semántico: H1 que nombra la cosa, H2 en forma de pregunta y una primera frase que responde |

## Limitaciones

- El logo (`/logo.svg`) se publica en el grafo pero el ejemplo no incluye el archivo.
- `renderToStaticMarkup` escribe algunos atributos con la grafía de React (`charSet`, `dateTime`). En HTML los nombres de atributo no distinguen mayúsculas, así que el documento es equivalente.
- La PSA no garantiza que un motor lea el JSON-LD ni que cite la página. Ver [docs/psa.md](../../docs/psa.md).
