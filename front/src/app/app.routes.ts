import { Routes } from '@angular/router';
import { rolesMatchGuard, invitadoGuard } from './shared/auth/role.guard';
import { ROLES_PERSONAL } from './shared/auth/roles';
import { StaffLayoutComponent } from './shared/layout/staff-layout/staff-layout.component';
import { ClienteLayoutComponent } from './shared/layout/cliente-layout/cliente-layout.component';

/**
 * Rutas de la aplicación.
 * - El personal (admin, vendedor, operario) usa el layout con menú lateral.
 * - El cliente usa el layout del portal de compras.
 * Los roles de cada ruta coinciden con la matriz de permisos del backend.
 * Se usa canMatch: si el rol no corresponde, el router prueba la siguiente ruta,
 * por eso /ventas y /servicios existen en los dos layouts.
 */
export const routes: Routes = [
  {
    path: 'login',
    canMatch: [invitadoGuard],
    loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    component: StaffLayoutComponent,
    canMatch: [rolesMatchGuard],
    data: { roles: ROLES_PERSONAL },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'vendedor-dashboard' },
      {
        path: 'vendedor-dashboard',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin', 'vendedor', 'operario'] },
        loadChildren: () => import('./modules/dashboard/vendedor-dashboard/vendedor-dashboard.module').then((m) => m.VendedorDashboardModule),
      },
      {
        path: 'ventas',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin', 'vendedor'] },
        loadChildren: () => import('./modules/ventas/ventas.module').then((m) => m.VentasModule),
      },
      {
        path: 'clientes',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin', 'vendedor', 'operario'] },
        loadChildren: () => import('./modules/clientes/clientes.module').then((m) => m.ClientesModule),
      },
      {
        path: 'productos',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin'] },
        loadChildren: () => import('./modules/productos/productos.module').then((m) => m.ProductosModule),
      },
      {
        path: 'servicios',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin', 'operario'] },
        loadChildren: () => import('./modules/servicios/servicio.module').then((m) => m.ServiciosModule),
      },
      {
        path: 'vendedores',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin'] },
        loadChildren: () => import('./modules/vendedores/vendedores.module').then((m) => m.VendedoresModule),
      },
      {
        path: 'operarios',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin'] },
        loadChildren: () => import('./modules/operarios/operarios.module').then((m) => m.OperariosModule),
      },
      {
        path: 'localidades',
        canMatch: [rolesMatchGuard],
        data: { roles: ['admin'] },
        loadChildren: () => import('./modules/localidades/localidades.module').then((m) => m.LocalidadesModule),
      },
    ],
  },
  {
    path: '',
    component: ClienteLayoutComponent,
    canMatch: [rolesMatchGuard],
    data: { roles: ['cliente'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cliente-dashboard' },
      {
        path: 'cliente-dashboard',
        loadChildren: () => import('./modules/dashboard/cliente-dashboard/cliente-dashboard.module').then((m) => m.ClienteDashboardModule),
      },
      {
        path: 'seleccion-productos',
        loadChildren: () => import('./modules/seleccionProductos/seleccion-productos.module').then((m) => m.SeleccionProductosModule),
      },
      {
        path: 'confirmar-compra',
        loadChildren: () => import('./modules/confirmar-compra/confirmar-compra.module').then((m) => m.ConfirmarCompraModule),
      },
      {
        path: 'servicios',
        loadChildren: () => import('./modules/servicios/servicio.module').then((m) => m.ServiciosModule),
      },
      {
        // "Mis compras": el backend devuelve solo las ventas del cliente logueado
        path: 'ventas',
        loadChildren: () => import('./modules/ventas/ventas.module').then((m) => m.VentasModule),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
