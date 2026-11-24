import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule, provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UsuarioFormComponent } from './usuario-form.component';
import { UsuariosService } from '../../usuario.service';
import { ClientesService } from '../../../clientes/cliente.service';
import { VendedoresService } from '../../../vendedores/vendedor.service';
import { OperariosService } from '../../../operarios/operario.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { CampoComponent } from '../../../../shared/ui/campo.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header.component';

describe('UsuarioFormComponent', () => {
  let fixture: ComponentFixture<UsuarioFormComponent>;
  let componente: UsuarioFormComponent;
  let usuarios: jasmine.SpyObj<UsuariosService>;
  let navegar: jasmine.Spy;

  const personas = (prefijo: string) => ({
    data: [
      { _id: `${prefijo}1`, nombre: 'Ana', apellido: 'Gómez', dni: '30111222' },
      { _id: `${prefijo}2`, nombre: 'Beto', apellido: 'Díaz', dni: '30111333' },
    ],
  });

  function montar(id: string | null, cuenta: Record<string, unknown> | null = null, cuentas: Record<string, unknown>[] = []): void {
    usuarios = jasmine.createSpyObj<UsuariosService>('UsuariosService', ['getUsuarios', 'getUsuario', 'crear', 'actualizar']);
    usuarios.getUsuarios.and.returnValue(of({ data: cuentas as any }));
    usuarios.getUsuario.and.returnValue(of({ data: cuenta as any }));
    usuarios.crear.and.returnValue(of({ data: { usuarioId: 'nuevo', usuario: 'x', rol: 'cliente' } }));
    usuarios.actualizar.and.returnValue(of({ data: {} as any }));

    TestBed.configureTestingModule({
      declarations: [UsuarioFormComponent],
      imports: [ReactiveFormsModule, RouterModule, CampoComponent, PageHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: UsuariosService, useValue: usuarios },
        { provide: ClientesService, useValue: { getClientes: () => of(personas('c')) } },
        { provide: VendedoresService, useValue: { getVendedores: () => of(personas('v')) } },
        { provide: OperariosService, useValue: { getOperarios: () => of(personas('o')) } },
        { provide: AuthService, useValue: { getUsuarioId: () => 'u-yo' } },
        { provide: NotificacionService, useValue: jasmine.createSpyObj('NotificacionService', ['exito', 'error']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
      ],
    });
    fixture = TestBed.createComponent(UsuarioFormComponent);
    componente = fixture.componentInstance;
    navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  }

  describe('alta', () => {
    beforeEach(() => montar(null, null, [{ _id: 'u1', clienteId: 'c1' }]));

    it('ofrece solo las personas que todavía no tienen cuenta', () => {
      expect(componente.perfiles.map((p) => p.id)).toEqual(['c2']);
      expect(componente.perfiles[0].etiqueta).toContain('Díaz, Beto');
    });

    it('al cambiar el rol vacía la persona elegida y trae las del nuevo rol', () => {
      componente.form.patchValue({ perfilId: 'c2' });
      componente.form.controls['rol'].setValue('vendedor');
      expect(componente.form.value.perfilId).toBe('');
      expect(componente.perfiles.map((p) => p.id)).toEqual(['v1', 'v2']);
    });

    it('no envía si faltan datos y marca los errores', () => {
      componente.guardar();
      expect(usuarios.crear).not.toHaveBeenCalled();
      expect(componente.error('usuario')).toContain('obligatorio');
      expect(componente.error('contraseña')).toContain('obligatorio');
      expect(componente.error('perfilId')).toContain('obligatorio');
    });

    it('exige 6 caracteres en la contraseña', () => {
      componente.form.patchValue({ usuario: 'juan', contraseña: '123', perfilId: 'c2' });
      componente.guardar();
      expect(usuarios.crear).not.toHaveBeenCalled();
      expect(componente.error('contraseña')).toContain('al menos 6');
    });

    it('crea la cuenta con el perfil que corresponde al rol y vuelve al listado', () => {
      componente.form.patchValue({ usuario: '  juan  ', contraseña: 'juan123', perfilId: 'c2' });
      componente.guardar();

      expect(usuarios.crear).toHaveBeenCalledWith({ usuario: 'juan', contraseña: 'juan123', rol: 'cliente', clienteId: 'c2' });
      expect(navegar).toHaveBeenCalledWith(['/usuarios']);
    });

    it('envía operarioId cuando el rol es operario', () => {
      componente.form.controls['rol'].setValue('operario');
      componente.form.patchValue({ usuario: 'beto', contraseña: 'beto123', perfilId: 'o2' });
      componente.guardar();
      expect(usuarios.crear).toHaveBeenCalledWith({ usuario: 'beto', contraseña: 'beto123', rol: 'operario', operarioId: 'o2' });
    });

    it('muestra el motivo que explica el backend y no vuelve al listado', () => {
      usuarios.crear.and.returnValue(throwError(() => ({ status: 409, error: { message: 'El usuario ya existe' } })));
      componente.form.patchValue({ usuario: 'juan', contraseña: 'juan123', perfilId: 'c2' });
      componente.guardar();

      expect(componente.errorServidor).toBe('El usuario ya existe');
      expect(componente.guardando).toBeFalse();
      expect(navegar).not.toHaveBeenCalled();
    });
  });

  describe('edición', () => {
    const cuenta = { _id: 'u-ana', usuario: 'ana', rol: 'vendedor', activo: true, clienteId: null, vendedorId: 'v1', operarioId: null };

    beforeEach(() => montar('u-ana', cuenta, [cuenta]));

    it('carga la cuenta y deja elegida su persona (que sigue disponible)', () => {
      expect(componente.form.getRawValue()).toEqual(jasmine.objectContaining({ usuario: 'ana', rol: 'vendedor', perfilId: 'v1', activo: true }));
      expect(componente.perfiles.map((p) => p.id)).toContain('v1');
    });

    it('la contraseña vacía significa "no cambiarla": no se envía', () => {
      componente.guardar();
      expect(usuarios.actualizar).toHaveBeenCalledWith('u-ana', { usuario: 'ana', rol: 'vendedor', vendedorId: 'v1', activo: true });
      expect(navegar).toHaveBeenCalledWith(['/usuarios']);
    });

    it('envía la contraseña nueva si se escribe una', () => {
      componente.form.patchValue({ contraseña: 'otra-clave' });
      componente.guardar();
      expect(usuarios.actualizar).toHaveBeenCalledWith('u-ana', jasmine.objectContaining({ contraseña: 'otra-clave' }));
    });

    it('no acepta una contraseña nueva de menos de 6 caracteres', () => {
      componente.form.patchValue({ contraseña: '123' });
      componente.guardar();
      expect(usuarios.actualizar).not.toHaveBeenCalled();
    });

    it('envía el activo para poder desactivar la cuenta desde el formulario', () => {
      componente.form.patchValue({ activo: false });
      componente.guardar();
      expect(usuarios.actualizar).toHaveBeenCalledWith('u-ana', jasmine.objectContaining({ activo: false }));
    });
  });

  describe('edición de un administrador', () => {
    const admin = { _id: 'u-yo', usuario: 'admin', rol: 'admin', activo: true, clienteId: null, vendedorId: null, operarioId: null };

    beforeEach(() => montar('u-yo', admin, [admin]));

    it('no puede cambiar de rol ni vincularse, y no puede desactivarse a sí mismo', () => {
      expect(componente.esAdmin).toBeTrue();
      expect(componente.esPropia).toBeTrue();
      expect(fixture.nativeElement.querySelector('#rol')).toBeNull();
      expect(fixture.nativeElement.querySelector('#activo').disabled).toBeTrue();
    });

    it('envía solo el nombre y el estado, sin rol ni persona', () => {
      componente.form.patchValue({ contraseña: 'otra-clave' });
      componente.guardar();
      expect(usuarios.actualizar).toHaveBeenCalledWith('u-yo', { usuario: 'admin', contraseña: 'otra-clave', activo: true });
    });
  });
});
