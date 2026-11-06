import { Venta } from '../models/venta.model';

/** Total de los productos de una venta (cantidad × precio de cada renglón). */
export function totalVenta(venta: Venta): number {
  return (venta.items ?? []).reduce((total, item) => total + item.cantidad * item.precioUnitario, 0);
}

/** Ventas de la más nueva a la más vieja. */
export function ordenarPorFecha(ventas: Venta[]): Venta[] {
  return [...ventas].sort((a, b) => new Date(b.fechaContacto).getTime() - new Date(a.fechaContacto).getTime());
}

export interface ResumenVentas {
  /** Pedidos pendientes, del más viejo al más nuevo (los que esperan hace más, primero). */
  pendientes: Venta[];
  /** Ventas concretadas o facturadas desde el 1 del mes. */
  delMes: number;
  /** Suma de esas ventas. */
  vendidoDelMes: number;
}

/** Resume las ventas para el panel. Con vendedorId, "del mes" cuenta solo las de ese vendedor. */
export function resumirVentas(ventas: Venta[], hoy = new Date(), vendedorId?: string | null): ResumenVentas {
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const delMes = ventas.filter((v) =>
    (v.estado === 'concretada' || v.estado === 'facturada') &&
    !!v.fechaDeVenta && new Date(v.fechaDeVenta) >= inicioMes &&
    (!vendedorId || v.vendedor?._id === vendedorId));
  return {
    pendientes: ordenarPorFecha(ventas.filter((v) => v.estado === 'pendiente')).reverse(),
    delMes: delMes.length,
    vendidoDelMes: delMes.reduce((total, v) => total + totalVenta(v), 0),
  };
}
