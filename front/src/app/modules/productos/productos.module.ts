// src/app/modules/productos/productos.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductosListComponent } from './components/productos-list/productos-list.component';
import { ProductoDetailComponent } from './components/producto-detail/producto-detail.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { HeaderModule } from '../../shared/components/header/header.module.js';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { NgxPaginationModule } from 'ngx-pagination';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: ProductosListComponent },
  { path: ':id', component: ProductoDetailComponent },
  { path: 'edit/:id', component: ProductoFormComponent }
];

@NgModule({
  declarations: [
    ProductosListComponent,
    ProductoDetailComponent,
    ProductoFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderModule,
    FooterComponent,
    NgxPaginationModule
]
})
export class ProductosModule { }
