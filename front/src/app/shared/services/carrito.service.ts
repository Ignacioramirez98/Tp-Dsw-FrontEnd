import { Injectable, computed, signal } from '@angular/core';
import { Producto } from '../models/producto.model';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

const CLAVE = 'carrito';

/** Pedido que el cliente arma en el catálogo. Se guarda en el navegador para no perderlo al recargar. */
@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly _items = signal<ItemCarrito[]>(this.leer());

  readonly items = this._items.asReadonly();
  readonly unidades = computed(() => this._items().reduce((total, i) => total + i.cantidad, 0));
  readonly total = computed(() => this._items().reduce((total, i) => total + i.cantidad * i.producto.importe_venta, 0));

  cantidadDe(productoId: string): number {
    return this._items().find((i) => i.producto._id === productoId)?.cantidad ?? 0;
  }

  /** Fija la cantidad de un producto: 0 lo quita y nunca supera el stock. */
  fijarCantidad(producto: Producto, cantidad: number): void {
    const nueva = Math.max(0, Math.min(Math.floor(cantidad), producto.stock));
    const items = this._items();
    const existe = items.some((i) => i.producto._id === producto._id);
    const actualizados = existe
      ? items.map((i) => (i.producto._id === producto._id ? { producto, cantidad: nueva } : i))
      : [...items, { producto, cantidad: nueva }];
    this.guardar(actualizados.filter((i) => i.cantidad > 0));
  }

  sumar(producto: Producto, cuanto: number): void {
    this.fijarCantidad(producto, this.cantidadDe(producto._id) + cuanto);
  }

  quitar(productoId: string): void {
    this.guardar(this._items().filter((i) => i.producto._id !== productoId));
  }

  vaciar(): void {
    this.guardar([]);
  }

  /**
   * Actualiza precio y stock con los productos recién traídos del back (lo guardado puede estar viejo).
   * Quita los que ya no existen y recorta cantidades al stock. Devuelve true si cambió algo.
   */
  actualizarProductos(productos: Producto[]): boolean {
    let cambio = false;
    const actualizados: ItemCarrito[] = [];
    for (const item of this._items()) {
      const producto = productos.find((p) => p._id === item.producto._id);
      const cantidad = Math.min(item.cantidad, producto?.stock ?? 0);
      if (!producto || cantidad !== item.cantidad || producto.importe_venta !== item.producto.importe_venta) cambio = true;
      if (producto && cantidad > 0) actualizados.push({ producto, cantidad });
    }
    this.guardar(actualizados);
    return cambio;
  }

  private leer(): ItemCarrito[] {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
      return Array.isArray(guardado) ? guardado : [];
    } catch {
      return [];
    }
  }

  private guardar(items: ItemCarrito[]): void {
    this._items.set(items);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // Navegación privada o almacenamiento lleno: el carrito sigue funcionando en memoria
    }
  }
}
