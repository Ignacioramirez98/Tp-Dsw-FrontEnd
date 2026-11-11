import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VentasService } from '../ventas/ventas.service.js';
import { CarritoService } from '../../shared/services/carrito.service';
import { Producto } from '../../shared/models/producto.model.js';
import { AuthService } from '../../shared/services/auth.service.js';
import { Venta } from '../../shared/models/venta.model.js';
import { Servicio } from '../../shared/models/servicio.model.js';
import { MatDialog } from '@angular/material/dialog';
import { WarningComponent } from '../../shared/components/warning/warning.component.js';

@Component({
    selector: 'app-confirmar-compra',
    templateUrl: './confirmar-compra.component.html',
    styleUrls: ['./confirmar-compra.component.css'],
    standalone: false
})
export class ConfirmarCompraComponent implements OnInit {
  cliente: any = null;  // Variable para almacenar el objeto completo del cliente
  productosSeleccionados: Producto[] = [];
  serviciosSeleccionados: Servicio[] = [];
  cantidades: { [id: string]: number } = {};
  importeTotal: number = 0;

  constructor(
    private router: Router,
    private ventasService: VentasService,
    private carrito: CarritoService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatosCliente();
    this.obtenerProductosSeleccionados();
    this.calcularImporteTotal();
  }

  cargarDatosCliente(): void {
    // Obtener el cliente completo desde el servicio de autenticación
    this.authService.obtenerCliente().subscribe(
      (response) => {
        this.cliente = response.data;  // Almacenar el objeto completo del cliente
      },
      () => {}
    );
  }

  obtenerProductosSeleccionados(): void {
    const items = this.carrito.items();
    this.productosSeleccionados = items.map((i) => i.producto);
    this.cantidades = Object.fromEntries(items.map((i) => [i.producto._id, i.cantidad]));
  }

  calcularImporteTotal(): void {
    this.importeTotal = this.carrito.total();
  }

  cancelar(): void {
    this.router.navigate(['/seleccion-productos']);
  }

  confirmarCompra() {
    const clienteId = this.authService.getClienteId();
    if (!clienteId) {
      this.openWarningMessage('No se pudo identificar al cliente autenticado.', 'red');
      return;
    }

    const productoIds = this.productosSeleccionados.map((producto) => producto._id);
    const servicioIds = this.serviciosSeleccionados.map((servicio) => servicio._id);

    const nuevaVenta = new Venta(
      'pendiente',
      new Date(),
      new Date(),
      new Date(),
      null,
      clienteId,
      productoIds,
      servicioIds
    );

    this.ventasService.crearVenta(nuevaVenta).subscribe({
      next: () => {
        const dialogRef = this.openWarningMessage('¡Su venta fue procesada exitosamente!', 'green');
        this.carrito.vaciar();

        setTimeout(() => {
          dialogRef.close();
          this.router.navigate(['/cliente-dashboard']);
        }, 500);
      },
      error: (error) => {
        const dialogRef = this.openWarningMessage('Hubo un error al procesar su venta. Intente nuevamente.', 'red');

        setTimeout(() => {
          dialogRef.close();
        }, 500);
      }
    });
  }

  openWarningMessage(message: string, color: string = 'red'): any {
    const dialogRef = this.dialog.open(WarningComponent, {
      data: { message: message, color: color },
      panelClass: 'warning-message'
    });

    return dialogRef;
  }
}
