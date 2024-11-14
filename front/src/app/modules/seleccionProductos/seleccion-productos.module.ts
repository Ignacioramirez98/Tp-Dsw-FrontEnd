// src/app/modules/seleccion-productos/seleccion-productos.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SeleccionProductosComponent } from './seleccion-productos.component.js';
import { HeaderClienteModule } from '../../shared/components/header-cliente/header-cliente.module.js';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { WarningModule } from '../../shared/components/warning/warning.module.js';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: SeleccionProductosComponent }
];

@NgModule({
  declarations: [
    SeleccionProductosComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderClienteModule,
    FooterComponent,
    WarningModule,
    NgxPaginationModule,
    FormsModule
  ]
})
export class SeleccionProductosModule { }
