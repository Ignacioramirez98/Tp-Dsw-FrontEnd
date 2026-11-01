import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteDashboardComponent } from './cliente-dashboard.component';

@NgModule({
  declarations: [
    ClienteDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ClienteDashboardComponent }]),
]
})
export class ClienteDashboardModule {}
