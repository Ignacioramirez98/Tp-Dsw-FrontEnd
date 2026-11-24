import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SolicitudesService } from '../../solicitud.service';
import { OperariosService } from '../../../operarios/operario.service';
import { SolicitudServicio } from '../../../../shared/models/solicitud-servicio.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfirmacionService } from '../../../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';
import { AceptarSolicitudDialogComponent, ResultadoAceptar } from '../aceptar-solicitud-dialog/aceptar-solicitud-dialog.component';
import { FinalizarSolicitudDialogComponent, ResultadoFinalizar } from '../finalizar-solicitud-dialog/finalizar-solicitud-dialog.component';
import { CancelarSolicitudDialogComponent, ResultadoCancelarSolicitud } from '../cancelar-solicitud-dialog/cancelar-solicitud-dialog.component';

interface Paso {
  titulo: string;
  detalle: string;
  estado: 'hecho' | 'actual' | 'futuro';
}

/**
 * Detalle de una solicitud de servicio y acciones del CUU Solicitar Servicio.
 * El cliente cancela mientras está pendiente; el operario (o el admin) acepta, finaliza y cancela.
 */
@Component({
  selector: 'app-solicitud-detail',
  templateUrl: './solicitud-detail.component.html',
  standalone: false,
})
export class SolicitudDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly solicitudes = inject(SolicitudesService);
  private readonly operarios = inject(OperariosService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly rol = inject(AuthService).getRol();

  readonly esCliente = this.rol === 'cliente';
  readonly esPersonal = this.rol === 'admin' || this.rol === 'operario';

  solicitud: SolicitudServicio | null = null;
  cargando = true;
  error = '';
  procesando = false;

  get puedeAceptar(): boolean {
    return this.esPersonal && this.solicitud?.estado === 'pendiente';
  }

  get puedeFinalizar(): boolean {
    return this.esPersonal && this.solicitud?.estado === 'aceptada';
  }

  /** El cliente cancela solo lo pendiente; el personal también lo ya aceptado. */
  get puedeCancelar(): boolean {
    const estado = this.solicitud?.estado;
    return this.esCliente ? estado === 'pendiente' : this.esPersonal && (estado === 'pendiente' || estado === 'aceptada');
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

  aceptar(): void {
    const solicitud = this.solicitud;
    if (!solicitud) return;

    // El admin elige el operario si la solicitud no tiene responsable; un operario acepta a su nombre
    if (this.rol === 'admin' && !solicitud.operario) {
      this.operarios.getOperarios().subscribe({
        next: ({ data }) => {
          this.dialog
            .open<AceptarSolicitudDialogComponent, unknown, ResultadoAceptar>(AceptarSolicitudDialogComponent, {
              data: { operarios: data },
              width: '440px',
              maxWidth: '94vw',
              autoFocus: 'dialog',
              ariaLabelledBy: 'aceptar-titulo',
            })
            .afterClosed()
            .subscribe((resultado) => {
              if (resultado) this.ejecutar(this.solicitudes.aceptar(solicitud._id, resultado.operarioId), 'La solicitud fue aceptada.');
            });
        },
        error: (err: HttpErrorResponse) => {
          // Sin la lista de operarios el admin no puede elegir: no se abre el diálogo vacío. El 403 ya lo avisa el interceptor.
          if (err.status !== 403) this.notificaciones.error(mensajeDeErrorHttp(err, 'No se pudieron cargar los operarios. Probá de nuevo.'));
        },
      });
      return;
    }

    this.confirmacion
      .confirmar({
        titulo: 'Aceptar solicitud',
        mensaje: this.rol === 'operario'
          ? 'Te hacés cargo de este trabajo. ¿Aceptar la solicitud?'
          : '¿Aceptar la solicitud? Queda a cargo del operario del servicio.',
        textoConfirmar: 'Aceptar solicitud',
      })
      .subscribe((ok) => {
        if (ok) this.ejecutar(this.solicitudes.aceptar(solicitud._id), 'La solicitud fue aceptada.');
      });
  }

  finalizar(): void {
    const solicitud = this.solicitud;
    if (!solicitud) return;
    this.dialog
      .open<FinalizarSolicitudDialogComponent, unknown, ResultadoFinalizar>(FinalizarSolicitudDialogComponent, {
        data: { solicitud },
        width: '440px',
        maxWidth: '94vw',
        autoFocus: 'dialog',
        ariaLabelledBy: 'finalizar-titulo',
      })
      .afterClosed()
      .subscribe((resultado) => {
        if (resultado) this.ejecutar(this.solicitudes.finalizar(solicitud._id, resultado.horasReales), 'Trabajo finalizado.');
      });
  }

  cancelar(): void {
    const solicitud = this.solicitud;
    if (!solicitud) return;

    if (this.esCliente) {
      this.confirmacion
        .confirmar({
          titulo: 'Cancelar solicitud',
          mensaje: '¿Cancelar esta solicitud de servicio? No se puede deshacer.',
          textoConfirmar: 'Cancelar solicitud',
          peligro: true,
        })
        .subscribe((ok) => {
          if (ok) this.ejecutar(this.solicitudes.cancelar(solicitud._id), 'Solicitud cancelada.');
        });
      return;
    }

    this.dialog
      .open<CancelarSolicitudDialogComponent, unknown, ResultadoCancelarSolicitud>(CancelarSolicitudDialogComponent, {
        data: { servicio: solicitud.servicio?.descripcion ?? 'Servicio' },
        width: '440px',
        maxWidth: '94vw',
        autoFocus: 'dialog',
        ariaLabelledBy: 'cancelar-solicitud-titulo',
      })
      .afterClosed()
      .subscribe((resultado) => {
        if (resultado) this.ejecutar(this.solicitudes.cancelar(solicitud._id, resultado.motivo), 'Solicitud cancelada.');
      });
  }

  private ejecutar(accion$: Observable<{ data: SolicitudServicio }>, mensaje: string): void {
    this.procesando = true;
    accion$.subscribe({
      next: ({ data }) => {
        this.solicitud = data;
        this.procesando = false;
        this.notificaciones.exito(mensaje);
      },
      error: (err: HttpErrorResponse) => {
        this.procesando = false;
        // 409: la solicitud ya cambió de estado (el backend lo explica). El 403 ya lo avisa el interceptor.
        if (err.status !== 403) this.notificaciones.error(mensajeDeErrorHttp(err, 'No se pudo completar la operación.'));
        if (err.status === 409) this.cargar();
      },
    });
  }
}
