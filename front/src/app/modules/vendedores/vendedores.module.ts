// src/app/modules/vendedores/vendedores.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendedoresListComponent } from './components/vendedores-list/vendedores-list.component';
import { VendedorDetailComponent } from './components/vendedor-detail/vendedor-detail.component';
import { VendedorFormComponent } from './components/vendedor-form/vendedor-form.component';
import { HeaderModule } from '../../shared/components/header/header.module.js';
import { FooterComponent } from '../../shared/components/footer/footer.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: VendedoresListComponent },
  { path: 'nuevo', component: VendedorFormComponent },
  { path: 'edit/:id', component: VendedorFormComponent },
  { path: ':id', component: VendedorDetailComponent },
];

@NgModule({
  declarations: [
    VendedoresListComponent,
    VendedorDetailComponent,
    VendedorFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderModule,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class VendedoresModule { }
