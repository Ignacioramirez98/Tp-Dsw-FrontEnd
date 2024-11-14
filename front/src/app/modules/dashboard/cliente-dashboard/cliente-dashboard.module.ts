import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteDashboardComponent } from './cliente-dashboard.component';
import { FooterComponent } from "../../../shared/components/footer/footer.module.js";
import { HeaderClienteModule } from "../../../shared/components/header-cliente/header-cliente.module.js";

@NgModule({
  declarations: [
    ClienteDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ClienteDashboardComponent }]),
    FooterComponent,
    HeaderClienteModule
]
})
export class ClienteDashboardModule {}
