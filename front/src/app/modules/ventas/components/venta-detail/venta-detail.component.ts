import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { VentasService } from '../../ventas.service';
import { VendedoresService } from '../../../vendedores/vendedor.service';
import { FacturasService } from '../../../facturas/factura.service';
import { RespuestaVenta, Venta } from '../../../../shared/models/venta.model';
import { Vendedor } from '../../../../shared/models/vendedor.model';
import { Factura } from '../../../../shared/models/factura.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfirmacionService } from '../../../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';
import { avisoDeMail, totalVenta } from '../../../../shared/utils/venta';
import { ConcretarVentaDialogComponent, ResultadoConcretar } from '../concretar-venta-dialog/concretar-venta-dialog.component';

interface Paso {
  titulo: string;
  detalle: string;
  estado: 'hecho' | 'actual' | 'futuro';
}

/** Detalle completo de la venta y acciones de los CUU Concretar Venta (concretar / cancelar) y Realizar facturación (facturar). */
@Component({
  selector: 'app-venta-detail',
  templateUrl: './venta-detail.component.html',
  standalone: false,
})
export class VentaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ventas = inject(VentasService);
  private readonly vendedores = inject(VendedoresService);
  private readonly facturas = inject(FacturasService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly rol = inject(AuthService).getRol();

  readonly esCliente = this.rol === 'cliente';
  readonly esPersonal = this.rol === 'admin' || this.rol === 'vendedor';

  venta: Venta | null = null;
  /** La factura de la venta, cuando ya está facturada. */
  factura: Factura | null = null;
  cargando = true;
  error = '';
  procesando = false;

  get total(): number {
    return this.venta ? totalVenta(this.venta) : 0;
  }

  get rutaListado(): string {
    return '/ventas';
  }

  get puedeConcretar(): boolean {
    return this.esPersonal && this.venta?.estado === 'pendiente';
  }

  /** Se factura una venta concretada (vendedor o admin). */
  get puedeFacturar(): boolean {
    return this.esPersonal && this.venta?.estado === 'concretada';
  }

  get puedeEditar(): boolean {
    return this.esPersonal && this.venta?.estado === 'pendiente';
  }

  /** El personal cancela pendientes o concretadas; el cliente, solo sus pedidos pendientes. */
  get puedeCancelar(): boolean {
    const estado = this.venta?.estado;
    return this.esCliente ? estado === 'pendiente' : this.esPersonal && (estado === 'pendiente' || estado === 'concretada');
  }

  get pasos(): Paso[] {
    const v = this.venta;
    if (!v) return [];
    const orden = ['pendiente', 'concretada', 'facturada'];
    const indice = orden.indexOf(v.estado);
    const fecha = (f?: string | Date | null) => (f ? new Date(f).toLocaleDateString('es-AR') : '');
    const estadoDe = (i: number): Paso['estado'] => (i <= indice ? 'hecho' : i === indice + 1 ? 'actual' : 'futuro');
    return [
      { titulo: 'Pedido recibido', detalle: fecha(v.fechaContacto), estado: 'hecho' },
      {
        titulo: indice >= 1 ? 'Venta concretada' : 'Concretar venta',
        detalle: indice >= 1 ? fecha(v.fechaDeVenta) : 'Un vendedor confirma stock y precio',
        estado: estadoDe(1),
      },
      {
        titulo: indice >= 2 ? 'Facturada' : 'Facturar',
        detalle: indice >= 2 ? (this.factura?.numero ?? '') : indice === 1 ? 'Pendiente de facturar' : 'Disponible al concretar',
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
    this.ventas.getVenta(id).subscribe({
      next: ({ data }) => {
        this.venta = data;
        this.cargando = false;
        this.cargarFactura(data);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.status === 404
          ? 'La venta no existe o no tenés acceso a ella.'
          : mensajeDeErrorHttp(err, 'No se pudo cargar la venta.');
        this.cargando = false;
      },
    });
  }

  /** Si la venta ya está facturada, trae la factura para poder abrirla. Si falla, solo no se muestra el enlace. */
  private cargarFactura(venta: Venta): void {
    this.factura = null;
    if (venta.estado !== 'facturada') return;
    this.facturas.getFacturaDeVenta(venta._id).subscribe({
      next: ({ data }) => (this.factura = data),
      error: () => (this.factura = null),
    });
  }

  concretar(): void {
    const venta = this.venta;
    if (!venta) return;
    // El admin elige el vendedor; un vendedor concreta a su nombre
    const vendedores$: Observable<Vendedor[] | undefined> = this.rol === 'admin'
      ? this.vendedores.getVendedores().pipe(map((r) => r.data))
      : of(undefined);

    vendedores$.subscribe({
      next: (vendedores) => this.abrirDialogoConcretar(venta, vendedores),
      error: (err: HttpErrorResponse) => {
        // Sin la lista de vendedores el admin no puede elegir quién concreta: no se abre el diálogo vacío.
        // El 403 ya lo avisa el interceptor.
        if (err.status !== 403) this.notificaciones.error(mensajeDeErrorHttp(err, 'No se pudieron cargar los vendedores. Probá de nuevo.'));
      },
    });
  }

  private abrirDialogoConcretar(venta: Venta, vendedores: Vendedor[] | undefined): void {
    this.dialog
      .open<ConcretarVentaDialogComponent, unknown, ResultadoConcretar>(ConcretarVentaDialogComponent, {
        data: { venta, vendedores },
        width: '480px',
        maxWidth: '94vw',
        autoFocus: 'dialog',
        ariaLabelledBy: 'concretar-titulo',
      })
      .afterClosed()
      .subscribe((resultado) => {
        if (!resultado) return;
        this.ejecutar(this.ventas.concretar(venta._id, resultado), 'La venta fue concretada y se descontó el stock.');
      });
  }

  cancelar(): void {
    const venta = this.venta;
    if (!venta) return;
    const devuelveStock = venta.estado === 'concretada';
    this.confirmacion
      .confirmar({
        titulo: this.esCliente ? 'Cancelar pedido' : 'Cancelar venta',
        mensaje: devuelveStock
          ? 'La venta ya está concretada: al cancelarla, el stock de los productos vuelve al depósito. ¿Continuar?'
          : '¿Cancelar este pedido? No se puede deshacer.',
        textoConfirmar: this.esCliente ? 'Cancelar pedido' : 'Cancelar venta',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.ejecutar(this.ventas.cancelar(venta._id), devuelveStock ? 'Venta cancelada. El stock fue devuelto.' : 'Pedido cancelado.');
      });
  }

  /** CUU Realizar facturación: pide confirmación, emite la factura y deja la venta facturada. */
  facturar(): void {
    const venta = this.venta;
    if (!venta) return;
    this.confirmacion
      .confirmar({
        titulo: 'Facturar venta',
        mensaje: 'Se emite la factura de esta venta con IVA discriminado. Una vez facturada ya no se puede cancelar. ¿Continuar?',
        textoConfirmar: 'Facturar',
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.procesando = true;
        this.ventas.facturar(venta._id).subscribe({
          next: ({ data }) => {
            this.procesando = false;
            this.factura = data;
            this.venta = { ...venta, estado: 'facturada' };
            this.notificaciones.exito(`Se emitió la factura ${data.numero}.`);
          },
          error: (err: HttpErrorResponse) => {
            this.procesando = false;
            // 409: el backend explica el motivo (ej. "La venta ya está facturada"). El 403 ya lo avisa el interceptor.
            if (err.status !== 403) this.notificaciones.error(mensajeDeErrorHttp(err, 'No se pudo emitir la factura.'));
            if (err.status === 409) this.cargar();
          },
        });
      });
  }

  private ejecutar(accion$: Observable<RespuestaVenta>, mensaje: string): void {
    this.procesando = true;
    accion$.subscribe({
      next: ({ data, notificacion }) => {
        this.venta = data;
        this.procesando = false;
        this.notificaciones.exito(mensaje);
        // Qué pasó con el mail al cliente (si no salió, quien opera tiene que avisarle por otro medio)
        const aviso = avisoDeMail(notificacion);
        if (aviso) this.notificaciones[aviso.tipo](aviso.texto);
      },
      error: (err: HttpErrorResponse) => {
        this.procesando = false;
        // 409: el backend explica el motivo (ej. "Stock insuficiente: Tractor (pedido 2, disponible 1)").
        // El 403 ya lo avisa el interceptor.
        if (err.status !== 403) this.notificaciones.error(mensajeDeErrorHttp(err, 'No se pudo completar la operación.'));
        if (err.status === 409) this.cargar();
      },
    });
  }

  irAEditar(): void {
    if (this.venta) this.router.navigate(['/ventas/edit', this.venta._id]);
  }
}
