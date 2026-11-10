<?php

/*
 * Datos canónicos del sitio, en un solo lugar.
 *
 * Todo lo que el grafo PSA publica sobre la empresa y su fundadora sale de
 * aquí, y el texto visible de las páginas lee los mismos valores. Así un
 * nombre o un dato no puede escribirse de dos formas distintas (anclaje de
 * entidades).
 *
 * «Estudio Ejemplo» es una empresa FICTICIA y ejemplo.example es un dominio
 * reservado (RFC 2606) que no existe. Sustitúyelos por los datos reales.
 */

return [
    // Nombre canónico de la empresa, idéntico al que se lee en la página.
    'nombre' => 'Estudio Ejemplo',
    // Origen del sitio sin barra final. Las canónicas se calculan con este
    // valor, no con APP_URL.
    'url' => 'https://ejemplo.example',
    // Tipo de schema.org de la empresa (Organization, ProfessionalService…).
    'tipo' => 'ProfessionalService',
    // Idioma del contenido (BCP 47).
    'idioma' => 'es-ES',
    'correo' => 'hola@ejemplo.example',
    'telefono' => null,
    // Ruta del logo dentro del sitio.
    'logo' => '/logo.svg',
    'direccion' => ['localidad' => 'Madrid', 'region' => 'Comunidad de Madrid', 'pais' => 'ES'],
    // tipo: City, State, Country o AdministrativeArea.
    'area_servida' => [
        ['tipo' => 'City', 'nombre' => 'Madrid'],
        ['tipo' => 'Country', 'nombre' => 'España'],
    ],
    // Perfiles externos de la empresa (sameAs).
    'perfiles' => ['https://perfiles.example/estudio-ejemplo'],
    'fundador' => [
        'nombre' => 'Ana Ejemplo',
        // Fragmento del @id de la persona: {url}/#{slug}.
        'slug' => 'ana-ejemplo',
        'cargo' => 'Fundadora',
        'perfiles' => ['https://perfiles.example/ana-ejemplo'],
    ],
];
