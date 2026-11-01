// src/app/modules/operarios/operarios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperariosListComponent } from './components/operarios-list/operarios-list.component';
import { OperarioDetailComponent } from './components/operario-detail/operario-detail.component';
import { OperarioFormComponent } from './components/operario-form/operario-form.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';

// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: OperariosListComponent },
  { path: 'nuevo', component: OperarioFormComponent },
  { path: 'edit/:id', component: OperarioFormComponent },
  { path: ':id', component: OperarioDetailComponent },
];

@NgModule({
  declarations: [
    OperariosListComponent,
    OperarioDetailComponent,
    OperarioFormComponent
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
export class OperariosModule { }
