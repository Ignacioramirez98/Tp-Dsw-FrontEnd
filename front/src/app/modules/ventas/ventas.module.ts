// src/app/modules/ventas/ventas.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { VentasListComponent } from './components/ventas-list/ventas-list.component';
import { VentaDetailComponent } from './components/venta-detail/venta-detail.component';
import { VentaFormComponent } from './components/venta-form/venta-form.component';
import { rolesActivateGuard } from '../../shared/auth/role.guard';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { CampoComponent } from '../../shared/ui/campo.component';

// Este módulo se usa en los dos layouts: personal ("Ventas") y cliente ("Mis compras").
// Alta y edición son solo del personal comercial.
const soloPersonal = { canActivate: [rolesActivateGuard], data: { roles: ['admin', 'vendedor'] } };

const routes: Routes = [
  { path: '', component: VentasListComponent },
  { path: 'nueva', component: VentaFormComponent, ...soloPersonal },
  { path: 'edit/:id', component: VentaFormComponent, ...soloPersonal },
  { path: ':id', component: VentaDetailComponent },
];

@NgModule({
  declarations: [VentasListComponent, VentaDetailComponent, VentaFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PageHeaderComponent,
    PaginadorComponent,
    StatusChipComponent,
    CampoComponent,
  ],
})
export class VentasModule {}
