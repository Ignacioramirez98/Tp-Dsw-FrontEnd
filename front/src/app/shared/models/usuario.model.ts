/** Roles que puede tener una cuenta (los mismos que el backend). */
export type RolUsuario = 'admin' | 'vendedor' | 'operario' | 'cliente';

/** Cuenta de acceso al sistema; nunca incluye la contraseña. */
export interface Usuario {
  _id: string;
  usuario: string;
  rol: RolUsuario;
  activo: boolean;
  /** Perfil de negocio al que pertenece la cuenta (según el rol); el admin no tiene. */
  clienteId: string | null;
  vendedorId: string | null;
  operarioId: string | null;
  createdAt?: string;
}

/** Datos que se envían al crear o editar una cuenta (en la edición todos son opcionales). */
export interface DatosUsuario {
  usuario?: string;
  contraseña?: string;
  rol?: RolUsuario;
  activo?: boolean;
  clienteId?: string;
  vendedorId?: string;
  operarioId?: string;
}

/** Roles que se pueden asignar desde la pantalla (los admins no se crean por la app). */
export const ROLES_ASIGNABLES: { valor: RolUsuario; etiqueta: string }[] = [
  { valor: 'cliente', etiqueta: 'Cliente' },
  { valor: 'vendedor', etiqueta: 'Vendedor' },
  { valor: 'operario', etiqueta: 'Operario' },
];

export const ETIQUETA_ROL: Record<RolUsuario, string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  operario: 'Operario',
  cliente: 'Cliente',
};

/** Campo de la cuenta que apunta al perfil de cada rol (el admin no tiene). */
export const CAMPO_PERFIL: Record<RolUsuario, 'clienteId' | 'vendedorId' | 'operarioId' | null> = {
  admin: null,
  cliente: 'clienteId',
  vendedor: 'vendedorId',
  operario: 'operarioId',
};
