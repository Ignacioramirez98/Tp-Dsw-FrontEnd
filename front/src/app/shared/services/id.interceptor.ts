import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * El backend (MikroORM) serializa la clave primaria como "id", pero los modelos
 * del front usan "_id". Este interceptor copia id -> _id en todos los objetos
 * de las respuestas de la API (incluidos los anidados, como cliente.localidad),
 * así cada pantalla puede seguir usando _id.
 */
export const idInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req).pipe(
    map((evento) => (evento instanceof HttpResponse && evento.body ? evento.clone({ body: normalizarIds(evento.body) }) : evento)),
  );
};

export function normalizarIds<T>(valor: T): T {
  if (Array.isArray(valor)) {
    return valor.map((item) => normalizarIds(item)) as T;
  }
  if (valor && typeof valor === 'object' && !(valor instanceof Blob)) {
    const copia: Record<string, unknown> = {};
    for (const [clave, contenido] of Object.entries(valor)) {
      copia[clave] = normalizarIds(contenido);
    }
    if (typeof copia['id'] === 'string' && !copia['_id']) {
      copia['_id'] = copia['id'];
    }
    return copia as T;
  }
  return valor;
}
