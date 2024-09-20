// src/app/modules/operarios/operarios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OperariosListComponent } from './components/operarios-list/operarios-list.component';
import { OperarioDetailComponent } from './components/operario-detail/operario-detail.component';
import { OperarioFormComponent } from './components/operario-form/operario-form.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: OperariosListComponent },
  { path: ':id', component: OperarioDetailComponent },
  { path: 'edit/:id', component: OperarioFormComponent }
];

@NgModule({
  declarations: [
    OperariosListComponent,
    OperarioDetailComponent,
    OperarioFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class OperariosModule { }
