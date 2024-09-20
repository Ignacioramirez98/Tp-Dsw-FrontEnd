// src/app/modules/localidades/localidades.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LocalidadesListComponent } from './components/localidades-list/localidades-list.component';
import { LocalidadDetailComponent } from './components/localidad-detail/localidad-detail.component';
import { LocalidadFormComponent } from './components/localidad-form/localidad-form.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: LocalidadesListComponent },
  { path: ':id', component: LocalidadDetailComponent },
  { path: 'edit/:id', component: LocalidadFormComponent }
];

@NgModule({
  declarations: [
    LocalidadesListComponent,
    LocalidadDetailComponent,
    LocalidadFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LocalidadesModule { }
