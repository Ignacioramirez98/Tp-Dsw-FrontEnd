import { TestBed } from '@angular/core/testing';
import { Producto } from '../models/producto.model';
import { CarritoService } from './carrito.service';

describe('CarritoService', () => {
  let carrito: CarritoService;

  const tractor = (stock = 5, precio = 1000) => new Producto('p1', 'Tractor', '', 0, precio, stock);
  const cosechadora = (stock = 3, precio = 500) => new Producto('p2', 'Cosechadora', '', 0, precio, stock);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    carrito = TestBed.inject(CarritoService);
  });

  afterAll(() => localStorage.clear());

  it('no deja pasar la cantidad del stock disponible', () => {
    carrito.fijarCantidad(tractor(5), 99);

    expect(carrito.cantidadDe('p1')).toBe(5);
  });

  it('al sumar tampoco supera el stock', () => {
    carrito.sumar(tractor(2), 1);
    carrito.sumar(tractor(2), 1);
    carrito.sumar(tractor(2), 1);

    expect(carrito.cantidadDe('p1')).toBe(2);
  });

  it('con cantidad 0 quita el producto del pedido', () => {
    carrito.fijarCantidad(tractor(), 2);
    carrito.fijarCantidad(tractor(), 0);

    expect(carrito.items().length).toBe(0);
    expect(carrito.cantidadDe('p1')).toBe(0);
  });

  it('no acepta cantidades negativas ni decimales', () => {
    carrito.fijarCantidad(tractor(), -3);
    expect(carrito.items().length).toBe(0);

    carrito.fijarCantidad(tractor(), 2.9);
    expect(carrito.cantidadDe('p1')).toBe(2);
  });

  it('total() y unidades() suman todos los productos', () => {
    carrito.fijarCantidad(tractor(5, 1000), 2);
    carrito.fijarCantidad(cosechadora(3, 500), 3);

    expect(carrito.unidades()).toBe(5);
    expect(carrito.total()).toBe(2 * 1000 + 3 * 500);
  });

  it('quitar() saca solo el producto indicado y vaciar() deja el pedido en cero', () => {
    carrito.fijarCantidad(tractor(), 1);
    carrito.fijarCantidad(cosechadora(), 1);

    carrito.quitar('p1');
    expect(carrito.items().map((i) => i.producto._id)).toEqual(['p2']);

    carrito.vaciar();
    expect(carrito.unidades()).toBe(0);
    expect(localStorage.getItem('carrito')).toBe('[]');
  });

  it('un servicio nuevo lee lo que quedó guardado en el navegador', () => {
    carrito.fijarCantidad(tractor(), 3);

    const otro = new CarritoService();

    expect(otro.cantidadDe('p1')).toBe(3);
    expect(otro.unidades()).toBe(3);
  });

  it('si lo guardado está dañado, arranca con el pedido vacío', () => {
    localStorage.setItem('carrito', '{esto no es json');

    expect(new CarritoService().items()).toEqual([]);
  });

  describe('actualizarProductos', () => {
    it('quita un producto que ya no existe, recorta al stock nuevo y devuelve true', () => {
      carrito.fijarCantidad(tractor(5), 3);
      carrito.fijarCantidad(cosechadora(3), 2);

      const hayCambios = carrito.actualizarProductos([tractor(2)]); // la cosechadora desapareció; el tractor quedó con 2

      expect(hayCambios).toBeTrue();
      expect(carrito.items().length).toBe(1);
      expect(carrito.cantidadDe('p1')).toBe(2);
      expect(carrito.cantidadDe('p2')).toBe(0);
    });

    it('toma el precio nuevo y avisa que hubo cambios', () => {
      carrito.fijarCantidad(tractor(5, 1000), 2);

      const hayCambios = carrito.actualizarProductos([tractor(5, 1200)]);

      expect(hayCambios).toBeTrue();
      expect(carrito.total()).toBe(2 * 1200);
    });

    it('devuelve false si nada cambió', () => {
      carrito.fijarCantidad(tractor(5, 1000), 2);

      expect(carrito.actualizarProductos([tractor(5, 1000)])).toBeFalse();
      expect(carrito.cantidadDe('p1')).toBe(2);
    });

    it('si el producto se quedó sin stock, lo saca del pedido', () => {
      carrito.fijarCantidad(tractor(5), 2);

      const hayCambios = carrito.actualizarProductos([tractor(0)]);

      expect(hayCambios).toBeTrue();
      expect(carrito.items().length).toBe(0);
    });
  });
});
