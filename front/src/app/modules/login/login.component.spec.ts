import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RoleBadgeComponent } from '../../shared/components/role-badge/role-badge.component';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
      'saveToken',
      'saveCliente',
      'saveRol'
    ]);

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [CommonModule, FormsModule, RoleBadgeComponent],
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
      clienteId: 'cliente-1',
      rol: 'cliente'
    }));

    component.usuario = 'usuario';
    component.contrasena = 'password';

    component.onLogin();

    expect(authServiceSpy.saveToken).toHaveBeenCalledWith('jwt-token');
    expect(authServiceSpy.saveCliente).toHaveBeenCalledWith('cliente-1');
    expect(authServiceSpy.saveRol).toHaveBeenCalledWith('cliente');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cliente-dashboard']);
  });

  it('debe mostrar mensaje amigable cuando falla login', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('credenciales invalidas')));

    component.onLogin();

    expect(component.errorMessage).toBe('Usuario o contraseña incorrectos');
  });
});
