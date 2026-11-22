import { HttpErrorResponse } from '@angular/common/http';
import {
  MENSAJE_ERROR_SERVIDOR,
  MENSAJE_SIN_CONEXION,
  MENSAJE_TIMEOUT,
  mensajeDeErrorHttp,
} from './errores';

describe('mensajeDeErrorHttp', () => {
  const porDefecto = 'No se pudo guardar.';
  const http = (status: number, error?: unknown) => new HttpErrorResponse({ status, error });

  it('sin conexión (status 0) avisa que no se pudo conectar', () => {
    expect(mensajeDeErrorHttp(http(0), porDefecto)).toBe(MENSAJE_SIN_CONEXION);
  });

  it('408 y 504 avisan que el servidor tardó demasiado', () => {
    expect(mensajeDeErrorHttp(http(408), porDefecto)).toBe(MENSAJE_TIMEOUT);
    expect(mensajeDeErrorHttp(http(504), porDefecto)).toBe(MENSAJE_TIMEOUT);
  });

  it('un 5xx avisa que el servidor tuvo un problema, sin mostrar el texto técnico del back', () => {
    expect(mensajeDeErrorHttp(http(500, { message: 'MongoServerError: E11000' }), porDefecto)).toBe(MENSAJE_ERROR_SERVIDOR);
    expect(mensajeDeErrorHttp(http(503), porDefecto)).toBe(MENSAJE_ERROR_SERVIDOR);
  });

  it('un 4xx muestra el motivo que manda el back', () => {
    const err = http(409, { message: 'Stock insuficiente: Tractor (pedido 2, disponible 1)' });
    expect(mensajeDeErrorHttp(err, porDefecto)).toBe('Stock insuficiente: Tractor (pedido 2, disponible 1)');
  });

  it('un 4xx sin mensaje usa el texto por defecto', () => {
    expect(mensajeDeErrorHttp(http(400), porDefecto)).toBe(porDefecto);
    expect(mensajeDeErrorHttp(http(404, { message: '   ' }), porDefecto)).toBe(porDefecto);
  });

  it('ignora un message que no es texto', () => {
    expect(mensajeDeErrorHttp(http(400, { message: { campo: 'dni' } }), porDefecto)).toBe(porDefecto);
  });

  it('con algo que no es un error HTTP usa el texto por defecto', () => {
    expect(mensajeDeErrorHttp(new Error('boom'), porDefecto)).toBe(porDefecto);
    expect(mensajeDeErrorHttp(null, porDefecto)).toBe(porDefecto);
    expect(mensajeDeErrorHttp(undefined, porDefecto)).toBe(porDefecto);
  });
});
