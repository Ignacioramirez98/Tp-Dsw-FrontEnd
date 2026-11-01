// src/app/modules/productos/productos.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductosListComponent } from './components/productos-list/productos-list.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { CampoComponent } from '../../shared/ui/campo.component';
import { SelectorImagenComponent } from '../../shared/ui/selector-imagen.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';
import { ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar ReactiveFormsModule


// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: ProductosListComponent },
  { path: 'nuevo', component: ProductoFormComponent },
  { path: 'edit/:id', component: ProductoFormComponent }
];

@NgModule({
  declarations: [
    ProductosListComponent,
    ProductoFormComponent
  ],
  imports: [
    CommonModule,
    PageHeaderComponent,
    SelectorImagenComponent,
    CampoComponent,
    PaginadorComponent,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule
]
})
export class ProductosModule { }
