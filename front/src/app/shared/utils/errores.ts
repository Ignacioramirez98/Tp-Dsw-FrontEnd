/** Textos para mostrarle al usuario cuando falla un pedido al backend. */
export const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor.';
export const MENSAJE_TIMEOUT = 'El servidor tardó demasiado en responder. Probá de nuevo.';
export const MENSAJE_ERROR_SERVIDOR = 'El servidor tuvo un problema. Probá de nuevo en unos minutos.';

/**
 * Convierte el error de un pedido HTTP en un texto claro para el usuario:
 * - sin conexión (status 0), demora (408/504) y fallas del servidor (5xx) tienen su propio aviso;
 * - en los errores 4xx se muestra el motivo que explica el backend (ej. "Stock insuficiente");
 * - si no hay nada más preciso, se usa `porDefecto`.
 */
export function mensajeDeErrorHttp(err: unknown, porDefecto: string): string {
  const { status, error } = (err ?? {}) as { status?: unknown; error?: { message?: unknown } | null };

  if (typeof status === 'number') {
    if (status === 0) return MENSAJE_SIN_CONEXION;
    if (status === 408 || status === 504) return MENSAJE_TIMEOUT;
    if (status >= 500) return MENSAJE_ERROR_SERVIDOR;
  }

  const motivo = error?.message;
  return typeof motivo === 'string' && motivo.trim() ? motivo : porDefecto;
}
