import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { map } from 'rxjs';
import { OperariosService } from '../../operario.service';
import { Operario } from '../../../../shared/models/operario.model';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { MENSAJES_PERSONA, camposPersona } from '../../../../shared/utils/validadores';

@Component({
  selector: 'app-operario-form',
  templateUrl: './operario-form.component.html',
  standalone: false,
})
export class OperarioFormComponent extends FormularioBase<Operario> {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(OperariosService);

  protected readonly recurso = 'operario';
  readonly rutaListado = '/operarios';
  protected override readonly mensajes = MENSAJES_PERSONA;

  protected crearFormulario() {
    // El rol lo asigna el backend ('operario') al crear
    return this.fb.group(camposPersona());
  }

  protected obtener$(id: string) {
    return this.servicio.getOperario(id).pipe(map((r) => r.data));
  }

  protected crear$(valor: Operario) {
    return this.servicio.addOperario(valor);
  }

  protected actualizar$(id: string, valor: Operario) {
    return this.servicio.updateOperario({ ...valor, _id: id });
  }
}
