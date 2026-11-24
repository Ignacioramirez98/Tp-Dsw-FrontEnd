// src/app/modules/usuarios/usuarios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosListComponent } from './components/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './components/usuario-form/usuario-form.component';
import { CampoComponent } from '../../shared/ui/campo.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';

// Solo el admin llega acá (lo controla la ruta en app.routes.ts)
const routes: Routes = [
  { path: '', component: UsuariosListComponent },
  { path: 'nuevo', component: UsuarioFormComponent },
  { path: 'edit/:id', component: UsuarioFormComponent },
];

@NgModule({
  declarations: [UsuariosListComponent, UsuarioFormComponent],
  imports: [
    CommonModule,
    PageHeaderComponent,
    CampoComponent,
    PaginadorComponent,
    StatusChipComponent,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class UsuariosModule {}
