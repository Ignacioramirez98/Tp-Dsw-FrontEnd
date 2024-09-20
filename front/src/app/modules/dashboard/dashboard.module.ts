// src/app/modules/dashboard/dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component.js';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [
    DashboardComponent  // Declara el componente dentro del módulo
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)  // Importa RouterModule y configura las rutas
  ]
})
export class DashboardModule { }