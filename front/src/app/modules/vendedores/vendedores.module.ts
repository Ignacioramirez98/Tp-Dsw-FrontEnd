// src/app/modules/vendedores/vendedores.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VendedoresListComponent } from './components/vendedores-list/vendedores-list.component';
import { VendedorDetailComponent } from './components/vendedor-detail/vendedor-detail.component';
import { VendedorFormComponent } from './components/vendedor-form/vendedor-form.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: VendedoresListComponent },
  { path: ':id', component: VendedorDetailComponent },
  { path: 'edit/:id', component: VendedorFormComponent }
];

@NgModule({
  declarations: [
    VendedoresListComponent,
    VendedorDetailComponent,
    VendedorFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class VendedoresModule { }
