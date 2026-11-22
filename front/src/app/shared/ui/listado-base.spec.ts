import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, of, throwError } from 'rxjs';
import { ListadoBase } from './listado-base';
import { ConfirmacionService } from './confirmacion.service';
import { NotificacionService } from './notificacion.service';
import { MENSAJE_ERROR_SERVIDOR, MENSAJE_SIN_CONEXION } from '../utils/errores';

interface Item {
  _id: string;
  nombre: string;
}

let cargar: jasmine.Spy;
let eliminar: jasmine.Spy;

/** Listado mínimo para probar el comportamiento común de ListadoBase. */
@Component({ selector: 'app-listado-prueba', template: '', standalone: true })
class ListadoPrueba extends ListadoBase<Item> {
  protected readonly recurso = 'pruebas';
  protected cargar$(): Observable<{ data: Item[] }> { return cargar(); }
  protected eliminar$(id: string): Observable<unknown> { return eliminar(id); }
  protected textoBuscable(item: Item): string { return item.nombre; }
  protected descripcion(item: Item): string { return `la prueba ${item.nombre}`; }
}

describe('ListadoBase (comportamiento común de los listados)', () => {
  const uno: Item = { _id: '1', nombre: 'Uno' };
  const dos: Item = { _id: '2', nombre: 'Dos' };
  const fallo = (status: number, error?: unknown) => throwError(() => new HttpErrorResponse({ status, error }));

  let confirmacion: { confirmar: jasmine.Spy };
  let notificaciones: { exito: jasmine.Spy; error: jasmine.Spy; info: jasmine.Spy };

  function montar() {
    cargar = jasmine.createSpy('cargar').and.returnValue(of({ data: [uno, dos] }));
    eliminar = jasmine.createSpy('eliminar').and.returnValue(of({}));
    confirmacion = { confirmar: jasmine.createSpy('confirmar').and.returnValue(of(true)) };
    notificaciones = { exito: jasmine.createSpy('exito'), error: jasmine.createSpy('error'), info: jasmine.createSpy('info') };
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfirmacionService, useValue: confirmacion },
        { provide: NotificacionService, useValue: notificaciones },
      ],
    });
    const fixture = TestBed.createComponent(ListadoPrueba);
    return { fixture, listado: fixture.componentInstance };
  }

  it('al abrir carga los registros', () => {
    const { fixture, listado } = montar();
    fixture.detectChanges();

    expect(listado.cargando).toBeFalse();
    expect(listado.error).toBe('');
    expect(listado.visibles.map((i) => i._id)).toEqual(['1', '2']);
  });

  it('sin conexión muestra que no se pudo conectar y deja reintentar', () => {
    const { fixture, listado } = montar();
    cargar.and.returnValue(fallo(0));
    fixture.detectChanges();

    expect(listado.error).toBe(MENSAJE_SIN_CONEXION);
    expect(listado.visibles).toEqual([]);

    cargar.and.returnValue(of({ data: [uno] }));
    listado.recargar();

    expect(listado.error).toBe('');
    expect(listado.visibles.length).toBe(1);
  });

  it('si el servidor falla (500) avisa que tuvo un problema', () => {
    const { fixture, listado } = montar();
    cargar.and.returnValue(fallo(500));
    fixture.detectChanges();

    expect(listado.error).toBe(MENSAJE_ERROR_SERVIDOR);
  });

  it('si el back rechaza sin mensaje (404), usa el texto del recurso', () => {
    const { fixture, listado } = montar();
    cargar.and.returnValue(fallo(404));
    fixture.detectChanges();

    expect(listado.error).toBe('No se pudo cargar el listado de pruebas.');
  });

  it('si se recarga dos veces seguidas, una respuesta vieja no pisa a la nueva', () => {
    const { fixture, listado } = montar();
    const primera = new Subject<{ data: Item[] }>();
    const segunda = new Subject<{ data: Item[] }>();
    cargar.and.returnValues(primera, segunda);
    fixture.detectChanges(); // abre: pide la primera
    listado.recargar(); // el usuario cambia de filtro: pide la segunda

    segunda.next({ data: [dos] });
    primera.next({ data: [uno] }); // llega tarde: ya fue cancelada

    expect(listado.items.map((i) => i._id)).toEqual(['2']);
    expect(listado.cargando).toBeFalse();
    expect(primera.observed).toBeFalse();
  });

  it('un error no corta las recargas siguientes', () => {
    const { fixture, listado } = montar();
    cargar.and.returnValues(fallo(500), fallo(0), of({ data: [uno] }));
    fixture.detectChanges();
    listado.recargar();
    expect(listado.error).toBe(MENSAJE_SIN_CONEXION);

    listado.recargar();

    expect(listado.error).toBe('');
    expect(listado.visibles.map((i) => i._id)).toEqual(['1']);
  });

  it('eliminar pide confirmación, borra y avisa', () => {
    const { fixture, listado } = montar();
    fixture.detectChanges();

    listado.confirmarEliminar(uno);

    expect(eliminar).toHaveBeenCalledOnceWith('1');
    expect(listado.visibles.map((i) => i._id)).toEqual(['2']);
    expect(notificaciones.exito).toHaveBeenCalledOnceWith('Se eliminó la prueba Uno.');
  });

  it('si el usuario no confirma, no se elimina nada', () => {
    const { fixture, listado } = montar();
    fixture.detectChanges();
    confirmacion.confirmar.and.returnValue(of(false));

    listado.confirmarEliminar(uno);

    expect(eliminar).not.toHaveBeenCalled();
    expect(listado.visibles.length).toBe(2);
  });

  it('si el back no deja eliminar (409), muestra su motivo y el registro sigue', () => {
    const { fixture, listado } = montar();
    fixture.detectChanges();
    eliminar.and.returnValue(fallo(409, { message: 'El cliente tiene ventas asociadas.' }));

    listado.confirmarEliminar(uno);

    expect(notificaciones.error).toHaveBeenCalledOnceWith('El cliente tiene ventas asociadas.');
    expect(listado.eliminandoId).toBeNull();
    expect(listado.visibles.length).toBe(2);
  });

  it('eliminar sin conexión avisa que no se pudo conectar', () => {
    const { fixture, listado } = montar();
    fixture.detectChanges();
    eliminar.and.returnValue(fallo(0));

    listado.confirmarEliminar(uno);

    expect(notificaciones.error).toHaveBeenCalledOnceWith(MENSAJE_SIN_CONEXION);
  });

  it('un 403 al eliminar no duplica el aviso (ya lo muestra el interceptor)', () => {
    const { fixture, listado } = montar();
    fixture.detectChanges();
    eliminar.and.returnValue(fallo(403));

    listado.confirmarEliminar(uno);

    expect(notificaciones.error).not.toHaveBeenCalled();
    expect(listado.eliminandoId).toBeNull();
  });
});
