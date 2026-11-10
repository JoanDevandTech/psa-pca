import { Documento } from "../componentes/Documento";
import { SITIO } from "../sitio.config";
import { ids } from "../lib/schema";

export const ruta = "/";

// La portada trata de la empresa: su entidad principal es #organization.
export function Inicio() {
  return (
    <Documento
      ruta={ruta}
      titulo={`${SITIO.nombre}: integración de APIs y webhooks`}
      descripcion={`${SITIO.nombre} conecta aplicaciones mediante APIs y webhooks para que los datos pasen de un sistema a otro sin copiarlos a mano.`}
      entidadPrincipal={ids.organizacion}
    >
      <h1>{SITIO.nombre}: integración de APIs y webhooks</h1>
      <p>
        {SITIO.nombre} conecta las aplicaciones de una empresa entre sí mediante APIs y webhooks, para que los datos
        pasen de un sistema a otro sin copiarlos a mano.
      </p>

      <h2>¿Qué servicio ofrece {SITIO.nombre}?</h2>
      <p>
        <a href="/servicios/integracion-de-apis/">Integración de APIs</a>: analizamos las interfaces de cada aplicación,
        desarrollamos la conexión con control de errores y documentamos cómo funciona.
      </p>

      <h2>¿Por dónde empezar si no conoces los webhooks?</h2>
      <p>
        Por el artículo <a href="/blog/que-es-un-webhook/">¿Qué es un webhook y cuándo conviene usarlo?</a>, que explica
        en qué se diferencia de consultar una API y qué comprobar al recibirlo.
      </p>
    </Documento>
  );
}
