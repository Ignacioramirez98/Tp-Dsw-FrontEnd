import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmarCompraComponent } from './confirmar-compra.component';
import { RouterModule, Routes } from '@angular/router';
import { WarningModule } from '../../shared/components/warning/warning.module.js';


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
    WarningModule 
  ]
})
export class ConfirmarCompraModule {}
