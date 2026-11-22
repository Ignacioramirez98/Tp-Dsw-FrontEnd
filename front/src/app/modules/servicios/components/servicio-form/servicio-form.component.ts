import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ServiciosService } from '../../servicio.service';
import { OperariosService } from '../../../operarios/operario.service';
import { Servicio } from '../../../../shared/models/servicio.model';
import { Operario } from '../../../../shared/models/operario.model';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { urlImagen } from '../../../../shared/utils/imagen';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.component.html',
  standalone: false,
})
export class ServicioFormComponent extends FormularioBase<Servicio> {
  private readonly fb = inject(FormBuilder);
  private readonly servicios = inject(ServiciosService);

  protected readonly recurso = 'servicio';
  readonly rutaListado = '/servicios';
  protected override readonly mensajes = {
    importe_por_hora: { min: 'El precio por hora tiene que ser mayor a $ 0.' },
  };

  operarios: Operario[] = [];
  /** Aviso bajo el campo si no se pudieron traer los operarios (el campo es opcional). */
  errorOperarios = '';
  imagen: File | null = null;
  imagenActual: string | null = null;

  constructor() {
    super();
    inject(OperariosService).getOperarios().subscribe({
      next: ({ data }) => (this.operarios = [...data].sort((a, b) => a.apellido.localeCompare(b.apellido))),
      error: (err: HttpErrorResponse) => {
        this.errorOperarios = 'No se pudieron cargar los operarios. Podés guardar el servicio sin asignar uno.';
        // El 403 ya lo avisa el interceptor
        if (err.status !== 403) this.notificaciones.error(mensajeDeErrorHttp(err, 'No se pudieron cargar los operarios.'));
      },
    });
  }

  protected crearFormulario() {
    return this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      importe_por_hora: [null as number | null, [Validators.required, Validators.min(0.01)]],
      operarioId: [''],
    });
  }

  protected override cargarEnFormulario(servicio: Servicio): void {
    this.form.patchValue({ ...servicio, operarioId: servicio.operario?._id ?? '' });
    this.imagenActual = urlImagen(servicio.imagenUrl);
  }

  /** Se envía como multipart para poder adjuntar la imagen. */
  protected override valorParaEnviar() {
    const datos = new FormData();
    for (const [clave, valor] of Object.entries(this.form.getRawValue())) {
      datos.append(clave, String(valor ?? ''));
    }
    if (this.imagen) datos.append('imagen', this.imagen);
    return datos as unknown as Record<string, unknown>;
  }

  protected obtener$(id: string) {
    return this.servicios.getServicio(id);
  }

  protected crear$(datos: FormData) {
    return this.servicios.crearServicio(datos);
  }

  protected actualizar$(id: string, datos: FormData) {
    return this.servicios.updateServicio(id, datos);
  }
}
