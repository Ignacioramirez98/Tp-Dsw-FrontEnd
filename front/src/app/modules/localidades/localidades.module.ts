// src/app/modules/localidades/localidades.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocalidadesListComponent } from './components/localidades-list/localidades-list.component';
import { LocalidadDetailComponent } from './components/localidad-detail/localidad-detail.component';
import { LocalidadFormComponent } from './components/localidad-form/localidad-form.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: LocalidadesListComponent },
  { path: 'nuevo', component: LocalidadFormComponent },
  { path: 'edit/:id', component: LocalidadFormComponent },
  { path: ':id', component: LocalidadDetailComponent },
];

@NgModule({
  declarations: [
    LocalidadesListComponent,
    LocalidadDetailComponent,
    LocalidadFormComponent
  ],
  imports: [
    CommonModule,
    PageHeaderComponent,
    PaginadorComponent,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LocalidadesModule { }
