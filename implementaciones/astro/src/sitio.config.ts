/**
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

export type AreaServida = {
  /** Tipo de schema.org del lugar. */
  tipo: "City" | "State" | "Country" | "AdministrativeArea";
  nombre: string;
};

export type ConfigSitio = {
  /** Nombre canónico de la empresa, idéntico al que se lee en la página. */
  nombre: string;
  /** Origen del sitio sin barra final (en Astro, el mismo valor que `site` en astro.config.mjs). */
  url: string;
  /** Tipo de schema.org de la empresa (Organization, ProfessionalService…). */
  tipo: string;
  /** Idioma del contenido (BCP 47). */
  idioma: string;
  correo?: string;
  telefono?: string;
  /** Ruta del logo dentro del sitio. */
  logo?: string;
  direccion?: { localidad: string; region: string; pais: string };
  areaServida: AreaServida[];
  /** Perfiles externos de la empresa (sameAs). */
  perfiles: string[];
  fundador: {
    nombre: string;
    /** Fragmento del @id de la persona: `${url}/#${slug}`. */
    slug: string;
    cargo: string;
    perfiles: string[];
  };
};

export const SITIO: ConfigSitio = {
  nombre: "Estudio Ejemplo",
  url: "https://ejemplo.example",
  tipo: "ProfessionalService",
  idioma: "es-ES",
  correo: "hola@ejemplo.example",
  logo: "/logo.svg",
  direccion: { localidad: "Madrid", region: "Comunidad de Madrid", pais: "ES" },
  areaServida: [
    { tipo: "City", nombre: "Madrid" },
    { tipo: "Country", nombre: "España" },
  ],
  perfiles: ["https://perfiles.example/estudio-ejemplo"],
  fundador: {
    nombre: "Ana Ejemplo",
    slug: "ana-ejemplo",
    cargo: "Fundadora",
    perfiles: ["https://perfiles.example/ana-ejemplo"],
  },
};
