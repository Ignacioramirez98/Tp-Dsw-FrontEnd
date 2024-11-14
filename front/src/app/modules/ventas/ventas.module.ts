// src/app/modules/ventas/ventas.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VentasListComponent } from './components/ventas-list/ventas-list.component';
import { VentaDetailComponent } from './components/venta-detail/venta-detail.component';
import { VentaFormComponent } from './components/venta-form/venta-form.component';
import { HeaderModule } from '../../shared/components/header/header.module.js';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar ReactiveFormsModule

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: VentasListComponent },
  { path: ':id', component: VentaDetailComponent },
  { path: 'edit/:id', component: VentaFormComponent }
];

@NgModule({
  declarations: [
    VentasListComponent,
    VentaDetailComponent,
    VentaFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderModule,
    FooterComponent,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule
  ]
}) 
export class VentasModule { }
