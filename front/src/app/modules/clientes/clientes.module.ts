// src/app/modules/clientes/clientes.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClientesListComponent } from './components/clientes-list/clientes-list.component';
import { ClienteDetailComponent } from './components/cliente-detail/cliente-detail.component';
import { ClienteFormComponent } from './components/cliente-form/cliente-form.component.js';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: ClientesListComponent },
  { path: ':id', component: ClienteDetailComponent },
  { path: 'edit/:id', component: ClienteFormComponent }
];

@NgModule({
  declarations: [
    ClienteDetailComponent,
    ClienteFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ClientesModule { }
