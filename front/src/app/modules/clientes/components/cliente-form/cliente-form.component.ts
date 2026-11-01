import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { ClientesService } from '../../cliente.service';
import { LocalidadesService } from '../../../localidades/localidad.service';
import { Cliente } from '../../../../shared/models/cliente.model';
import { Localidad } from '../../../../shared/models/localidad.model';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { MENSAJES_PERSONA, camposPersona } from '../../../../shared/utils/validadores';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  standalone: false,
})
export class ClienteFormComponent extends FormularioBase<Cliente> {
  private readonly fb = inject(FormBuilder);
  private readonly clientes = inject(ClientesService);

  protected readonly recurso = 'cliente';
  readonly rutaListado = '/clientes';
  protected override readonly mensajes = MENSAJES_PERSONA;

  localidades: Localidad[] = [];

  constructor() {
    super();
    inject(LocalidadesService).getLocalidades().subscribe({
      next: ({ data }) => (this.localidades = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre))),
    });
  }

  protected crearFormulario() {
    return this.fb.group({
      ...camposPersona(),
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      razon_social: ['', Validators.maxLength(200)],
      localidadId: [''],
    });
  }

  protected override cargarEnFormulario(cliente: Cliente): void {
    this.form.patchValue({ ...cliente, localidadId: cliente.localidad?._id ?? '' });
  }

  protected obtener$(id: string) {
    return this.clientes.getCliente(id).pipe(map((r) => r.data));
  }

  protected crear$(valor: Cliente) {
    return this.clientes.addCliente(valor);
  }

  protected actualizar$(id: string, valor: Cliente) {
    return this.clientes.updateCliente({ ...valor, _id: id });
  }
}
