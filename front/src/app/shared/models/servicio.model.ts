export class Servicio {
  _id: string;
  descripcion: string;
  importe_por_hora: number;

  constructor(
    _id: string = '',
    descripcion: string = '',
    importe_por_hora: number = 0
  ) {
    this._id = _id;
    this.descripcion = descripcion;
    this.importe_por_hora = importe_por_hora;
  }
}
