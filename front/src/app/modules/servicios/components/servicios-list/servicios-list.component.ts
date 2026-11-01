import { Component, inject } from '@angular/core';
import { ServiciosService } from '../../servicio.service';
import { Servicio } from '../../../../shared/models/servicio.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';
import { AuthService } from '../../../../shared/services/auth.service';
import { urlImagen } from '../../../../shared/utils/imagen';

/**
 * Servicios: tabla de gestión para admin/operario y catálogo en tarjetas para el cliente.
 */
@Component({
  selector: 'app-servicios-list',
  templateUrl: './servicios-list.component.html',
  standalone: false,
})
export class ServiciosListComponent extends ListadoBase<Servicio> {
  private readonly servicio = inject(ServiciosService);
  private readonly rol = inject(AuthService).getRol();
  protected readonly recurso = 'servicios';
  readonly urlImagen = urlImagen;

  readonly esCliente = this.rol === 'cliente';
  readonly puedeEliminar = this.rol === 'admin';

  protected cargar$() { return this.servicio.getServicios(); }
  protected eliminar$(id: string) { return this.servicio.deleteServicio(id); }
  protected textoBuscable(s: Servicio) { return `${s.descripcion} ${s.operario?.nombre ?? ''} ${s.operario?.apellido ?? ''}`; }
  protected descripcion(s: Servicio) { return `el servicio "${s.descripcion}"`; }
}
