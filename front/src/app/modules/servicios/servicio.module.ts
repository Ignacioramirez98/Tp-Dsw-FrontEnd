// src/app/modules/Servicios/Servicios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ServiciosListComponent } from './components/servicios-list/servicios-list.component';
import { ServicioDetailComponent } from './components/servicio-detail/servicio-detail.component';
import { ServicioFormComponent } from './components/servicio-form/servicio-form.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar ReactiveFormsModule
import { rolesActivateGuard } from '../../shared/auth/role.guard';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';


// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: ServiciosListComponent },
  { path: 'nuevo', component: ServicioFormComponent, canActivate: [rolesActivateGuard], data: { roles: ['admin', 'operario'] } },
  { path: 'edit/:id', component: ServicioFormComponent, canActivate: [rolesActivateGuard], data: { roles: ['admin', 'operario'] } }
];

@NgModule({
  declarations: [
    ServiciosListComponent,
    ServicioDetailComponent,
    ServicioFormComponent
  ],
  imports: [
    CommonModule,
    PageHeaderComponent,
    PaginadorComponent,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule
]
})
export class ServiciosModule { }
