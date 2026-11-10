/**
 * Grafo PSA del sitio (modelo PCA-PSA).
 *
 * Funciones puras: reciben datos y devuelven nodos de schema.org. El layout
 * los une en UN solo bloque `@graph` por página. Reglas:
 *
 *  1. Todo `name`/`headline` que salga de aquí tiene que leerse en la página.
 *  2. Una entidad, un `@id`. Los nodos se enlazan por referencia, no se copian.
 *  3. Ningún `@id` se escribe a mano fuera de `ids`: así una referencia nunca
 *     apunta a un identificador distinto del que define el nodo.
 *
 * No depende de ningún framework: solo de los datos de ../sitio.config.
 */
import { SITIO } from "../sitio.config";

export type Ref = { "@id": string };
export type Nodo = { "@type": string | string[]; "@id"?: string } & Record<string, unknown>;
export type Grafo = { "@context": "https://schema.org"; "@graph": Nodo[] };
export type Miga = { name: string; url: string };

/** Raíz del sitio con barra final, igual que la canónica de la portada. */
const RAIZ = `${SITIO.url}/`;

export const ids = {
  organizacion: `${RAIZ}#organization`,
  sitio: `${RAIZ}#website`,
  fundador: `${RAIZ}#${SITIO.fundador.slug}`,
  pagina: (url: string) => `${url}#page`,
  servicio: (url: string) => `${url}#service`,
  articulo: (url: string) => `${url}#article`,
  migas: (url: string) => `${url}#breadcrumb`,
  faq: (url: string) => `${url}#faq`,
};

export const ref = (id: string): Ref => ({ "@id": id });

/** Quita claves vacías: no se publica `"sameAs": []` ni `"image": undefined`. */
function limpiar(nodo: Record<string, unknown>): Nodo {
  const salida: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(nodo)) {
    if (valor === undefined || valor === null || valor === "") continue;
    if (Array.isArray(valor) && valor.length === 0) continue;
    salida[clave] = valor;
  }
  return salida as Nodo;
}

/* ── Nodos globales ─────────────────────────────────────────────────────── */

/**
 * La empresa. El tipo (Organization, ProfessionalService…) sale de la
 * configuración.
 *
 * `conFundador` añade `founder` SOLO en las páginas que nombran a la persona
 * en el texto visible; en esas mismas páginas el layout emite el nodo Person.
 */
export function organizacion(conFundador = false): Nodo {
  return limpiar({
    "@type": SITIO.tipo,
    "@id": ids.organizacion,
    name: SITIO.nombre,
    url: RAIZ,
    email: SITIO.correo,
    telephone: SITIO.telefono,
    logo: SITIO.logo ? new URL(SITIO.logo, RAIZ).href : undefined,
    address: SITIO.direccion && {
      "@type": "PostalAddress",
      addressLocality: SITIO.direccion.localidad,
      addressRegion: SITIO.direccion.region,
      addressCountry: SITIO.direccion.pais,
    },
    sameAs: SITIO.perfiles,
    founder: conFundador ? ref(ids.fundador) : undefined,
  });
}

export function sitio(): Nodo {
  return {
    "@type": "WebSite",
    "@id": ids.sitio,
    url: RAIZ,
    name: SITIO.nombre,
    inLanguage: SITIO.idioma,
    publisher: ref(ids.organizacion),
  };
}

/** La persona fundadora. Solo se emite donde su nombre está escrito en la página. */
export function fundador(): Nodo {
  return limpiar({
    "@type": "Person",
    "@id": ids.fundador,
    name: SITIO.fundador.nombre,
    jobTitle: SITIO.fundador.cargo,
    worksFor: ref(ids.organizacion),
    sameAs: SITIO.fundador.perfiles,
  });
}

/* ── Nodos de página ────────────────────────────────────────────────────── */

