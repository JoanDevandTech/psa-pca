/**
 * Equivalente del layout: canónica, <title>, meta description y UN solo
 * bloque JSON-LD con el @graph de la página.
 *
 * También pinta lo que el grafo publica en todas las páginas (el nombre de la
 * empresa, las migas y los datos de contacto), porque lo visible manda: el
 * marcado no puede decir nada que el texto no diga.
 */
import type { ReactNode } from "react";
import { SITIO } from "../sitio.config";
import { organizacion, sitio, fundador, pagina, migas as nodoMigas, type Nodo, type Miga } from "../lib/schema";
import { GrafoPSA } from "./GrafoPSA";

/** URL absoluta de una ruta del sitio. La usan el documento y las páginas. */
export const urlDe = (ruta: string) => new URL(ruta, SITIO.url).href;

type Props = {
  /** Ruta de la página con barra final, por ejemplo "/servicios/integracion-de-apis/". */
  ruta: string;
  titulo: string;
  descripcion: string;
  /**
   * Tipo de schema.org de la PÁGINA. Servicio o artículo no son tipos de
   * página: van como nodos propios en `nodos`.
   */
  tipo?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  /** Nodos propios de la página (servicio, artículo, FAQ…), creados con src/lib/schema.ts. */
  nodos?: Nodo[];
  /** @id del nodo del que trata la página; se publica como `mainEntity` de #page. */
  entidadPrincipal?: string;
  /** Migas de la portada a la página actual. El documento las pinta y crea el BreadcrumbList. */
  migas?: Miga[];
  /** La página nombra a la persona fundadora en el texto visible: añade Person y `founder`. */
  conFundador?: boolean;
  children: ReactNode;
};

export function Documento({ ruta, titulo, descripcion, tipo = "WebPage", nodos = [], entidadPrincipal, migas, conFundador = false, children }: Props) {
  const canonical = urlDe(ruta);

  return (
    <html lang={SITIO.idioma}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{titulo}</title>
        <meta name="description" content={descripcion} />
        <link rel="canonical" href={canonical} />
        <GrafoPSA
          nodos={[
            organizacion(conFundador),
            sitio(),
            conFundador && fundador(),
            pagina({
              url: canonical,
              tipo,
              nombre: titulo,
              descripcion,
              entidadPrincipal,
              tieneMigas: Boolean(migas?.length),
            }),
            migas?.length ? nodoMigas(canonical, migas) : undefined,
            ...nodos,
          ]}
        />
      </head>
      <body>
        <header>
          <a href="/">{SITIO.nombre}</a>
        </header>
        {migas?.length ? (
          <nav aria-label="Migas de pan">
            <ol>
              {migas.map((m) => (
                <li key={m.url}>
                  <a href={m.url}>{m.name}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <main>{children}</main>
        <footer>
          <p>
            {SITIO.nombre} · {SITIO.areaServida.map((a) => a.nombre).join(", ")}
            {SITIO.correo && (
              <>
                {" · "}
                <a href={`mailto:${SITIO.correo}`}>{SITIO.correo}</a>
              </>
            )}
          </p>
          <p>Empresa y sitio ficticios: demostración del modelo PCA-PSA.</p>
        </footer>
      </body>
    </html>
  );
}
