import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendedorDashboardComponent } from './vendedor-dashboard.component';
import { FooterComponent } from "../../../shared/components/footer/footer.module.js";
import { HeaderModule } from '../../../shared/components/header/header.module.js';


@NgModule({
  declarations: [
    VendedorDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: VendedorDashboardComponent }]),
    HeaderModule,
    FooterComponent
  ]
})
export class VendedorDashboardModule {}