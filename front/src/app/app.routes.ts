import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/services/auth.guard.js';  // Importar el AuthGuard

export const routes: Routes = [
  { path: 'vendedores', loadChildren: () => import('./modules/vendedores/vendedores.module').then(m => m.VendedoresModule) },
  { path: 'clientes', loadChildren: () => import('./modules/clientes/clientes.module').then(m => m.ClientesModule) },
  { path: 'localidades', loadChildren: () => import('./modules/localidades/localidades.module').then(m => m.LocalidadesModule) },
  { path: 'ventas', loadChildren: () => import('./modules/ventas/ventas.module').then(m => m.VentasModule) },
  { path: 'productos', loadChildren: () => import('./modules/productos/productos.module').then(m => m.ProductosModule) },
  { path: 'servicios', loadChildren: () => import('./modules/servicios/servicio.module').then(m => m.ServiciosModule) },
  { path: 'operarios', loadChildren: () => import('./modules/operarios/operarios.module').then(m => m.OperariosModule) },
  { path: 'cliente-dashboard', loadChildren: () => import('./modules/dashboard/cliente-dashboard/cliente-dashboard.module').then(m => m.ClienteDashboardModule), canActivate: [AuthGuard]  },
  { path: 'vendedor-dashboard', loadChildren: () => import('./modules/dashboard/vendedor-dashboard/vendedor-dashboard.module.js').then(m => m.VendedorDashboardModule) },
  { path: 'seleccion-productos', loadChildren: () => import('./modules/seleccionProductos/seleccion-productos.module.js').then(m => m.SeleccionProductosModule) },
  { path: 'login', loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule) },
  { path: 'confirmar-compra', loadChildren: () => import('./modules/confirmar-compra/confirmar-compra.module.js').then(m => m.ConfirmarCompraModule) },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
