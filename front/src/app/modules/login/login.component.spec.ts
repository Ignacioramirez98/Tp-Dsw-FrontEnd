import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { MENSAJE_ERROR_SERVIDOR, MENSAJE_SIN_CONEXION } from '../../shared/utils/errores';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
      'saveToken',
      'saveUsuarioId',
      'saveCliente',
      'saveVendedorId',
      'saveOperarioId',
      'saveRol'
    ]);

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe guardar credenciales y redirigir a dashboard de cliente', () => {
    authServiceSpy.login.and.returnValue(of({
      message: 'Login exitoso',
      token: 'jwt-token',
      data: {
        usuarioId: 'usuario-1',
        clienteId: 'cliente-1',
        rol: 'cliente',
        activo: true
      }
    }));

    component.usuario = 'usuario';
    component.contrasena = 'password';

    component.onLogin();

    expect(authServiceSpy.saveToken).toHaveBeenCalledWith('jwt-token');
    expect(authServiceSpy.saveUsuarioId).toHaveBeenCalledWith('usuario-1');
    expect(authServiceSpy.saveCliente).toHaveBeenCalledWith('cliente-1');
    expect(authServiceSpy.saveRol).toHaveBeenCalledWith('cliente');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cliente-dashboard']);
  });

  it('debe mostrar mensaje amigable cuando falla login', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('credenciales invalidas')));

    component.onLogin();

    expect(component.errorMessage).toBe('Usuario o contraseña incorrectos');
  });

  it('muestra el motivo que manda el back cuando las credenciales son incorrectas', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Credenciales inválidas' } })));

    component.onLogin();

    expect(component.errorMessage).toBe('Credenciales inválidas');
  });

  it('avisa si el usuario está desactivado (403)', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));

    component.onLogin();

    expect(component.errorMessage).toBe('Tu usuario está desactivado. Consultá con un administrador.');
  });

  it('sin conexión avisa que no se pudo conectar, no que la clave es incorrecta', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    component.onLogin();

    expect(component.errorMessage).toBe(MENSAJE_SIN_CONEXION);
  });

  it('si el servidor falla (500) avisa que tuvo un problema, no que la clave es incorrecta', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    component.onLogin();

    expect(component.errorMessage).toBe(MENSAJE_ERROR_SERVIDOR);
  });

  it('si la respuesta no trae token, avisa sin jerga técnica y no guarda nada', () => {
    authServiceSpy.login.and.returnValue(of({ message: 'Login exitoso' } as any));

    component.onLogin();

    expect(component.errorMessage).toBe('No pudimos iniciar tu sesión. Probá de nuevo en unos minutos.');
    expect(authServiceSpy.saveToken).not.toHaveBeenCalled();
    expect(component.enviando).toBeFalse();
  });

  it('no envía dos veces mientras espera la respuesta y vuelve a habilitar el botón al fallar', () => {
    const respuesta = new Subject<any>();
    authServiceSpy.login.and.returnValue(respuesta);

    component.onLogin();
    component.onLogin();
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(authServiceSpy.login).toHaveBeenCalledTimes(1);
    expect(boton.disabled).toBeTrue();
    expect(boton.textContent).toContain('Ingresando');

    respuesta.error(new HttpErrorResponse({ status: 401, error: { message: 'Credenciales inválidas' } }));
    fixture.detectChanges();

    expect(boton.disabled).toBeFalse();
    expect(boton.textContent).toContain('Iniciar sesión');
    expect(fixture.nativeElement.querySelector('.alert-danger')?.textContent).toContain('Credenciales inválidas');
  });

  it('debe redirigir al vendedor a su dashboard operativo', () => {
    authServiceSpy.login.and.returnValue(of({
      message: 'Login exitoso',
      token: 'jwt-token',
      data: { rol: 'vendedor', activo: true }
    }));

    component.onLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/vendedor-dashboard']);
  });

  it('debe redirigir al operario al dashboard operativo', () => {
    authServiceSpy.login.and.returnValue(of({
      message: 'Login exitoso',
      token: 'jwt-token',
      data: { rol: 'operario', activo: true }
    }));

    component.onLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/vendedor-dashboard']);
  });
});
