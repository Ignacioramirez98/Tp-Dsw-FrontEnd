/** Renglón de la factura: copia del ítem de la venta al momento de emitirla. */
export interface LineaFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

/** Datos del cliente tal como estaban al emitir la factura. */
export interface ReceptorFactura {
  nombre: string;
  dni: string;
  razonSocial: string;
  direccion: string;
  localidad: string | null;
  mail: string;
}

/**
 * Factura de una venta concretada (backend: módulo factura). Es un comprobante inmutable:
 * los datos del cliente y los renglones son una copia de cuando se emitió.
 * `venta` y `cliente` vienen como ids.
 */
export class Factura {
  _id = '';
  /** Número correlativo con punto de venta, ej. 0001-00000001. */
  numero = '';
  fechaEmision: string | Date = new Date();
  venta = '';
  cliente = '';
  /** Usuario (vendedor o admin) que la emitió. */
  emitidaPor = '';
  receptor!: ReceptorFactura;
  lineas: LineaFactura[] = [];
  /** Suma de los renglones, sin IVA. */
  subtotal = 0;
  /** Alícuota de IVA aplicada, en porcentaje (21). */
  alicuotaIva = 21;
  iva = 0;
  total = 0;
}

export interface FiltrosFactura {
  clienteId?: string;
  /** AAAA-MM-DD (fecha de emisión) */
  desde?: string;
  hasta?: string;
}
