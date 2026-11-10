<?php

namespace App\Support;

use DateTimeImmutable;
use DateTimeInterface;
use DateTimeZone;
use InvalidArgumentException;
use LogicException;

/**
 * Grafo PSA del sitio (modelo PCA-PSA).
 *
 * Métodos estáticos puros: reciben datos y devuelven nodos de schema.org como
 * arrays. El layout los une en UN solo bloque @graph por página. Reglas:
 *
 *  1. Todo name/headline que salga de aquí tiene que leerse en la página.
 *  2. Una entidad, un @id. Los nodos se enlazan por referencia, no se copian.
 *  3. Ningún @id se escribe a mano fuera de ids(): así una referencia nunca
 *     apunta a un identificador distinto del que define el nodo.
 *
 * Solo depende de config('psa').
 */
final class Psa
{
    private const FRAGMENTOS = [
        'pagina' => 'page',
        'servicio' => 'service',
        'articulo' => 'article',
        'migas' => 'breadcrumb',
        'faq' => 'faq',
    ];

    private static function datos(): array
    {
        return config('psa');
    }

    /** Raíz del sitio con barra final, igual que la canónica de la portada. */
    private static function raiz(): string
    {
        return self::datos()['url'].'/';
    }

    /**
     * URL canónica de una ruta, calculada con config('psa.url') y no con
     * APP_URL. La raíz lleva barra final; el resto, ninguna, como las sirve
     * Laravel. Uso: Psa::canonica(request()->path()).
     */
    public static function canonica(string $ruta): string
    {
        $ruta = trim($ruta, '/');

        return $ruta === '' ? self::raiz() : self::datos()['url'].'/'.$ruta;
    }

    /**
     * @id de una entidad. Las globales (organizacion, sitio, fundador) no
     * llevan URL; las de página (pagina, servicio, articulo, migas, faq) se
     * cuelgan de la URL canónica de la página.
     */
    public static function ids(string $entidad, ?string $url = null): string
    {
        return match (true) {
            $entidad === 'organizacion' => self::raiz().'#organization',
            $entidad === 'sitio' => self::raiz().'#website',
            $entidad === 'fundador' => self::raiz().'#'.self::datos()['fundador']['slug'],
            isset(self::FRAGMENTOS[$entidad]) && $url !== null => $url.'#'.self::FRAGMENTOS[$entidad],
            default => throw new InvalidArgumentException("PSA: entidad desconocida o sin URL: {$entidad}"),
        };
    }

    public static function ref(string $id): array
    {
        return ['@id' => $id];
    }

    /** Quita claves vacías: no se publica "sameAs": [] ni "image": null. */
    public static function limpiar(array $nodo): array
    {
        return array_filter($nodo, fn ($valor) => $valor !== null && $valor !== '' && $valor !== []);
    }

    /* ── Nodos globales ─────────────────────────────────────────────────── */

    /**
     * La empresa. El tipo (Organization, ProfessionalService…) sale de la
     * configuración.
     *
     * $conFundador añade founder SOLO en las páginas que nombran a la persona
     * en el texto visible; en esas mismas páginas el layout emite el nodo Person.
     */
    public static function organizacion(bool $conFundador = false): array
    {
        $s = self::datos();

        return self::limpiar([
            '@type' => $s['tipo'],
            '@id' => self::ids('organizacion'),
            'name' => $s['nombre'],
            'url' => self::raiz(),
            'email' => $s['correo'] ?? null,
            'telephone' => $s['telefono'] ?? null,
            'logo' => empty($s['logo']) ? null : self::raiz().ltrim($s['logo'], '/'),
            'address' => empty($s['direccion']) ? null : [
                '@type' => 'PostalAddress',
                'addressLocality' => $s['direccion']['localidad'],
                'addressRegion' => $s['direccion']['region'],
                'addressCountry' => $s['direccion']['pais'],
            ],
            'sameAs' => $s['perfiles'] ?? [],
            'founder' => $conFundador ? self::ref(self::ids('fundador')) : null,
        ]);
    }

    public static function sitio(): array
    {
        $s = self::datos();

        return [
            '@type' => 'WebSite',
            '@id' => self::ids('sitio'),
            'url' => self::raiz(),
            'name' => $s['nombre'],
            'inLanguage' => $s['idioma'],
            'publisher' => self::ref(self::ids('organizacion')),
        ];
    }

    /** La persona fundadora. Solo se emite donde su nombre está escrito en la página. */
    public static function fundador(): array
    {
        $f = self::datos()['fundador'];

        return self::limpiar([
            '@type' => 'Person',
            '@id' => self::ids('fundador'),
            'name' => $f['nombre'],
            'jobTitle' => $f['cargo'],
            'worksFor' => self::ref(self::ids('organizacion')),
            'sameAs' => $f['perfiles'] ?? [],
        ]);
    }

    /* ── Nodos de página ────────────────────────────────────────────────── */

