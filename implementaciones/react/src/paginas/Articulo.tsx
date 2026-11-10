import { Documento, urlDe } from "../componentes/Documento";
import { SITIO } from "../sitio.config";
import { articulo, ids } from "../lib/schema";

export const ruta = "/blog/que-es-un-webhook/";

const url = urlDe(ruta);
const titular = "¿Qué es un webhook y cuándo conviene usarlo?";
const descripcion =
  "Un webhook es un aviso automático entre aplicaciones. Qué es, en qué se diferencia de consultar una API y cuándo conviene usarlo.";
// Fecha fija: la misma que se pinta en <time>.
const publicado = new Date("2026-11-10");

export function Articulo() {
  return (
    <Documento
      ruta={ruta}
      titulo={`${titular} | ${SITIO.nombre}`}
      descripcion={descripcion}
      conFundador
      entidadPrincipal={ids.articulo(url)}
      migas={[
        { name: "Inicio", url: `${SITIO.url}/` },
        { name: titular, url },
      ]}
      nodos={[
        articulo({
          url,
          tipo: "BlogPosting",
          titular,
          descripcion,
          autor: ids.fundador,
          publicado,
        }),
      ]}
    >
      <article>
        <h1>{titular}</h1>
        <p>
          Por {SITIO.fundador.nombre}, {SITIO.fundador.cargo.toLowerCase()} de {SITIO.nombre} ·{" "}
          <time dateTime="2026-11-10">10 de noviembre de 2026</time>
        </p>

        <p>
          Un webhook es una petición HTTP que una aplicación envía automáticamente a una URL de otra aplicación cuando
          ocurre un evento, por ejemplo un pago confirmado o un formulario recibido. En lugar de preguntar cada cierto
          tiempo si hay novedades, la aplicación receptora recibe el aviso en el momento.
        </p>

        <h2>¿En qué se diferencia un webhook de consultar una API?</h2>
        <p>
          En la dirección de la petición. Al consultar una API, tu aplicación pregunta y la otra responde; si no hay
          novedades, la consulta se ha hecho para nada. Con un webhook es la aplicación de origen la que llama a la tuya,
          y solo cuando hay algo que contar.
        </p>

        <h2>¿Cuándo conviene usar un webhook?</h2>
        <p>
          Cuando necesitas reaccionar a un evento poco después de que ocurra y la aplicación de origen ofrece webhooks
          para ese evento. No sirve si el dato que buscas no genera ningún aviso, ni si tu servidor no puede recibir
          peticiones desde internet; en esos casos, consultar la API cada cierto tiempo es la alternativa.
        </p>

        <h2>¿Qué hay que comprobar al recibir un webhook?</h2>
        <ul>
          <li>Que viene de quien dice: verifica la firma o el secreto compartido si el emisor los ofrece.</li>
          <li>Que respondes rápido: confirma la recepción y procesa el contenido después.</li>
          <li>Que toleras duplicados: el mismo aviso puede llegar dos veces y no debe aplicarse dos veces.</li>
        </ul>

        <p>
          Si quieres conectar tus aplicaciones con webhooks o APIs, lee cómo trabajamos la{" "}
          <a href="/servicios/integracion-de-apis/">integración de APIs</a>.
        </p>
      </article>
    </Documento>
  );
}
