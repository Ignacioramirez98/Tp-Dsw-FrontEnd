import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { LocalidadesService } from '../../localidad.service';
import { Localidad } from '../../../../shared/models/localidad.model';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { Validadores } from '../../../../shared/utils/validadores';

@Component({
  selector: 'app-localidad-form',
  templateUrl: './localidad-form.component.html',
  standalone: false,
})
export class LocalidadFormComponent extends FormularioBase<Localidad> {
  private readonly fb = inject(FormBuilder);
  private readonly localidades = inject(LocalidadesService);

  protected readonly recurso = 'localidad';
  protected override readonly genero = 'a';
  readonly rutaListado = '/localidades';
  protected override readonly mensajes = {
    codigo_postal: { pattern: 'Ingresá 4 dígitos (2000) o el CPA completo (S2000ABC).' },
  };

  protected crearFormulario() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      codigo_postal: ['', [Validators.required, Validadores.codigoPostal]],
    });
  }

  protected obtener$(id: string) {
    return this.localidades.getLocalidad(id).pipe(map((r) => r.data));
  }

  protected crear$(valor: Localidad) {
    return this.localidades.addLocalidad(valor);
  }

  protected actualizar$(id: string, valor: Localidad) {
    return this.localidades.updateLocalidad({ ...valor, _id: id });
  }
}
