import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Cliente } from '../../shared/models/cliente.model';
import { VentaPayload } from '../../shared/models/venta.model';
import { AuthService } from '../../shared/services/auth.service';
import { CarritoService } from '../../shared/services/carrito.service';
import { ConfirmacionService } from '../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../shared/ui/notificacion.service';
import { ProductosService } from '../productos/producto.service';
import { VentasService } from '../ventas/ventas.service';

/** Pantalla "Tu pedido": el cliente revisa las cantidades y envía el pedido, que queda pendiente. */
@Component({
  selector: 'app-confirmar-compra',
  templateUrl: './confirmar-compra.component.html',
  standalone: false,
})
export class ConfirmarCompraComponent implements OnInit {
  /** Público: la plantilla lee los productos, las cantidades y el total directamente. */
  readonly carrito = inject(CarritoService);
  private readonly ventas = inject(VentasService);
  private readonly productos = inject(ProductosService);
  private readonly auth = inject(AuthService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly router = inject(Router);

  cliente: Cliente | null = null;
  enviando = false;
  errorServidor = '';

  ngOnInit(): void {
    // Lo guardado en el navegador puede estar viejo: se ajusta al precio y stock de hoy
    this.productos.getProductos().subscribe({
      next: ({ data }) => {
        if (this.carrito.actualizarProductos(data)) {
          this.notificaciones.info('Actualizamos tu pedido: cambió el precio o el stock de algún producto.');
        }
      },
      // Sin conexión, el interceptor ya avisa; el pedido se muestra con lo último que se guardó
      error: () => {},
    });

    // obtenerCliente() lanza un error si no hay clienteId guardado, por eso se controla antes
    if (this.auth.getClienteId()) {
      this.auth.obtenerCliente().subscribe({
        next: (respuesta) => (this.cliente = respuesta.data),
        // Los datos del cliente son informativos: si no llegan, igual se puede enviar el pedido
        error: () => {},
      });
    }
  }

  /** Envía el pedido con las cantidades reales. El back toma el cliente del token y lo deja pendiente. */
  enviar(): void {
    if (this.enviando || this.carrito.unidades() === 0) return;
    this.enviando = true;
    this.errorServidor = '';

    const pedido: VentaPayload = {
      items: this.carrito.items().map((i) => ({ productoId: i.producto._id, cantidad: i.cantidad })),
    };

    this.ventas.crearVenta(pedido).subscribe({
      next: ({ data }) => {
        this.carrito.vaciar();
        this.notificaciones.exito('Enviamos tu pedido. Un vendedor se va a comunicar con vos para confirmarlo.');
        this.router.navigate(['/ventas', data._id]);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando = false;
        // Con status 0 el interceptor ya muestra el aviso de conexión
        this.errorServidor = err.status === 0
          ? 'No se pudo conectar con el servidor.'
          : err.error?.message ?? 'No se pudo enviar el pedido. Intentá de nuevo.';
      },
    });
  }

  vaciar(): void {
    this.confirmacion
      .confirmar({
        titulo: 'Vaciar pedido',
        mensaje: '¿Querés quitar todos los productos de tu pedido?',
        textoConfirmar: 'Vaciar',
        peligro: true,
      })
      .subscribe((confirmado) => {
        if (confirmado) this.carrito.vaciar();
      });
  }
}