export function pagina(datos: {
  url: string;
  tipo: string;
  nombre: string;
  descripcion: string;
  /** @id del nodo del que trata la página (servicio, artículo, empresa…). */
  entidadPrincipal?: string;
  tieneMigas?: boolean;
}): Nodo {
  return limpiar({
    "@type": datos.tipo,
    "@id": ids.pagina(datos.url),
    url: datos.url,
    name: datos.nombre,
    description: datos.descripcion,
    inLanguage: SITIO.idioma,
    isPartOf: ref(ids.sitio),
    breadcrumb: datos.tieneMigas ? ref(ids.migas(datos.url)) : undefined,
    mainEntity: datos.entidadPrincipal ? ref(datos.entidadPrincipal) : undefined,
  });
}

/** Un servicio es una entidad propia, distinta de la página que lo describe. */
export function servicio(datos: { url: string; nombre: string; descripcion: string }): Nodo {
  return limpiar({
    "@type": "Service",
    "@id": ids.servicio(datos.url),
    name: datos.nombre,
    description: datos.descripcion,
    serviceType: datos.nombre,
    url: datos.url,
    provider: ref(ids.organizacion),
    areaServed: SITIO.areaServida.map((a) => ({ "@type": a.tipo, name: a.nombre })),
    mainEntityOfPage: ref(ids.pagina(datos.url)),
  });
}

export function articulo(datos: {
  url: string;
  /** BlogPosting para el blog, Article para guías y documentación. */
  tipo: "BlogPosting" | "Article";
  titular: string;
  descripcion: string;
  /** @id del autor: `ids.fundador` o `ids.organizacion`. */
  autor: string;
  publicado?: Date;
  modificado?: Date;
  /** URL absoluta de la imagen de portada. */
  imagen?: string;
  seccion?: string;
}): Nodo {
  return limpiar({
    "@type": datos.tipo,
    "@id": ids.articulo(datos.url),
    headline: datos.titular,
    description: datos.descripcion,
    datePublished: datos.publicado?.toISOString(),
    dateModified: (datos.modificado ?? datos.publicado)?.toISOString(),
    image: datos.imagen,
    articleSection: datos.seccion,
    inLanguage: SITIO.idioma,
    author: ref(datos.autor),
    publisher: ref(ids.organizacion),
    mainEntityOfPage: ref(ids.pagina(datos.url)),
  });
}

export function migas(url: string, elementos: Miga[]): Nodo {
  return {
    "@type": "BreadcrumbList",
    "@id": ids.migas(url),
    itemListElement: elementos.map((miga, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: miga.name,
      item: miga.url,
    })),
  };
}

/** Las preguntas y respuestas son las MISMAS cadenas que pinta la página. */
export function faq(url: string, preguntas: { q: string; a: string }[]): Nodo {
  return {
    "@type": "FAQPage",
    "@id": ids.faq(url),
    isPartOf: ref(ids.pagina(url)),
    mainEntity: preguntas.map((p) => ({
      "@type": "Question",
      name: p.q,
      acceptedAnswer: { "@type": "Answer", text: p.a },
    })),
  };
}

/* ── Montaje ────────────────────────────────────────────────────────────── */

/** Un solo `@graph`. Falla en build si dos nodos comparten `@id`. */
export function grafo(...nodos: (Nodo | undefined | null | false)[]): Grafo {
  const lista = nodos.filter((n): n is Nodo => Boolean(n));
  const vistos = new Set<string>();
  for (const nodo of lista) {
    const id = nodo["@id"];
    if (!id) continue;
    if (vistos.has(id)) throw new Error(`PSA: @id duplicado en la página: ${id}`);
    vistos.add(id);
  }
  return { "@context": "https://schema.org", "@graph": lista };
}

/**
 * JSON para incrustar en <script>. Se escapa el signo "menor que" como su
 * secuencia Unicode para que un "</script>" dentro de un valor no cierre el
 * bloque. El JSON resultante es equivalente.
 */
export function serializar(datos: Grafo): string {
  return JSON.stringify(datos).replace(/</g, "\\u003c");
}
