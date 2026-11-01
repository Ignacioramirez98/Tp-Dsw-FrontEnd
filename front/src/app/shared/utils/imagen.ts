import { environment } from '../../../environments/environment';

/** URL completa de una imagen subida al backend (ej. "/uploads/x.jpg"). */
export function urlImagen(ruta?: string | null): string | null {
  if (!ruta) return null;
  return /^https?:\/\//.test(ruta) ? ruta : `${environment.apiUrl}${ruta}`;
}
