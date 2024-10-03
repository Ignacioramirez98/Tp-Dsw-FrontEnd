import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteDashboardComponent } from './cliente-dashboard.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ClienteDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ClienteDashboardComponent }]) // Configura la ruta para el componente
  ]
})
export class ClienteDashboardModule { }
