import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { UsuariosService } from './usuario.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let http: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/usuarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UsuariosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista y trae una cuenta', () => {
    service.getUsuarios().subscribe(({ data }) => expect(data.length).toBe(1));
    const lista = http.expectOne(apiUrl);
    expect(lista.request.method).toBe('GET');
    lista.flush({ data: [{ _id: 'u1', usuario: 'ana', rol: 'vendedor', activo: true }] });

    service.getUsuario('u1').subscribe(({ data }) => expect(data.usuario).toBe('ana'));
    const una = http.expectOne(`${apiUrl}/u1`);
    expect(una.request.method).toBe('GET');
    una.flush({ data: { _id: 'u1', usuario: 'ana' } });
  });

  it('crea una cuenta con los datos del formulario', () => {
    const datos = { usuario: 'juan', contraseña: 'juan123', rol: 'cliente' as const, clienteId: 'c1' };
    service.crear(datos).subscribe(({ data }) => expect(data.usuarioId).toBe('u2'));
    const req = http.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ data: { usuarioId: 'u2', usuario: 'juan', rol: 'cliente' } });
  });

  it('edita con PATCH enviando solo lo indicado', () => {
    service.actualizar('u1', { contraseña: 'nueva-clave' }).subscribe();
    const req = http.expectOne(`${apiUrl}/u1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ contraseña: 'nueva-clave' });
    req.flush({ data: { _id: 'u1' } });
  });

  it('activa, desactiva y elimina', () => {
    service.activar('u1').subscribe();
    const activar = http.expectOne(`${apiUrl}/u1/activar`);
    expect(activar.request.method).toBe('PATCH');
    activar.flush({ data: { _id: 'u1', activo: true } });

    service.desactivar('u1').subscribe();
    const desactivar = http.expectOne(`${apiUrl}/u1/desactivar`);
    expect(desactivar.request.method).toBe('PATCH');
    desactivar.flush({});

    service.eliminar('u1').subscribe();
    const eliminar = http.expectOne(`${apiUrl}/u1`);
    expect(eliminar.request.method).toBe('DELETE');
    eliminar.flush({ message: 'usuario eliminado exitosamente' });
  });
});
