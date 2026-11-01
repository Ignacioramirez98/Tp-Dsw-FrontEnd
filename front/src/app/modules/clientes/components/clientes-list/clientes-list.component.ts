import { Component, OnInit, inject } from '@angular/core';
import { ClientesService } from '../../cliente.service';
import { LocalidadesService } from '../../../localidades/localidad.service';
import { Cliente } from '../../../../shared/models/cliente.model';
import { Localidad } from '../../../../shared/models/localidad.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-clientes-list',
  templateUrl: './clientes-list.component.html',
  standalone: false,
})
export class ClientesListComponent extends ListadoBase<Cliente> implements OnInit {
  private readonly servicio = inject(ClientesService);
  private readonly localidadesService = inject(LocalidadesService);
  private readonly rol = inject(AuthService).getRol();
  protected readonly recurso = 'clientes';

  localidades: Localidad[] = [];
  localidadId = '';

  // Permisos según la matriz del backend
  readonly puedeEditar = this.rol === 'admin' || this.rol === 'vendedor';
  readonly puedeEliminar = this.rol === 'admin';

  override ngOnInit(): void {
    super.ngOnInit();
    this.localidadesService.getLocalidades().subscribe({
      next: (r) => (this.localidades = [...(r.data ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre))),
      error: () => (this.localidades = []),
    });
  }

  /** Filtro por localidad: lo resuelve el backend (GET /clientes?localidadId=...). */
  filtrarPorLocalidad(id: string): void {
    this.localidadId = id;
    this.pagina = 1;
    this.recargar();
  }

  protected cargar$() { return this.servicio.getClientes({ localidadId: this.localidadId }); }
  protected eliminar$(id: string) { return this.servicio.deleteCliente(id); }
  protected textoBuscable(c: Cliente) { return `${c.nombre} ${c.apellido} ${c.razon_social} ${c.dni} ${c.mail}`; }
  protected descripcion(c: Cliente) { return `al cliente ${c.nombre} ${c.apellido}`; }
}
