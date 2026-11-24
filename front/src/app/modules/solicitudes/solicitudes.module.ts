import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SolicitudesListComponent } from './components/solicitudes-list/solicitudes-list.component';
import { SolicitudFormComponent } from './components/solicitud-form/solicitud-form.component';
import { SolicitudDetailComponent } from './components/solicitud-detail/solicitud-detail.component';
import { rolesActivateGuard } from '../../shared/auth/role.guard';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { CampoComponent } from '../../shared/ui/campo.component';

// Este módulo se usa en los dos layouts: "Mis solicitudes" del cliente y "Solicitudes" del personal.
// Pedir un servicio es solo del cliente.
const soloCliente = { canActivate: [rolesActivateGuard], data: { roles: ['cliente'] } };

const routes: Routes = [
  { path: '', component: SolicitudesListComponent },
  { path: 'nueva/:servicioId', component: SolicitudFormComponent, ...soloCliente },
  { path: ':id', component: SolicitudDetailComponent },
];

@NgModule({
  declarations: [SolicitudesListComponent, SolicitudFormComponent, SolicitudDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PageHeaderComponent,
    PaginadorComponent,
    StatusChipComponent,
    CampoComponent,
  ],
})
export class SolicitudesModule {}
