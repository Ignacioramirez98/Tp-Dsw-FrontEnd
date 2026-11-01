import { Component, inject } from '@angular/core';
import { OperariosService } from '../../operario.service';
import { Operario } from '../../../../shared/models/operario.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';

@Component({
  selector: 'app-operarios-list',
  templateUrl: './operarios-list.component.html',
  standalone: false,
})
export class OperariosListComponent extends ListadoBase<Operario> {
  private readonly servicio = inject(OperariosService);
  protected readonly recurso = 'operarios';

  protected cargar$() { return this.servicio.getOperarios(); }
  protected eliminar$(id: string) { return this.servicio.deleteOperario(id); }
  protected textoBuscable(p: Operario) { return `${p.nombre} ${p.apellido} ${p.dni} ${p.mail}`; }
  protected descripcion(p: Operario) { return `a ${p.nombre} ${p.apellido}`; }
}
