import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

/** Arma un JWT de prueba (la firma no se valida en el front). */
function token(payload: Record<string, unknown>): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.firma`;
}

describe('AuthService.isAuthenticated', () => {
  let service: AuthService;
  const ahora = Math.floor(Date.now() / 1000);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('sin token no hay sesión', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('con un token vigente hay sesión', () => {
    service.saveToken(token({ rol: 'admin', exp: ahora + 3600 }));
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('con un token vencido no hay sesión y se borran los datos guardados', () => {
    service.saveToken(token({ rol: 'admin', exp: ahora - 10 }));
    service.saveRol('admin');

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.getRol()).toBeNull();
  });
});
