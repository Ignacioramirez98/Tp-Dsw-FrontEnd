// src/app/modules/clientes/clientes.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesListComponent } from './components/clientes-list/clientes-list.component';
import { ClienteDetailComponent } from './components/cliente-detail/cliente-detail.component';
import { ClienteFormComponent } from './components/cliente-form/cliente-form.component';
import { HeaderModule } from '../../shared/components/header/header.module.js';
import { FooterComponent } from '../../shared/components/footer/footer.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: ClientesListComponent },
  { path: 'nuevo', component: ClienteFormComponent },
  { path: 'edit/:id', component: ClienteFormComponent },
  { path: ':id', component: ClienteDetailComponent },
];

@NgModule({
  declarations: [
    ClientesListComponent,
    ClienteDetailComponent,
    ClienteFormComponent
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
export class ClientesModule { }
