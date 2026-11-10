import { Documento, urlDe } from "../componentes/Documento";
import { SITIO } from "../sitio.config";
import { faq, ids, servicio } from "../lib/schema";

export const ruta = "/servicios/integracion-de-apis/";

const url = urlDe(ruta);
const nombre = "Integración de APIs";
const descripcion =
  "Integración de APIs: conectamos tus aplicaciones para que intercambien datos de forma automática, con control de errores y documentación.";

// Un solo array para el texto visible y para el nodo FAQPage: las preguntas
// del marcado son, letra por letra, las que lee el visitante.
const preguntas = [
  {
    q: "¿Qué necesito para integrar dos aplicaciones por API?",
    a: "Que las dos aplicaciones ofrezcan una API documentada y que tengas credenciales de acceso a cada una. Si una no tiene API, a veces se puede recurrir a sus webhooks o a la exportación de archivos.",
  },
  {
    q: "¿Qué diferencia hay entre una API y un webhook?",
    a: "Con una API, tu aplicación pide los datos cuando los necesita. Con un webhook, la otra aplicación avisa a la tuya con una petición HTTP en cuanto ocurre un evento.",
  },
  {
    q: "¿Qué pasa si una de las APIs deja de responder?",
    a: "La integración reintenta la petición durante un tiempo limitado y, si sigue fallando, registra el error y avisa a una persona. Un dato no se da por enviado hasta que la API de destino confirma que lo ha recibido.",
  },
];

export function Servicio() {
  return (
    <Documento
      ruta={ruta}
      titulo={`${nombre} | ${SITIO.nombre}`}
      descripcion={descripcion}
      entidadPrincipal={ids.servicio(url)}
      migas={[
        { name: "Inicio", url: `${SITIO.url}/` },
        { name: nombre, url },
      ]}
      nodos={[servicio({ url, nombre, descripcion }), faq(url, preguntas)]}
    >
      <h1>{nombre}</h1>
      <p>
        La integración de APIs conecta dos o más aplicaciones para que intercambien datos de forma automática a través de
        sus interfaces de programación. En {SITIO.nombre} diseñamos esas conexiones, las ponemos en marcha y documentamos
        cómo funcionan.
      </p>

      <h2>¿Qué incluye la integración de APIs?</h2>
      <ul>
        <li>Análisis de la API de cada aplicación: autenticación, límites de uso y formato de los datos.</li>
        <li>Desarrollo de la conexión, con reintentos y registro de errores.</li>
        <li>Documentación de qué datos se mueven, en qué dirección y cuándo.</li>
      </ul>

      <h2>¿Cuándo conviene integrar dos aplicaciones?</h2>
      <p>
        Conviene cuando el mismo dato se copia a mano de un sistema a otro con frecuencia: cada copia manual es tiempo y
        una ocasión de error. Si el dato se mueve una vez al año, una exportación puntual suele bastar.
      </p>

      <h2>Preguntas frecuentes</h2>
      {preguntas.map((p) => (
        <section key={p.q}>
          <h3>{p.q}</h3>
          <p>{p.a}</p>
        </section>
      ))}
    </Documento>
  );
}
