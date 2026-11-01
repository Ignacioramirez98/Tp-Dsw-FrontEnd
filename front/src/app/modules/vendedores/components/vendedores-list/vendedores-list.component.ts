import { Component, inject } from '@angular/core';
import { VendedoresService } from '../../vendedor.service';
import { Vendedor } from '../../../../shared/models/vendedor.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';

@Component({
  selector: 'app-vendedores-list',
  templateUrl: './vendedores-list.component.html',
  standalone: false,
})
export class VendedoresListComponent extends ListadoBase<Vendedor> {
  private readonly servicio = inject(VendedoresService);
  protected readonly recurso = 'vendedores';

  protected cargar$() { return this.servicio.getVendedores(); }
  protected eliminar$(id: string) { return this.servicio.deleteVendedor(id); }
  protected textoBuscable(p: Vendedor) { return `${p.nombre} ${p.apellido} ${p.dni} ${p.mail}`; }
  protected descripcion(p: Vendedor) { return `a ${p.nombre} ${p.apellido}`; }
}
