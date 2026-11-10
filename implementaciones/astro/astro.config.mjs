import { defineConfig } from "astro/config";

// `site` debe ser el mismo valor que `url` en src/sitio.config.ts.
// Con barra final en las rutas, la canónica de cada página es única.
export default defineConfig({
  site: "https://ejemplo.example",
  trailingSlash: "always",
});
