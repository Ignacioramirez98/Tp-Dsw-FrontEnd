import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteDashboardComponent } from './cliente-dashboard.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';

@NgModule({
  declarations: [
    ClienteDashboardComponent
  ],
  imports: [
    CommonModule,
    PageHeaderComponent,
    StatusChipComponent,
    RouterModule.forChild([{ path: '', component: ClienteDashboardComponent }]),
  ]
})
export class ClienteDashboardModule {}
