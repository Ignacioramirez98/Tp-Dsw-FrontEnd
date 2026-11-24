import { Component, inject } from '@angular/core';
import { EMPTY } from 'rxjs';
import { SolicitudesService } from '../../solicitud.service';
import { EstadoSolicitud, FiltrosSolicitud, SolicitudServicio } from '../../../../shared/models/solicitud-servicio.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';
import { AuthService } from '../../../../shared/services/auth.service';

/**
 * Listado de solicitudes de servicio. Lo usan el cliente ("Mis solicitudes") y el personal:
 * el backend devuelve a cada rol solo las que le corresponden. El estado lo filtra el backend.
 */
@Component({
  selector: 'app-solicitudes-list',
  templateUrl: './solicitudes-list.component.html',
  standalone: false,
})
export class SolicitudesListComponent extends ListadoBase<SolicitudServicio> {
  private readonly solicitudes = inject(SolicitudesService);
  private readonly rol = inject(AuthService).getRol();
  protected readonly recurso = 'solicitudes';

  readonly esCliente = this.rol === 'cliente';

  readonly opcionesEstado: { valor: EstadoSolicitud | ''; etiqueta: string }[] = [
    { valor: '', etiqueta: 'Todas' },
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'aceptada', etiqueta: 'Aceptadas' },
    { valor: 'finalizada', etiqueta: 'Finalizadas' },
    { valor: 'cancelada', etiqueta: 'Canceladas' },
  ];

  filtros: FiltrosSolicitud = { estado: '' };

  get hayFiltros(): boolean {
    return !!(this.busqueda || this.filtros.estado);
  }

  filtrarPorEstado(estado: string): void {
    this.filtros = { ...this.filtros, estado };
    this.pagina = 1;
    this.recargar();
  }

  limpiarFiltros(buscador: HTMLInputElement): void {
    buscador.value = '';
    this.busqueda = '';
    this.filtros = { estado: '' };
    this.pagina = 1;
    this.recargar();
  }

  nombreCliente(s: SolicitudServicio): string {
    return s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido}` : 'Cliente eliminado';
  }

  nombreOperario(s: SolicitudServicio): string {
    return s.operario ? `${s.operario.nombre} ${s.operario.apellido}` : 'Sin asignar';
  }

  /** Importe a mostrar: el final si el trabajo ya se hizo, si no el estimado. */
  importe(s: SolicitudServicio): number {
    return s.estado === 'finalizada' && s.importeFinal != null ? s.importeFinal : s.importeEstimado;
  }

  protected cargar$() { return this.solicitudes.getSolicitudes(this.filtros); }
  // Las solicitudes no se eliminan: se cancelan desde el detalle
  protected eliminar$(_id: string) { return EMPTY; }
  protected textoBuscable(s: SolicitudServicio) {
    return `${s.servicio?.descripcion ?? ''} ${this.nombreCliente(s)} ${this.nombreOperario(s)}`;
  }
  protected descripcion(s: SolicitudServicio) { return `la solicitud de "${s.servicio?.descripcion ?? 'servicio'}"`; }
}
