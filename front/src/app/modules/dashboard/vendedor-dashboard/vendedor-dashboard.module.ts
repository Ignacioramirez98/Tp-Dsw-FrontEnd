import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendedorDashboardComponent } from './vendedor-dashboard.component';


@NgModule({
  declarations: [
    VendedorDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: VendedorDashboardComponent }]),
  ]
})
export class VendedorDashboardModule {}