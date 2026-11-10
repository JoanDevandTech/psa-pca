#!/usr/bin/env node
/**
 * verificar-psa.mjs — comprueba la PSA de una página tal y como la recibe un
 * rastreador que NO ejecuta JavaScript.
 *
 * Uso:
 *   node scripts/verificar-psa.mjs https://ejemplo.example/servicios/integracion-de-apis/
 *   node scripts/verificar-psa.mjs ./dist/index.html
 *   node scripts/verificar-psa.mjs <url> --ua "GPTBot/1.0" --json
 *
 * Qué comprueba:
 *   1. Que hay JSON-LD en el HTML inicial y que es JSON válido.
 *   2. Que cada referencia {"@id": "..."} apunta a un nodo definido en la página.
 *   3. Que no hay dos nodos con el mismo @id.
 *   4. Que el `name` / `headline` de cada nodo aparece en el texto visible.
 *   5. Que existe <link rel="canonical"> y que algún nodo lo usa como `url`.
 *
 * Sin dependencias. Requiere Node 18 o superior (fetch nativo).
 * Sale con código 1 si hay errores, 0 si solo hay avisos o todo está bien.
 */

import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const destino = args.find((a) => !a.startsWith("--") && a !== valorDe("--ua"));
const comoJson = args.includes("--json");
const userAgent = valorDe("--ua") ?? "verificar-psa/1.0 (sin JavaScript)";

