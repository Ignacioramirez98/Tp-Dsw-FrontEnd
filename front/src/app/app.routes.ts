import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'vendedores', loadChildren: () => import('./modules/vendedores/vendedores.module').then(m => m.VendedoresModule) },
  { path: 'clientes', loadChildren: () => import('./modules/clientes/clientes.module').then(m => m.ClientesModule) },
  { path: 'localidades', loadChildren: () => import('./modules/localidades/localidades.module').then(m => m.LocalidadesModule) },
  { path: 'ventas', loadChildren: () => import('./modules/ventas/ventas.module').then(m => m.VentasModule) },
  { path: 'productos', loadChildren: () => import('./modules/productos/productos.module').then(m => m.ProductosModule) },
  { path: 'servicios', loadChildren: () => import('./modules/servicios/servicio.module').then(m => m.ServiciosModule) },
  { path: 'operarios', loadChildren: () => import('./modules/operarios/operarios.module').then(m => m.OperariosModule) },
  //{ path: 'configuracion', loadChildren: () => import('./modules/configuracion/configuracion.module').then(m => m.ConfiguracionModule) },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
