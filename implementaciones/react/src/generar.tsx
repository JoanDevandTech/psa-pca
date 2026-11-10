/**
 * Genera el sitio estático: renderiza cada página con react-dom/server y
 * escribe el HTML en dist/. Aquí no hay JavaScript de cliente: lo que se
 * escribe en disco es exactamente lo que recibe un rastreador.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Inicio, ruta as rutaInicio } from "./paginas/Inicio";
import { Servicio, ruta as rutaServicio } from "./paginas/Servicio";
import { Articulo, ruta as rutaArticulo } from "./paginas/Articulo";

const paginas: [string, ReactElement][] = [
  [rutaInicio, <Inicio />],
  [rutaServicio, <Servicio />],
  [rutaArticulo, <Articulo />],
];

await rm("dist", { recursive: true, force: true });

for (const [ruta, elemento] of paginas) {
  const archivo = join("dist", ruta, "index.html");
  await mkdir(dirname(archivo), { recursive: true });
  await writeFile(archivo, "<!doctype html>" + renderToStaticMarkup(elemento));
  console.log(archivo);
}
