// src/app/modules/Servicios/Servicios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ServiciosListComponent } from './components/servicios-list/servicios-list.component';
import { ServicioDetailComponent } from './components/servicio-detail/servicio-detail.component';
import { ServicioFormComponent } from './components/servicio-form/servicio-form.component';
import { HeaderModule } from '../../shared/components/header/header.module.js';
import { HeaderClienteModule } from '../../shared/components/header-cliente/header-cliente.module.js';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar ReactiveFormsModule
import { AuthGuard } from '../../shared/services/auth.guard';


// Define las rutas para el módulo
const routes: Routes = [
  { path: '', component: ServiciosListComponent },
  { path: 'nuevo', component: ServicioFormComponent, canActivate: [AuthGuard], data: { roles: ['admin', 'operario'] } },
  { path: 'edit/:id', component: ServicioFormComponent, canActivate: [AuthGuard], data: { roles: ['admin', 'operario'] } }
];

@NgModule({
  declarations: [
    ServiciosListComponent,
    ServicioDetailComponent,
    ServicioFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderModule,
    HeaderClienteModule,
    FooterComponent,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule
]
})
export class ServiciosModule { }
