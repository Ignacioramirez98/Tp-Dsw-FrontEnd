import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteDashboardComponent } from './cliente-dashboard.component';
import { FooterComponent } from "../../../shared/components/footer/footer.module.js";
import { HeaderModule } from "../../../shared/components/header/header.module";

@NgModule({
  declarations: [
    ClienteDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ClienteDashboardComponent }]),
    FooterComponent,
    HeaderModule
]
})
export class ClienteDashboardModule {}
