export class Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  importe_compra: number;
  importe_venta: number;
  stock: number;

  constructor(
    _id: string = '',
    nombre: string = '',
    descripcion: string = '',
    importe_compra: number = 0,
    importe_venta: number = 0,
    stock: number = 0
  ) {
    this._id = _id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.importe_compra = importe_compra;
    this.importe_venta = importe_venta;
    this.stock = stock;
  }
}
