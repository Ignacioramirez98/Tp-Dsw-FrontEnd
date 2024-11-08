export class Cliente {
  _id: string;
  nombre: string;
  apellido: string;
  dni: string;
  mail: string;
  telefono: string;
  direccion: string;
  razonSocial: string;

  constructor(
    _id: string = '',
    nombre: string = '',
    apellido: string = '',
    dni: string = '',
    mail: string = '',
    telefono: string = '',
    direccion: string = '',
    razonSocial: string = '',
  ) {
    this._id = _id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.mail = mail;
    this.telefono = telefono;
    this.direccion = direccion;
    this.razonSocial = razonSocial;
  }
}