function valorDe(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

if (!destino) {
  console.error("Uso: node scripts/verificar-psa.mjs <url | archivo.html> [--ua <user-agent>] [--json]");
  process.exit(2);
}

/** Descarga la URL sin ejecutar nada, o lee el archivo local. */
async function obtenerHtml(origen) {
  if (/^https?:\/\//i.test(origen)) {
    const res = await fetch(origen, {
      headers: { "user-agent": userAgent, accept: "text/html" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} al pedir ${origen}`);
    return await res.text();
  }
  return await readFile(origen, "utf8");
}

const ENTIDADES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodificar(texto) {
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n.toLowerCase()] ?? m);
}

/** Texto que vería un lector: sin scripts, estilos ni etiquetas. */
function textoVisible(html) {
  const sinBloques = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi, " ");
  return normalizar(decodificar(sinBloques.replace(/<[^>]+>/g, " ")));
}

function normalizar(t) {
  return String(t).normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
}

function bloquesJsonLd(html) {
  const re = /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(re)].map((m) => m[1].trim());
}

function canonicalDe(html) {
  const etiqueta = html.match(/<link\b[^>]*rel\s*=\s*["']?canonical["']?[^>]*>/i)?.[0];
  return etiqueta?.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
}

const esObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Una referencia es un objeto cuya única clave es @id. */
const esReferencia = (v) => esObjeto(v) && Object.keys(v).length === 1 && typeof v["@id"] === "string";

/** Recorre el JSON y separa nodos (con @type) de referencias puras. */
function recorrer(valor, nodos, referencias) {
  if (Array.isArray(valor)) {
    for (const v of valor) recorrer(v, nodos, referencias);
    return;
  }
  if (!esObjeto(valor)) return;
  if (esReferencia(valor)) {
    referencias.push(valor["@id"]);
    return;
  }
  if (valor["@type"]) nodos.push(valor);
  for (const [clave, hijo] of Object.entries(valor)) {
    if (clave === "@context") continue;
    recorrer(hijo, nodos, referencias);
  }
}

const errores = [];
const avisos = [];

let html;
try {
  html = await obtenerHtml(destino);
} catch (e) {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
}

const bloques = bloquesJsonLd(html);
const nodos = [];
const referencias = [];

if (bloques.length === 0) {
  errores.push(
    "No hay ningún <script type=\"application/ld+json\"> en el HTML inicial. " +
      "Si la página lo muestra en el navegador, se está inyectando en cliente.",
  );
}

bloques.forEach((crudo, i) => {
  try {
    recorrer(JSON.parse(crudo), nodos, referencias);
  } catch (e) {
    errores.push(`Bloque JSON-LD nº ${i + 1}: JSON no válido (${e.message}).`);
  }
});

// @id duplicados y referencias sin resolver
const definidos = new Map();
for (const n of nodos) {
  if (typeof n["@id"] !== "string") continue;
  definidos.set(n["@id"], (definidos.get(n["@id"]) ?? 0) + 1);
}
for (const [id, veces] of definidos) {
  if (veces > 1) errores.push(`El @id ${id} está definido ${veces} veces en la página.`);
}
for (const id of new Set(referencias)) {
  if (!definidos.has(id)) {
    errores.push(`Referencia sin resolver: {"@id": "${id}"} no apunta a ningún nodo de esta página.`);
  }
}

// Nodos de primer nivel sin @id: no se pueden enlazar desde otros nodos
const TIPOS_ANIDADOS = new Set([
  "PostalAddress", "ListItem", "Question", "Answer", "ImageObject", "Offer", "City", "Country",
  "Place", "ContactPoint", "OpeningHoursSpecification", "GeoCoordinates", "AggregateRating",
  "MonetaryAmount", "QuantitativeValue", "PropertyValue", "HowToStep", "EntryPoint", "SearchAction",
  "AdministrativeArea", "State", "Rating",
]);
for (const n of nodos) {
  const tipos = [n["@type"]].flat();
  if (!n["@id"] && !tipos.some((t) => TIPOS_ANIDADOS.has(t))) {
    avisos.push(`Nodo ${tipos.join("/")} sin @id: queda desconectado del grafo.`);
  }
}

// Coherencia con el texto visible
const visible = textoVisible(html);
const titulo = normalizar(decodificar(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""));
for (const n of nodos) {
  const tipos = [n["@type"]].flat();
  if (tipos.some((t) => TIPOS_ANIDADOS.has(t) && t !== "Question")) continue;
  for (const clave of ["name", "headline"]) {
    const valor = n[clave];
    if (typeof valor !== "string" || !valor.trim()) continue;
    const buscado = normalizar(valor);
    if (!visible.includes(buscado) && !titulo.includes(buscado)) {
      avisos.push(`${tipos.join("/")}.${clave} = «${valor}» no aparece en el texto visible ni en el <title>.`);
    }
  }
}

// Canonical
const canonical = canonicalDe(html);
if (!canonical) {
  avisos.push("La página no declara <link rel=\"canonical\">.");
} else if (nodos.length && !nodos.some((n) => n.url === canonical || n.mainEntityOfPage === canonical)) {
  avisos.push(`Ningún nodo usa la canonical (${canonical}) como url.`);
}

const resumen = {
  origen: destino,
  userAgent,
  bloques: bloques.length,
  nodos: nodos.map((n) => ({ tipo: [n["@type"]].flat().join("/"), id: n["@id"] ?? null })),
  referencias: [...new Set(referencias)],
  canonical: canonical ?? null,
  errores,
  avisos,
};

if (comoJson) {
  console.log(JSON.stringify(resumen, null, 2));
} else {
  console.log(`\nPSA — ${destino}`);
  console.log(`Bloques JSON-LD en el HTML inicial: ${bloques.length}`);
  console.log(`Canonical: ${canonical ?? "—"}`);
  console.log(`\nNodos (${nodos.length}):`);
  for (const n of resumen.nodos) console.log(`  ${n.tipo.padEnd(22)} ${n.id ?? "(sin @id)"}`);
  console.log(`\nErrores (${errores.length}):`);
  for (const e of errores) console.log(`  ✗ ${e}`);
  console.log(`\nAvisos (${avisos.length}):`);
  for (const a of avisos) console.log(`  ! ${a}`);
  console.log(errores.length ? "\nResultado: NO CUMPLE\n" : "\nResultado: correcto\n");
}

process.exit(errores.length ? 1 : 0);
