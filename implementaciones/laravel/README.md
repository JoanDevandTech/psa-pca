# Implementación de referencia en Laravel

Archivos para copiar dentro de una aplicación Laravel que ya tengas. Con Blade, el servidor entrega cada página con un único `<script type="application/ld+json">` en el HTML inicial, cuyo `@graph` enlaza por `@id` la empresa, el sitio, la página y los nodos propios de esa página. Genera las mismas tres páginas, con el mismo grafo y los mismos textos, que la [implementación canónica en Astro](../astro/).

La empresa del ejemplo, «Estudio Ejemplo», es ficticia, y `ejemplo.example` es un dominio reservado que no existe. El modelo se explica en [docs/psa.md](../../docs/psa.md) y en el [artículo original](https://kromagency.es/blog/modelo-pca-psa-geo/).

## Dónde va cada archivo

Copia cada archivo a la misma ruta dentro de tu aplicación:

```
config/psa.php                                   datos canónicos de la empresa y la fundadora
app/Support/Psa.php                              métodos estáticos que crean los nodos de schema.org
resources/views/components/psa/layout.blade.php  canónica, <title>, description y el bloque JSON-LD
resources/views/psa/inicio.blade.php             portada   -> WebPage, mainEntity #organization
resources/views/psa/servicio.blade.php           servicio  -> Service, BreadcrumbList, FAQPage
resources/views/psa/articulo.blade.php           artículo  -> BlogPosting, BreadcrumbList, Person
routes/psa.php                                   las tres rutas
```

Después añade esta línea al final de `routes/web.php`:

```php
require __DIR__.'/psa.php';
```

Si `web.php` ya define `/`, la ruta de `psa.php` la sustituye por ir después; quita una de las dos.

## Cómo probarlo

Con `php artisan serve`, pasa cada página por el verificador desde la raíz de este repositorio:

```sh
node scripts/verificar-psa.mjs http://127.0.0.1:8000/
node scripts/verificar-psa.mjs http://127.0.0.1:8000/servicios/integracion-de-apis
node scripts/verificar-psa.mjs http://127.0.0.1:8000/blog/que-es-un-webhook
```

El resultado esperado es 0 errores y 0 avisos en las tres. Los avisos, como un `name` que no se lee en la página, no cambian el código de salida: revisa lo que imprime el verificador, no solo si el comando termina bien. La canónica y los `@id` usan siempre `https://ejemplo.example`, aunque pidas la página a `127.0.0.1`.

Probado con PHP 8.4.18, Laravel 13.40.0 y Node 24.13.0: las tres páginas, renderizadas por el kernel HTTP de una aplicación recién creada, dan 0 errores y 0 avisos, y su grafo coincide con el de Astro una vez normalizada la barra final de las URL.

## Barra final en las URL

Laravel sirve las rutas sin barra final, así que aquí la canónica de cada página no la lleva (salvo la raíz) y los `@id` de servicio y artículo tampoco: `https://ejemplo.example/servicios/integracion-de-apis#service`. En Astro sí la llevan; lo que importa es que la canónica sea una sola y que los `@id` deriven de ella.

`Psa::canonica()` la calcula con `config('psa.url')` y la ruta de la petición, no con `APP_URL` ni con el host que llega, de modo que no cambia entre entornos.

## Cómo adaptarlo a un sitio real

1. **Cambia `config/psa.php`.** Nombre canónico de la empresa, `url` sin barra final, tipo de schema.org (`Organization` o un subtipo más preciso, como `ProfessionalService`), idioma, correo, teléfono si lo publicas, logo, dirección, área servida, perfiles externos y los datos de la persona fundadora.
2. **Escribe en la página lo que publiques en la configuración.** El layout ya pinta el nombre, el área servida y el correo en el pie; si añades teléfono o dirección completa, píntalos también.
3. **Usa `:con-fundador="true"` solo donde la persona aparece por su nombre** en el texto visible. Esa prop añade el nodo `Person` y el enlace `founder`.
4. Si `config:cache` forma parte de tu despliegue, vuelve a ejecutarlo tras cambiar `config/psa.php`.

### Añadir un tipo de página

1. Si schema.org tiene un tipo para la entidad de la que trata la página, añade su método en `app/Support/Psa.php` siguiendo el patrón de `servicio` o `articulo`: `@id` sacado de `ids()`, enlaces con `ref()` y `mainEntityOfPage` hacia `#page`.
2. En la vista, calcula `$url` igual que el layout (`Psa::canonica(request()->path())`), crea el nodo con los mismos textos que pintas y pásalo al layout en `:nodos`, con su `@id` en `:entidad-principal`.
3. Si la página tiene migas, pásalas en `:migas`: el layout las pinta y crea el `BreadcrumbList`.
4. Vuelve a pasar la página por el verificador.

Si los datos vienen de la base de datos, pásalos a la vista desde el controlador en lugar de escribirlos en `@php`; el grafo se monta igual.

## Qué regla cubre cada pieza

| Pieza | Regla |
| :-- | :-- |
| `config/psa.php` | Anclaje de entidades: un nombre y unos datos, escritos una sola vez |
| `ids()` y `ref()` en `Psa.php` | Una entidad, un `@id`: los identificadores solo se generan ahí y los nodos se enlazan por referencia |
| `grafo()` | Una entidad, un `@id`: lanza una excepción si dos nodos comparten `@id` |
| `serializar()` | En el HTML inicial: con `JSON_HEX_TAG`, un `</script>` dentro de un valor sale como `\u003C/script\u003E` y no cierra el bloque |
| `layout.blade.php` | En el HTML inicial: el bloque se genera en el servidor, no en el navegador. Lo visible manda: pinta el nombre de la empresa, las migas y el contacto que publica el grafo |
| Array `$preguntas` del servicio | Lo visible manda: las mismas cadenas pintan las preguntas frecuentes y forman el nodo `FAQPage` |
| `name` del `Service` y `headline` del `BlogPosting` | Lo visible manda: son el texto del H1 |
| Textos de las páginas | Espejeo semántico: H1 que nombra la cosa, H2 en forma de pregunta y una primera frase que responde |

El JSON se imprime con `{!! !!}` porque `{{ }}` lo escaparía como HTML y dejaría de ser JSON válido; la protección frente a `</script>` la da `serializar()`.

## Limitaciones

- El logo (`/logo.svg`) se publica en el grafo pero el ejemplo no incluye el archivo.
- La PSA no garantiza que un motor lea el JSON-LD ni que cite la página. Ver [docs/psa.md](../../docs/psa.md).
