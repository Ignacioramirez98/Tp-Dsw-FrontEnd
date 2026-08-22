export class Operario {
  _id: string;
  nombre: string;
  apellido: string;
  mail: string;
  dni: string;
  telefono: string;
  rol: string;

  constructor(
    _id: string = '',
    nombre: string = '',
    apellido: string = '',
    mail: string = '',
    dni: string = '',
    telefono: string = '',
    rol: string = '',
  ) {
    this._id = _id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.mail = mail;
    this.dni = dni;
    this.telefono = telefono;
    this.rol = rol;
  }
}
