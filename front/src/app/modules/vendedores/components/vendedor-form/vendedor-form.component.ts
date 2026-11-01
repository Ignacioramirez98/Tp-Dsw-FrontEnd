import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { map } from 'rxjs';
import { VendedoresService } from '../../vendedor.service';
import { Vendedor } from '../../../../shared/models/vendedor.model';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { MENSAJES_PERSONA, camposPersona } from '../../../../shared/utils/validadores';

@Component({
  selector: 'app-vendedor-form',
  templateUrl: './vendedor-form.component.html',
  standalone: false,
})
export class VendedorFormComponent extends FormularioBase<Vendedor> {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(VendedoresService);

  protected readonly recurso = 'vendedor';
  readonly rutaListado = '/vendedores';
  protected override readonly mensajes = MENSAJES_PERSONA;

  protected crearFormulario() {
    // El rol lo asigna el backend ('vendedor') al crear
    return this.fb.group(camposPersona());
  }

  protected obtener$(id: string) {
    return this.servicio.getVendedor(id).pipe(map((r) => r.data));
  }

  protected crear$(valor: Vendedor) {
    return this.servicio.addVendedor(valor);
  }

  protected actualizar$(id: string, valor: Vendedor) {
    return this.servicio.updateVendedor({ ...valor, _id: id });
  }
}
