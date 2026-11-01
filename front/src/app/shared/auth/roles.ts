/** Roles del sistema (los mismos que el backend). */
export type Rol = 'admin' | 'vendedor' | 'operario' | 'cliente';

export const ROLES_PERSONAL: Rol[] = ['admin', 'vendedor', 'operario'];

/** Una entrada de menú; se muestra solo a los roles indicados. */
export interface ItemMenu {
  etiqueta: string;
  icono: string; // clase de Bootstrap Icons, ej. 'bi-people'
  ruta: string;
  roles: Rol[];
}

/**
 * Menú del personal de la empresa. Coincide con la matriz de permisos del backend
 * (README del back, sección "Roles y Permisos"): cada ruta lista los roles que la usan.
 */
export const MENU_PERSONAL: ItemMenu[] = [
  { etiqueta: 'Panel', icono: 'bi-house', ruta: '/vendedor-dashboard', roles: ['admin', 'vendedor', 'operario'] },
  { etiqueta: 'Ventas', icono: 'bi-bag-check', ruta: '/ventas', roles: ['admin', 'vendedor'] },
  { etiqueta: 'Clientes', icono: 'bi-people', ruta: '/clientes', roles: ['admin', 'vendedor', 'operario'] },
  { etiqueta: 'Productos', icono: 'bi-truck', ruta: '/productos', roles: ['admin'] },
  { etiqueta: 'Servicios', icono: 'bi-tools', ruta: '/servicios', roles: ['admin', 'operario'] },
  { etiqueta: 'Vendedores', icono: 'bi-person-badge', ruta: '/vendedores', roles: ['admin'] },
  { etiqueta: 'Operarios', icono: 'bi-person-gear', ruta: '/operarios', roles: ['admin'] },
  { etiqueta: 'Localidades', icono: 'bi-geo-alt', ruta: '/localidades', roles: ['admin'] },
];

/** Menú del cliente (portal de compras). */
export const MENU_CLIENTE: ItemMenu[] = [
  { etiqueta: 'Inicio', icono: 'bi-house', ruta: '/cliente-dashboard', roles: ['cliente'] },
  { etiqueta: 'Catálogo', icono: 'bi-grid', ruta: '/seleccion-productos', roles: ['cliente'] },
  { etiqueta: 'Servicios', icono: 'bi-tools', ruta: '/servicios', roles: ['cliente'] },
  { etiqueta: 'Mis compras', icono: 'bi-bag', ruta: '/ventas', roles: ['cliente'] },
];

/** Pantalla de inicio de cada rol después del login. */
export function rutaInicio(rol: string | null): string {
  return rol === 'cliente' ? '/cliente-dashboard' : '/vendedor-dashboard';
}
