/**
 * AMBIENTE DE PRODUCCIÓN (lo usa `ng build`, que por defecto es la configuración "production").
 *
 * Nunca poner acá secretos: este archivo queda dentro del JavaScript que descarga el navegador.
 *
 * apiUrl = URL del back desplegado en Vercel (proyecto "pauny-crm-api"), con https:// y SIN barra final.
 * `npm run build:prod` falla si apunta a localhost (ver scripts/verificar-produccion.mjs).
 */
export const environment = {
  production: true,
  apiUrl: 'https://pauny-crm-api.vercel.app'
};
