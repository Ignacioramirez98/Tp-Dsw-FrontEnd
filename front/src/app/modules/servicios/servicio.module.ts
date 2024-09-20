// src/app/modules/servicios/servicios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ServiciosListComponent } from './components/servicios-list/servicios-list.component';
import { ServicioDetailComponent } from './components/servicio-detail/servicio-detail.component';
import { ServicioFormComponent } from './components/servicio-form/servicio-form.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: ServiciosListComponent },
  { path: ':id', component: ServicioDetailComponent },
  { path: 'edit/:id', component: ServicioFormComponent }
];

@NgModule({
  declarations: [
    ServiciosListComponent,
    ServicioDetailComponent,
    ServicioFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ServiciosModule { }
