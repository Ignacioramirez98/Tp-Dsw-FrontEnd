import { Component, inject } from '@angular/core';
import { LocalidadesService } from '../../localidad.service';
import { Localidad } from '../../../../shared/models/localidad.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';

@Component({
  selector: 'app-localidades-list',
  templateUrl: './localidades-list.component.html',
  standalone: false,
})
export class LocalidadesListComponent extends ListadoBase<Localidad> {
  private readonly servicio = inject(LocalidadesService);
  protected readonly recurso = 'localidades';

  protected cargar$() { return this.servicio.getLocalidades(); }
  protected eliminar$(id: string) { return this.servicio.deleteLocalidad(id); }
  protected textoBuscable(l: Localidad) { return `${l.nombre} ${l.codigo_postal}`; }
  protected descripcion(l: Localidad) { return `la localidad ${l.nombre}`; }
}
