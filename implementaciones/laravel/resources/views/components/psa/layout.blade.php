{{--
    Layout mínimo para la PSA: canónica, <title>, meta description y UN solo
    bloque JSON-LD con el @graph de la página, renderizado en el servidor.

    También pinta lo que el grafo publica en todas las páginas (el nombre de la
    empresa, las migas y los datos de contacto), porque lo visible manda: el
    marcado no puede decir nada que el texto no diga.

    Props:
      titulo, descripcion   <title> y meta description; titulo es también el name de #page.
      tipo                  tipo de schema.org de la PÁGINA (WebPage, AboutPage, ContactPage, CollectionPage).
      nodos                 nodos propios de la página (servicio, artículo, FAQ…), creados con App\Support\Psa.
      entidad-principal     @id del nodo del que trata la página; se publica como mainEntity de #page.
      migas                 [['name' => …, 'url' => …], …] de la portada a la página actual.
      con-fundador          la página nombra a la persona fundadora en el texto visible: añade Person y founder.
--}}
@use('App\Support\Psa')
@props([
    'titulo',
    'descripcion',
    'tipo' => 'WebPage',
    'nodos' => [],
    'entidadPrincipal' => null,
    'migas' => [],
    'conFundador' => false,
])
@php
    $psa = config('psa');
    $canonical = Psa::canonica(request()->path());
    $json = Psa::serializar(Psa::grafo(
        Psa::organizacion($conFundador),
        Psa::sitio(),
        $conFundador ? Psa::fundador() : null,
        Psa::pagina(
            url: $canonical,
            nombre: $titulo,
            descripcion: $descripcion,
            tipo: $tipo,
            entidadPrincipal: $entidadPrincipal,
            tieneMigas: count($migas) > 0,
        ),
        count($migas) > 0 ? Psa::migas($canonical, $migas) : null,
        ...$nodos,
    ));
@endphp
<!doctype html>
<html lang="{{ $psa['idioma'] }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $titulo }}</title>
    <meta name="description" content="{{ $descripcion }}">
    <link rel="canonical" href="{{ $canonical }}">
    <script type="application/ld+json">{!! $json !!}</script>
</head>
<body>
    <header>
        <a href="/">{{ $psa['nombre'] }}</a>
    </header>
    @if (count($migas) > 0)
        <nav aria-label="Migas de pan">
            <ol>
                @foreach ($migas as $m)
                    <li><a href="{{ $m['url'] }}">{{ $m['name'] }}</a></li>
                @endforeach
            </ol>
        </nav>
    @endif
    <main>
        {{ $slot }}
    </main>
    <footer>
        <p>
            {{ $psa['nombre'] }} · {{ implode(', ', array_column($psa['area_servida'], 'nombre')) }}
            @if (! empty($psa['correo']))
                · <a href="mailto:{{ $psa['correo'] }}">{{ $psa['correo'] }}</a>
            @endif
        </p>
        <p>Empresa y sitio ficticios: demostración del modelo PCA-PSA.</p>
    </footer>
</body>
</html>
