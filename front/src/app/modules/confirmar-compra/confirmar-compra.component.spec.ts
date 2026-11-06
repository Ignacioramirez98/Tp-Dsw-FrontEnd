import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ConfirmarCompraComponent } from './confirmar-compra.component';
import { VentasService } from '../ventas/ventas.service';
import { ProductosService } from '../productos/producto.service';
import { AuthService } from '../../shared/services/auth.service';
import { CarritoService } from '../../shared/services/carrito.service';
import { ConfirmacionService } from '../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../shared/ui/notificacion.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { Producto } from '../../shared/models/producto.model';

registerLocaleData(localeEsAr, 'es-AR');

describe('ConfirmarCompraComponent (Tu pedido)', () => {
  const tractor = () => new Producto('p1', 'Tractor', '', 0, 1000, 5);
  const cosechadora = () => new Producto('p2', 'Cosechadora', '', 0, 500, 3);

  let ventas: { crearVenta: jasmine.Spy };
  let confirmacion: { confirmar: jasmine.Spy };
  let notificaciones: { exito: jasmine.Spy; info: jasmine.Spy; error: jasmine.Spy };
  let navegar: jasmine.Spy;

  function crear(catalogo: Producto[] = [tractor(), cosechadora()]) {
    localStorage.clear();
    ventas = { crearVenta: jasmine.createSpy('crearVenta').and.returnValue(of({ data: { _id: 'v-1' } })) };
    confirmacion = { confirmar: jasmine.createSpy('confirmar').and.returnValue(of(true)) };
    notificaciones = { exito: jasmine.createSpy('exito'), info: jasmine.createSpy('info'), error: jasmine.createSpy('error') };

    TestBed.configureTestingModule({
      declarations: [ConfirmarCompraComponent],
      imports: [PageHeaderComponent, RouterLink],
      providers: [
        provideRouter([]),
        { provide: VentasService, useValue: ventas },
        { provide: ProductosService, useValue: { getProductos: () => of({ data: catalogo }) } },
        { provide: AuthService, useValue: { getClienteId: () => null } },
        { provide: ConfirmacionService, useValue: confirmacion },
        { provide: NotificacionService, useValue: notificaciones },
      ],
    });
    navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    return TestBed.inject(CarritoService);
  }

  function montar() {
    const fixture = TestBed.createComponent(ConfirmarCompraComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  }

  afterAll(() => localStorage.clear());

  it('envía los productos con la cantidad real del carrito, lo vacía y va al detalle del pedido', () => {
    const carrito = crear();
    carrito.fijarCantidad(tractor(), 3);
    carrito.fijarCantidad(cosechadora(), 1);
    const { componente } = montar();

    componente.enviar();

    expect(ventas.crearVenta).toHaveBeenCalledOnceWith({
      items: [
        { productoId: 'p1', cantidad: 3 },
        { productoId: 'p2', cantidad: 1 },
      ],
    });
    expect(carrito.unidades()).toBe(0);
    expect(notificaciones.exito).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/ventas', 'v-1']);
  });

  it('no manda el cliente: lo toma el back del token', () => {
    crear().fijarCantidad(tractor(), 1);
    const { componente } = montar();

    componente.enviar();

    expect(Object.keys(ventas.crearVenta.calls.mostRecent().args[0])).toEqual(['items']);
  });

  it('si el back responde con error, el pedido no se vacía y se muestra el motivo', () => {
    const carrito = crear();
    carrito.fijarCantidad(tractor(), 2);
    ventas.crearVenta.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'No hay stock suficiente de Tractor.' } })),
    );
    const { componente, fixture, html } = montar();

    componente.enviar();
    fixture.detectChanges();

    expect(carrito.unidades()).toBe(2);
    expect(navegar).not.toHaveBeenCalled();
    expect(componente.enviando).toBeFalse();
    expect(componente.errorServidor).toBe('No hay stock suficiente de Tractor.');
    expect(html.querySelector('.alert-danger')?.textContent).toContain('No hay stock suficiente de Tractor.');
  });

  it('si el back no manda mensaje, usa uno genérico', () => {
    crear().fijarCantidad(tractor(), 1);
    ventas.crearVenta.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { componente } = montar();

    componente.enviar();

    expect(componente.errorServidor).toBe('No se pudo enviar el pedido. Intentá de nuevo.');
  });

  it('sin conexión (status 0) avisa que no se pudo conectar', () => {
    crear().fijarCantidad(tractor(), 1);
    ventas.crearVenta.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const { componente } = montar();

    componente.enviar();

    expect(componente.errorServidor).toBe('No se pudo conectar con el servidor.');
  });

  it('no envía dos veces el mismo pedido mientras espera la respuesta', () => {
    crear().fijarCantidad(tractor(), 1);
    ventas.crearVenta.and.returnValue(new Subject());
    const { componente } = montar();

    componente.enviar();
    componente.enviar();

    expect(ventas.crearVenta).toHaveBeenCalledTimes(1);
    expect(componente.enviando).toBeTrue();
  });

  it('con el pedido vacío no envía nada y ofrece ir al catálogo', () => {
    crear();
    const { componente, html } = montar();

    componente.enviar();

    expect(ventas.crearVenta).not.toHaveBeenCalled();
    expect(html.textContent).toContain('Tu pedido está vacío');
    expect(html.textContent).toContain('Ir al catálogo');
    expect(Array.from(html.querySelectorAll('button')).some((b) => b.textContent?.includes('Enviar pedido'))).toBeFalse();
  });

  it('el botón Enviar pedido de la pantalla dispara el envío', () => {
    crear().fijarCantidad(tractor(), 2);
    const { html } = montar();

    const boton = Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes('Enviar pedido'));
    boton?.click();

    expect(ventas.crearVenta).toHaveBeenCalledTimes(1);
  });

  it('cambiar la cantidad en pantalla actualiza el total y no deja pasar del stock', () => {
    const carrito = crear();
    carrito.fijarCantidad(tractor(), 5); // stock 5: ya está en el tope
    const { fixture, html } = montar();

    const mas = html.querySelector('button[aria-label="Agregar uno de Tractor"]') as HTMLButtonElement;
    expect(mas.disabled).toBeTrue();

    (html.querySelector('button[aria-label="Quitar uno de Tractor"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(carrito.cantidadDe('p1')).toBe(4);
    expect(carrito.total()).toBe(4000);
  });

  it('vaciar pide confirmación y solo vacía si el cliente acepta', () => {
    const carrito = crear();
    carrito.fijarCantidad(tractor(), 2);
    const { componente } = montar();

    confirmacion.confirmar.and.returnValue(of(false));
    componente.vaciar();
    expect(carrito.unidades()).toBe(2);

    confirmacion.confirmar.and.returnValue(of(true));
    componente.vaciar();
    expect(carrito.unidades()).toBe(0);
    expect(confirmacion.confirmar.calls.mostRecent().args[0].peligro).toBeTrue();
  });

  it('al abrir, ajusta el pedido al stock y precio de hoy y avisa', () => {
    // El catálogo de hoy tiene solo 1 tractor, y la cosechadora ya no existe
    const carrito = crear([new Producto('p1', 'Tractor', '', 0, 1000, 1)]);
    carrito.fijarCantidad(tractor(), 4);
    carrito.fijarCantidad(cosechadora(), 2);

    montar();

    expect(carrito.cantidadDe('p1')).toBe(1);
    expect(carrito.cantidadDe('p2')).toBe(0);
    expect(notificaciones.info).toHaveBeenCalledTimes(1);
  });

  it('si el catálogo no cambió, no muestra ningún aviso', () => {
    crear().fijarCantidad(tractor(), 2);

    montar();

    expect(notificaciones.info).not.toHaveBeenCalled();
  });
});
