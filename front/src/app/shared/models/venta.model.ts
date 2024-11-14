import {Producto} from "./producto.model.js"
import {Servicio} from "./servicio.model.js"
import {Cliente} from "./cliente.model.js"

export class Venta {
  _id?: string;
  estado: string;
  fechaContacto: Date;
  fechaDeVenta: Date;
  fechaEntrega: Date;
  fechaCancelacion: Date | null;
  cliente: Cliente;
  productos: Producto[];
  servicios: Servicio[];

  constructor(
    estado: string = '',
    fechaContacto: Date = new Date(),
    fechaDeVenta: Date = new Date(),
    fechaEntrega: Date = new Date(),
    fechaCancelacion: Date | null = null,
    cliente: Cliente,
    productos: Producto[] = [],
    servicios: Servicio[] = []
  ) {
    this.estado = estado;
    this.fechaContacto = fechaContacto;
    this.fechaDeVenta = fechaDeVenta;
    this.fechaEntrega = fechaEntrega;
    this.fechaCancelacion = fechaCancelacion;
    this.cliente = cliente;
    this.productos = productos;
    this.servicios = servicios;
  }
}
