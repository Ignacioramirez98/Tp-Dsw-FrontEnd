import {Producto} from "./producto.model.js"
import {Servicio} from "./servicio.model.js"

export class Venta {
  _id?: string;
  estado: string;
  fechaContacto: Date;
  fechaDeVenta: Date;
  fechaEntrega: Date;
  fechaCancelacion: Date | null;
  productos: Producto[];
  servicios: Servicio[];

  constructor(
    estado: string = '',
    fechaContacto: Date = new Date(),
    fechaDeVenta: Date = new Date(),
    fechaEntrega: Date = new Date(),
    fechaCancelacion: Date | null = null,
    productos: Producto[] = [],
    servicios: Servicio[] = []
  ) {
    this.estado = estado;
    this.fechaContacto = fechaContacto;
    this.fechaDeVenta = fechaDeVenta;
    this.fechaEntrega = fechaEntrega;
    this.fechaCancelacion = fechaCancelacion;
    this.productos = productos;
    this.servicios = servicios;
  }
}
