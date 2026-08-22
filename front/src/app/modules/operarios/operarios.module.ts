// src/app/modules/operarios/operarios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperariosListComponent } from './components/operarios-list/operarios-list.component';
import { OperarioDetailComponent } from './components/operario-detail/operario-detail.component';
import { OperarioFormComponent } from './components/operario-form/operario-form.component';
import { HeaderModule } from '../../shared/components/header/header.module.js';
import { FooterComponent } from '../../shared/components/footer/footer.component';

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
    RouterModule.forChild(routes),
    HeaderModule,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class OperariosModule { }
