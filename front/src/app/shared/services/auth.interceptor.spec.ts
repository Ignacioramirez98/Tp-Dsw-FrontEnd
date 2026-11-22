import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NotificacionService } from '../ui/notificacion.service';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controlador: HttpTestingController;
  let auth: { getToken: jasmine.Spy; logout: jasmine.Spy };
  let navegar: jasmine.Spy;
  let notificaciones: { info: jasmine.Spy; error: jasmine.Spy; exito: jasmine.Spy };

  function configurar(token: string | null) {
    auth = { getToken: jasmine.createSpy('getToken').and.returnValue(token), logout: jasmine.createSpy('logout') };
    navegar = jasmine.createSpy('navigate');
    notificaciones = { info: jasmine.createSpy('info'), error: jasmine.createSpy('error'), exito: jasmine.createSpy('exito') };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: { navigate: navegar } },
        { provide: NotificacionService, useValue: notificaciones },
      ],
    });
    http = TestBed.inject(HttpClient);
    controlador = TestBed.inject(HttpTestingController);
  }

  afterEach(() => controlador.verify());

  /** Hace el pedido, lo responde con el error indicado y devuelve el error que ve quien llamó. */
  function fallar(url: string, status: number, body: object | null = null) {
    let recibido: { status: number } | undefined;
    http.get(url).subscribe({ error: (e) => (recibido = e) });
    const pedido = controlador.expectOne(url);
    // Sin conexión no hay respuesta HTTP: el navegador solo informa un error de red
    if (status === 0) pedido.error(new ProgressEvent('error'));
    else pedido.flush(body, { status, statusText: 'error' });
    return recibido;
  }

  it('agrega el token solo a los pedidos al backend', () => {
    configurar('jwt-123');
    http.get(`${environment.apiUrl}/ventas`).subscribe();
    http.get('https://otro-sitio.com/dato').subscribe();

    expect(controlador.expectOne(`${environment.apiUrl}/ventas`).request.headers.get('Authorization')).toBe('Bearer jwt-123');
    expect(controlador.expectOne('https://otro-sitio.com/dato').request.headers.has('Authorization')).toBeFalse();
  });

  it('401 con sesión: cierra la sesión, vuelve al login y avisa', () => {
    configurar('jwt-vencido');

    fallar(`${environment.apiUrl}/ventas`, 401);

    expect(auth.logout).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/login']);
    expect(notificaciones.info).toHaveBeenCalledWith('Tu sesión venció. Volvé a iniciar sesión.');
  });

  it('401 en el propio login no cierra sesión (es una clave incorrecta)', () => {
    configurar('jwt-viejo');

    fallar(`${environment.apiUrl}/usuarios/login`, 401);

    expect(auth.logout).not.toHaveBeenCalled();
    expect(notificaciones.info).not.toHaveBeenCalled();
  });

  it('401 sin sesión no hace nada', () => {
    configurar(null);

    fallar(`${environment.apiUrl}/ventas`, 401);

    expect(auth.logout).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('403 avisa con el motivo del back', () => {
    configurar('jwt');

    fallar(`${environment.apiUrl}/clientes`, 403, { message: 'No tenés permisos para ver clientes.' });

    expect(notificaciones.error).toHaveBeenCalledOnceWith('No tenés permisos para ver clientes.');
  });

  it('403 sin motivo avisa con un texto genérico', () => {
    configurar('jwt');

    fallar(`${environment.apiUrl}/clientes`, 403);

    expect(notificaciones.error).toHaveBeenCalledOnceWith('No tenés permisos para realizar esta acción.');
  });

  it('sin conexión y 500 no muestran aviso global: lo muestra cada pantalla, y el error le llega', () => {
    configurar('jwt');

    const sinConexion = fallar(`${environment.apiUrl}/ventas`, 0);
    const caido = fallar(`${environment.apiUrl}/productos`, 500, { message: 'boom' });

    expect(sinConexion?.status).toBe(0);
    expect(caido?.status).toBe(500);
    expect(notificaciones.error).not.toHaveBeenCalled();
    expect(notificaciones.info).not.toHaveBeenCalled();
  });
});