    /**
     * @param  string|null  $entidadPrincipal  @id del nodo del que trata la página (servicio, artículo, empresa…).
     */
    public static function pagina(
        string $url,
        string $nombre,
        string $descripcion,
        string $tipo = 'WebPage',
        ?string $entidadPrincipal = null,
        bool $tieneMigas = false,
    ): array {
        return self::limpiar([
            '@type' => $tipo,
            '@id' => self::ids('pagina', $url),
            'url' => $url,
            'name' => $nombre,
            'description' => $descripcion,
            'inLanguage' => self::datos()['idioma'],
            'isPartOf' => self::ref(self::ids('sitio')),
            'breadcrumb' => $tieneMigas ? self::ref(self::ids('migas', $url)) : null,
            'mainEntity' => $entidadPrincipal ? self::ref($entidadPrincipal) : null,
        ]);
    }

    /** Un servicio es una entidad propia, distinta de la página que lo describe. */
    public static function servicio(string $url, string $nombre, string $descripcion): array
    {
        return self::limpiar([
            '@type' => 'Service',
            '@id' => self::ids('servicio', $url),
            'name' => $nombre,
            'description' => $descripcion,
            'serviceType' => $nombre,
            'url' => $url,
            'provider' => self::ref(self::ids('organizacion')),
            'areaServed' => array_map(
                fn (array $a) => ['@type' => $a['tipo'], 'name' => $a['nombre']],
                self::datos()['area_servida'] ?? [],
            ),
            'mainEntityOfPage' => self::ref(self::ids('pagina', $url)),
        ]);
    }

    /**
     * @param  string  $tipo  BlogPosting para el blog, Article para guías y documentación.
     * @param  string  $autor  @id del autor: ids('fundador') o ids('organizacion').
     * @param  string|null  $imagen  URL absoluta de la imagen de portada.
     */
    public static function articulo(
        string $url,
        string $tipo,
        string $titular,
        string $descripcion,
        string $autor,
        ?DateTimeInterface $publicado = null,
        ?DateTimeInterface $modificado = null,
        ?string $imagen = null,
        ?string $seccion = null,
    ): array {
        return self::limpiar([
            '@type' => $tipo,
            '@id' => self::ids('articulo', $url),
            'headline' => $titular,
            'description' => $descripcion,
            'datePublished' => self::iso($publicado),
            'dateModified' => self::iso($modificado ?? $publicado),
            'image' => $imagen,
            'articleSection' => $seccion,
            'inLanguage' => self::datos()['idioma'],
            'author' => self::ref($autor),
            'publisher' => self::ref(self::ids('organizacion')),
            'mainEntityOfPage' => self::ref(self::ids('pagina', $url)),
        ]);
    }

    /** @param  array<int, array{name: string, url: string}>  $elementos */
    public static function migas(string $url, array $elementos): array
    {
        return [
            '@type' => 'BreadcrumbList',
            '@id' => self::ids('migas', $url),
            'itemListElement' => array_map(fn (array $miga, int $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $miga['name'],
                'item' => $miga['url'],
            ], $elementos, array_keys($elementos)),
        ];
    }

    /**
     * Las preguntas y respuestas son las MISMAS cadenas que pinta la página.
     *
     * @param  array<int, array{q: string, a: string}>  $preguntas
     */
    public static function faq(string $url, array $preguntas): array
    {
        return [
            '@type' => 'FAQPage',
            '@id' => self::ids('faq', $url),
            'isPartOf' => self::ref(self::ids('pagina', $url)),
            'mainEntity' => array_map(fn (array $p) => [
                '@type' => 'Question',
                'name' => $p['q'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $p['a']],
            ], $preguntas),
        ];
    }

    /* ── Montaje ────────────────────────────────────────────────────────── */

    /** Un solo @graph. Lanza una excepción si dos nodos comparten @id. */
    public static function grafo(array|false|null ...$nodos): array
    {
        $lista = array_values(array_filter($nodos));
        $vistos = [];
        foreach ($lista as $nodo) {
            $id = $nodo['@id'] ?? null;
            if ($id === null) {
                continue;
            }
            if (isset($vistos[$id])) {
                throw new LogicException("PSA: @id duplicado en la página: {$id}");
            }
            $vistos[$id] = true;
        }

        return ['@context' => 'https://schema.org', '@graph' => $lista];
    }

    /**
     * JSON para incrustar en <script>. JSON_HEX_TAG escribe < y > como
     * \u003C y \u003E, así que un "</script>" dentro de un valor no cierra el
     * bloque. El JSON resultante es equivalente.
     */
    public static function serializar(array $grafo): string
    {
        return json_encode(
            $grafo,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_THROW_ON_ERROR,
        );
    }

    /** Fecha en ISO 8601 UTC con milisegundos, como Date.toISOString(). */
    private static function iso(?DateTimeInterface $fecha): ?string
    {
        if ($fecha === null) {
            return null;
        }

        return DateTimeImmutable::createFromInterface($fecha)
            ->setTimezone(new DateTimeZone('UTC'))
            ->format('Y-m-d\TH:i:s.v\Z');
    }
}
