import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiciosService } from '../../../servicios/servicio.service';
import { SolicitudesService } from '../../solicitud.service';
import { Servicio } from '../../../../shared/models/servicio.model';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { mensajeDeError } from '../../../../shared/utils/validadores';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';
import { hoyISO, importeDeHoras } from '../../../../shared/utils/solicitud';

/** El cliente pide un servicio: indica las horas que estima, cuándo lo prefiere y alguna observación. */
@Component({
  selector: 'app-solicitud-form',
  templateUrl: './solicitud-form.component.html',
  standalone: false,
})
export class SolicitudFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicios = inject(ServiciosService);
  private readonly solicitudes = inject(SolicitudesService);
  private readonly notificaciones = inject(NotificacionService);

  readonly hoy = hoyISO();
  readonly mensajes: Record<string, Record<string, string>> = {
    horasEstimadas: {
      required: 'Indicá cuántas horas estimás que lleva el trabajo.',
      min: 'Tiene que ser al menos media hora (0,5).',
      max: 'No puede superar las 1000 horas.',
    },
    observaciones: { maxlength: 'Máximo 500 caracteres.' },
  };

  readonly form = this.fb.nonNullable.group({
    horasEstimadas: [null as number | null, [Validators.required, Validators.min(0.5), Validators.max(1000)]],
    fechaPreferida: [''],
    observaciones: ['', [Validators.maxLength(500)]],
  });

  servicio: Servicio | null = null;
  cargando = true;
  error = '';
  enviando = false;
  errorServidor = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const servicioId = this.route.snapshot.paramMap.get('servicioId')!;
    this.cargando = true;
    this.error = '';
    this.servicios.getServicio(servicioId).subscribe({
      next: (servicio) => {
        this.servicio = servicio;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.status === 404 ? 'El servicio no existe.' : mensajeDeErrorHttp(err, 'No se pudo cargar el servicio.');
        this.cargando = false;
      },
    });
  }

  /** Importe estimado con las horas que va escribiendo el cliente. */
  get importeEstimado(): number {
    return this.servicio ? importeDeHoras(this.form.controls.horasEstimadas.value, this.servicio.importe_por_hora) : 0;
  }

  /** Mensaje de error de un campo, solo si el usuario ya lo tocó. */
  errorDe(campo: 'horasEstimadas' | 'fechaPreferida' | 'observaciones'): string | null {
    const control = this.form.controls[campo];
    if (!control.errors || !(control.touched || control.dirty)) return null;
    return mensajeDeError(control.errors, this.mensajes[campo]);
  }

  enviar(): void {
    if (this.enviando || !this.servicio) return;
    const { horasEstimadas, fechaPreferida, observaciones } = this.form.getRawValue();
    // La fecha preferida es opcional, pero si se escribe a mano no puede ser anterior a hoy
    if (fechaPreferida && fechaPreferida < this.hoy) {
      this.form.controls.fechaPreferida.setErrors({ pasada: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.errorServidor = '';
    this.solicitudes.crear({
      servicioId: this.servicio._id,
      horasEstimadas: Number(horasEstimadas),
      fechaPreferida: fechaPreferida || null,
      observaciones: observaciones.trim() || null,
    }).subscribe({
      next: ({ data }) => {
        this.notificaciones.exito('Enviamos tu solicitud. Un operario la revisa y la acepta.');
        this.router.navigate(['/solicitudes-servicio', data._id]);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando = false;
        this.errorServidor = mensajeDeErrorHttp(err, 'No se pudo enviar la solicitud. Intentá de nuevo.');
      },
    });
  }
}
