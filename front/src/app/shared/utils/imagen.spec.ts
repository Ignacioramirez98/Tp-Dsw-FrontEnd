import { environment } from '../../../environments/environment';
import { urlImagen } from './imagen';

describe('urlImagen', () => {
  it('devuelve null si no hay ruta', () => {
    expect(urlImagen(null)).toBeNull();
    expect(urlImagen(undefined)).toBeNull();
    expect(urlImagen('')).toBeNull();
  });

  it('arma la URL completa con el apiUrl del ambiente para una ruta relativa', () => {
    expect(urlImagen('/uploads/tractor.jpg')).toBe(`${environment.apiUrl}/uploads/tractor.jpg`);
  });

  it('deja intacta una URL absoluta (por ejemplo, una imagen en un almacenamiento externo)', () => {
    expect(urlImagen('https://cdn.ejemplo.com/tractor.jpg')).toBe('https://cdn.ejemplo.com/tractor.jpg');
    expect(urlImagen('http://localhost:3000/uploads/x.png')).toBe('http://localhost:3000/uploads/x.png');
  });
});
