export class Localidad {
  _id: string;
  nombre: string;
  codigo_postal: string;

  constructor(
    _id: string = '',
    nombre: string = '',
    codigo_postal: string = '',
  ) {
    this._id = _id;
    this.nombre = nombre;
    this.codigo_postal = codigo_postal;
  }
}
