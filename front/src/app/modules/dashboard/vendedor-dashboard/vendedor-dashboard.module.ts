import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendedorDashboardComponent } from './vendedor-dashboard.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TablaVentasComponent } from '../../../shared/ui/tabla-ventas.component';

@NgModule({
  declarations: [
    VendedorDashboardComponent
  ],
  imports: [
    CommonModule,
    PageHeaderComponent,
    TablaVentasComponent,
    RouterModule.forChild([{ path: '', component: VendedorDashboardComponent }]),
  ]
})
export class VendedorDashboardModule {}
