import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmarCompraComponent } from './confirmar-compra.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module.js'; // Importa cualquier módulo compartido que necesites
import { HeaderModule } from '../../shared/components/header/header.module.js';
import { FooterComponent } from '../../shared/components/footer/footer.component';
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
    SharedModule,
    HeaderModule,
    FooterComponent,
    WarningModule 
  ]
})
export class ConfirmarCompraModule {}
