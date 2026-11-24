import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SolicitudesService } from '../../solicitud.service';
import { SolicitudServicio } from '../../../../shared/models/solicitud-servicio.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfirmacionService } from '../../../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';

interface Paso {
  titulo: string;
  detalle: string;
  estado: 'hecho' | 'actual' | 'futuro';
}

/** Detalle de una solicitud de servicio. El cliente puede cancelarla mientras está pendiente. */
@Component({
  selector: 'app-solicitud-detail',
  templateUrl: './solicitud-detail.component.html',
  standalone: false,
})
export class SolicitudDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly solicitudes = inject(SolicitudesService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly rol = inject(AuthService).getRol();

  readonly esCliente = this.rol === 'cliente';

  solicitud: SolicitudServicio | null = null;
  cargando = true;
  error = '';
  procesando = false;

  /** El cliente cancela solo lo pendiente; después, la gestiona la empresa. */
  get puedeCancelar(): boolean {
    return this.esCliente && this.solicitud?.estado === 'pendiente';
  }

  get pasos(): Paso[] {
    const s = this.solicitud;
    if (!s) return [];
    const orden = ['pendiente', 'aceptada', 'finalizada'];
    const indice = orden.indexOf(s.estado);
    const fecha = (f?: string | Date | null) => (f ? new Date(f).toLocaleDateString('es-AR') : '');
    const estadoDe = (i: number): Paso['estado'] => (i <= indice ? 'hecho' : i === indice + 1 ? 'actual' : 'futuro');
    return [
      { titulo: 'Solicitud enviada', detalle: fecha(s.fechaSolicitud), estado: 'hecho' },
      {
        titulo: indice >= 1 ? 'Aceptada' : 'Aceptación',
        detalle: indice >= 1 ? fecha(s.fechaAceptacion) : 'Un operario se hace cargo',
        estado: estadoDe(1),
      },
      {
        titulo: indice >= 2 ? 'Trabajo finalizado' : 'Trabajo',
        detalle: indice >= 2 ? fecha(s.fechaFinalizacion) : 'Se realiza el servicio',
        estado: estadoDe(2),
      },
    ];
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargando = true;
    this.solicitudes.getSolicitud(id).subscribe({
      next: ({ data }) => {
        this.solicitud = data;
        this.error = '';
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.status === 404
          ? 'La solicitud no existe o no tenés acceso a ella.'
          : mensajeDeErrorHttp(err, 'No se pudo cargar la solicitud.');
        this.cargando = false;
      },
    });
  }

  cancelar(): void {
    const solicitud = this.solicitud;
    if (!solicitud) return;
    this.confirmacion
      .confirmar({
        titulo: 'Cancelar solicitud',
        mensaje: '¿Cancelar esta solicitud de servicio? No se puede deshacer.',
        textoConfirmar: 'Cancelar solicitud',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.procesando = true;
        this.solicitudes.cancelar(solicitud._id).subscribe({
          next: ({ data }) => {
            this.solicitud = data;
            this.procesando = false;
            this.notificaciones.exito('Solicitud cancelada.');
          },
          error: (err: HttpErrorResponse) => {
            this.procesando = false;
            // 409: la solicitud ya cambió de estado (el backend lo explica). El 403 ya lo avisa el interceptor.
            if (err.status !== 403) this.notificaciones.error(mensajeDeErrorHttp(err, 'No se pudo cancelar la solicitud.'));
            if (err.status === 409) this.cargar();
          },
        });
      });
  }
}
