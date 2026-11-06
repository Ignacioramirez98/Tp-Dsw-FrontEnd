import { Producto } from './producto.model';
import { Servicio } from './servicio.model';
import { Cliente } from './cliente.model';
import { Vendedor } from './vendedor.model';

/** Estados del ciclo de vida de una venta (ver backend: venta.estados.ts). */
export type EstadoVenta = 'pendiente' | 'concretada' | 'facturada' | 'cancelada';
export const ESTADOS_VENTA: EstadoVenta[] = ['pendiente', 'concretada', 'facturada', 'cancelada'];

/** Renglón de una venta: producto, cantidad y precio al momento de la venta. */
export interface ItemVenta {
  producto: Producto | null;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

/** Venta tal como la devuelve la API (con sus relaciones cargadas). */
export class Venta {
  _id = '';
  estado: EstadoVenta | string = 'pendiente';
  fechaContacto: string | Date = new Date();
  fechaDeVenta?: string | Date | null;
  fechaEntrega?: string | Date | null;
  fechaCancelacion?: string | Date | null;
  cliente?: Cliente;
  vendedor?: Vendedor | null;
  items?: ItemVenta[];
  servicios?: Servicio[];
}

/** Datos para crear o modificar una venta. */
export interface VentaPayload {
  clienteId?: string;
  vendedorId?: string | null;
  fechaEntrega?: string | null;
  items?: { productoId: string; cantidad: number }[];
  servicioIds?: string[];
}

export interface FiltrosVenta {
  estado?: string;
  clienteId?: string;
  vendedorId?: string;
  /** AAAA-MM-DD */
  desde?: string;
  hasta?: string;
}
