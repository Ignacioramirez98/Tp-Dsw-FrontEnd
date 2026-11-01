import { Venta } from '../models/venta.model';

/** Total de los productos de una venta (cantidad × precio de cada renglón). */
export function totalVenta(venta: Venta): number {
  return (venta.items ?? []).reduce((total, item) => total + item.cantidad * item.precioUnitario, 0);
}

/** Ventas de la más nueva a la más vieja. */
export function ordenarPorFecha(ventas: Venta[]): Venta[] {
  return [...ventas].sort((a, b) => new Date(b.fechaContacto).getTime() - new Date(a.fechaContacto).getTime());
}
