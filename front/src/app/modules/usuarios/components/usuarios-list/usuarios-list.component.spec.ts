import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UsuariosListComponent } from './usuarios-list.component';
import { UsuariosService } from '../../usuario.service';
import { ClientesService } from '../../../clientes/cliente.service';
import { VendedoresService } from '../../../vendedores/vendedor.service';
import { OperariosService } from '../../../operarios/operario.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfirmacionService } from '../../../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { PageHeaderComponent } from '../../../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../../../shared/ui/paginador.component';
import { StatusChipComponent } from '../../../../shared/ui/status-chip.component';

describe('UsuariosListComponent', () => {
  let fixture: ComponentFixture<UsuariosListComponent>;
  let componente: UsuariosListComponent;
  let usuarios: jasmine.SpyObj<UsuariosService>;
  let confirmar: jasmine.Spy;
  let notificaciones: jasmine.SpyObj<NotificacionService>;

  const cuentas = [
    { _id: 'u-admin', usuario: 'admin', rol: 'admin', activo: true, clienteId: null, vendedorId: null, operarioId: null },
    { _id: 'u-ana', usuario: 'ana', rol: 'vendedor', activo: true, clienteId: null, vendedorId: 'v1', operarioId: null },
    { _id: 'u-sin', usuario: 'suelto', rol: 'cliente', activo: false, clienteId: null, vendedorId: null, operarioId: null },
  ];

  function montar(opciones: { fallanPersonas?: boolean } = {}): void {
    usuarios = jasmine.createSpyObj<UsuariosService>('UsuariosService', ['getUsuarios', 'activar', 'desactivar', 'eliminar']);
    usuarios.getUsuarios.and.returnValue(of({ data: cuentas as any }));
    usuarios.activar.and.returnValue(of({ data: {} as any }));
    usuarios.desactivar.and.returnValue(of({}));
    usuarios.eliminar.and.returnValue(of({}));
    confirmar = jasmine.createSpy('confirmar').and.returnValue(of(true));
    notificaciones = jasmine.createSpyObj<NotificacionService>('NotificacionService', ['exito', 'error']);
    const personas = opciones.fallanPersonas ? () => throwError(() => ({ status: 500 })) : () => of({ data: [] });

    TestBed.configureTestingModule({
      declarations: [UsuariosListComponent],
      imports: [RouterModule, PageHeaderComponent, PaginadorComponent, StatusChipComponent],
      providers: [
        provideRouter([]),
        { provide: UsuariosService, useValue: usuarios },
        { provide: ClientesService, useValue: { getClientes: personas } },
        { provide: VendedoresService, useValue: { getVendedores: opciones.fallanPersonas ? personas : () => of({ data: [{ _id: 'v1', nombre: 'Ana', apellido: 'Gómez' }] }) } },
        { provide: OperariosService, useValue: { getOperarios: personas } },
        { provide: AuthService, useValue: { getUsuarioId: () => 'u-admin' } },
        { provide: ConfirmacionService, useValue: { confirmar } },
        { provide: NotificacionService, useValue: notificaciones },
      ],
    });
    fixture = TestBed.createComponent(UsuariosListComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  const filas = () => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr'));
  const boton = (fila: HTMLElement, texto: string) =>
    Array.from<HTMLButtonElement>(fila.querySelectorAll('button')).find((b) => b.textContent?.includes(texto))!;

  it('muestra cada cuenta con su rol, su estado y el nombre de la persona vinculada', () => {
    montar();
    expect(filas().length).toBe(3);
    expect(filas()[1].textContent).toContain('Gómez, Ana');
    expect(filas()[1].textContent).toContain('Vendedor');
    expect(filas()[0].textContent).toContain('Administrador');
    expect(filas()[0].textContent).toContain('(vos)');
    expect(filas()[2].textContent).toContain('Desactivado');
  });

  it('sigue mostrando las cuentas si no se pueden traer las personas', () => {
    montar({ fallanPersonas: true });
    expect(filas().length).toBe(3);
    expect(filas()[1].textContent).toContain('Perfil no encontrado');
  });

  it('no deja desactivar ni eliminar la propia cuenta', () => {
    montar();
    const propia = filas()[0];
    expect(boton(propia, 'Desactivar').disabled).toBeTrue();
    expect(boton(propia, 'Eliminar').disabled).toBeTrue();
    expect(componente.motivoNoEliminar(componente.items[0])).toContain('propio usuario');
  });

  it('una cuenta vinculada a una persona no se elimina: se desactiva', () => {
    montar();
    expect(boton(filas()[1], 'Eliminar').disabled).toBeTrue();
    expect(componente.motivoNoEliminar(componente.items[1])).toContain('desactivalo');
    expect(boton(filas()[2], 'Eliminar').disabled).toBeFalse();
  });

  it('desactiva con confirmación y actualiza la fila sin recargar', () => {
    montar();
    boton(filas()[1], 'Desactivar').click();
    fixture.detectChanges();

    expect(confirmar).toHaveBeenCalled();
    expect(usuarios.desactivar).toHaveBeenCalledWith('u-ana');
    expect(filas()[1].textContent).toContain('Desactivado');
    expect(notificaciones.exito).toHaveBeenCalled();
    expect(usuarios.getUsuarios).toHaveBeenCalledTimes(1);
  });

  it('no desactiva si se cancela la confirmación', () => {
    montar();
    confirmar.and.returnValue(of(false));
    boton(filas()[1], 'Desactivar').click();
    expect(usuarios.desactivar).not.toHaveBeenCalled();
  });

  it('activa sin pedir confirmación', () => {
    montar();
    boton(filas()[2], 'Activar').click();
    fixture.detectChanges();

    expect(confirmar).not.toHaveBeenCalled();
    expect(usuarios.activar).toHaveBeenCalledWith('u-sin');
    expect(filas()[2].textContent).toContain('Activo');
  });

  it('muestra el motivo que explica el backend si no se puede cambiar el estado', () => {
    montar();
    usuarios.desactivar.and.returnValue(throwError(() => ({ status: 409, error: { message: 'No se puede ahora' } })));
    boton(filas()[1], 'Desactivar').click();

    expect(notificaciones.error).toHaveBeenCalledWith('No se puede ahora');
    expect(componente.items[1].activo).toBeTrue();
  });

  it('elimina una cuenta sin vínculo después de confirmar', () => {
    montar();
    boton(filas()[2], 'Eliminar').click();
    fixture.detectChanges();

    expect(usuarios.eliminar).toHaveBeenCalledWith('u-sin');
    expect(filas().length).toBe(2);
  });
});
