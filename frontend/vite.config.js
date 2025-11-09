import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Añadido base para GitHub Pages.
// Esto asegura que los assets (js, css, imágenes) y las rutas se resuelvan
// correctamente cuando el sitio se sirva desde:
// https://bypipe27.github.io/SISTEMA-DE-GESTI-N-DE-ESCENARIOS-DEPORTIVOS-EN-LA-CIUDAD-DE-TULUA/
// Si cambias de repo/usuario, actualiza la ruta en `base`.
export default defineConfig({
  base: '/SISTEMA-DE-GESTI-N-DE-ESCENARIOS-DEPORTIVOS-EN-LA-CIUDAD-DE-TULUA/',
  plugins: [
    tailwindcss(),
  ],
})