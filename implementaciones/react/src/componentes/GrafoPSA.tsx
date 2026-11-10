import { grafo, serializar, type Nodo } from "../lib/schema";

/**
 * El bloque JSON-LD de la página. Se renderiza en el servidor (aquí, en el
 * build con react-dom/server), así que llega en el HTML inicial. Si este
 * componente solo se montara en el navegador, un rastreador que no ejecuta
 * JavaScript no vería el grafo.
 *
 * dangerouslySetInnerHTML es necesario porque React escaparía las comillas
 * del JSON si se pasara como texto hijo. serializar() ya escapa «<».
 */
export function GrafoPSA({ nodos }: { nodos: (Nodo | undefined | null | false)[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializar(grafo(...nodos)) }} />;
}
