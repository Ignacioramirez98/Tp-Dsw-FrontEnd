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

/**
 * Qué pasó con el aviso por mail al cliente (lo informa el back al crear, concretar o cancelar).
 * enviado | fallido (el servidor de correo rechazó) | desactivado (sin SMTP configurado)
 * | sin_mail (el cliente no tiene mail) | omitido (se eligió no avisar)
 */
export type EstadoNotificacion = 'enviado' | 'fallido' | 'desactivado' | 'sin_mail' | 'omitido';

export interface Notificacion {
  estado: EstadoNotificacion;
  para?: string;
}

/** Respuesta de las operaciones que pueden avisar al cliente por mail. */
export interface RespuestaVenta {
  data: Venta;
  notificacion?: Notificacion | null;
}
