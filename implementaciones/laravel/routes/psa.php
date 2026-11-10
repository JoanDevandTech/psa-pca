<?php

use Illuminate\Support\Facades\Route;

// Las tres páginas del sitio de ejemplo. Laravel las sirve sin barra final,
// así que esas son sus URL canónicas (la raíz es la única con barra).
Route::view('/', 'psa.inicio');
Route::view('/servicios/integracion-de-apis', 'psa.servicio');
Route::view('/blog/que-es-un-webhook', 'psa.articulo');
