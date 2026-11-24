/**
 * AMBIENTE DE PRODUCCIÓN (lo usa `ng build`, que por defecto es la configuración "production").
 *
 * Nunca poner acá secretos: este archivo queda dentro del JavaScript que descarga el navegador.
 *
 * TODO(deploy): reemplazar apiUrl por la URL del back desplegado en Vercel,
 * con https:// y SIN barra final. Ejemplo: 'https://pauny-crm-api.vercel.app'.
 * `npm run build:prod` falla mientras apunte a localhost (ver scripts/verificar-produccion.mjs).
 */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000'
};
