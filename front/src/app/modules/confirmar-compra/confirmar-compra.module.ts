import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmarCompraComponent } from './confirmar-compra.component';
import { RouterModule, Routes } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';


const routes: Routes = [
  {
    path: '',
    component: ConfirmarCompraComponent
  }
];

@NgModule({
  declarations: [ConfirmarCompraComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PageHeaderComponent
  ]
})
export class ConfirmarCompraModule {}
