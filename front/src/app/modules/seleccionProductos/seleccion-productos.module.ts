// src/app/modules/seleccion-productos/seleccion-productos.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SeleccionProductosComponent } from './seleccion-productos.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';

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
    PageHeaderComponent,
    PaginadorComponent
  ]
})
export class SeleccionProductosModule { }
