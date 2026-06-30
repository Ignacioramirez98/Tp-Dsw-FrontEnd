export class Servicio {
  _id: string;
  nombre?: string;
  descripcion: string;
  importe_por_hora: number;
  imagenUrl?: string;

  constructor(
    _id: string = '',
    nombre: string = '',
    descripcion: string = '',
    importe_por_hora: number = 0,
    imagenUrl?: string
  ) {
    this._id = _id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.importe_por_hora = importe_por_hora;
    this.imagenUrl = imagenUrl;
  }
}
