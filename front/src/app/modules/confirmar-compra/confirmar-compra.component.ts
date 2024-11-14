import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VentasService } from '../ventas/ventas.service.js';
import { ProductosService } from '../productos/producto.service.js';
import { Producto } from '../../shared/models/producto.model.js';
import { AuthService } from '../../shared/services/auth.service.js';
import { Venta } from '../../shared/models/venta.model.js';
import { Servicio } from '../../shared/models/servicio.model.js';
import { MatDialog } from '@angular/material/dialog';
import { WarningComponent } from '../../shared/components/warning/warning.component.js';

@Component({
  selector: 'app-confirmar-compra',
  templateUrl: './confirmar-compra.component.html',
  styleUrls: ['./confirmar-compra.component.css']
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
    private productosService: ProductosService,
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
      (error) => {
        console.error('Error al cargar el cliente:', error);
      }
    );
  }

  obtenerProductosSeleccionados(): void {
    this.productosSeleccionados = this.productosService.getProductosSeleccionados();
    this.cantidades = this.productosService.getCantidades();
  }

  calcularImporteTotal(): void {
    this.importeTotal = this.productosSeleccionados.reduce((total, producto) => {
      return total + (producto.importe_venta * this.cantidades[producto._id]);
    }, 0);
  }

  cancelar(): void {
    this.router.navigate(['/seleccion-productos']);
  }

  confirmarCompra() {
    const nuevaVenta = new Venta(
      'pendiente',
      new Date(),
      new Date(),
      new Date(),
      null,
      this.cliente,
      this.productosSeleccionados,
      this.serviciosSeleccionados  // Pasamos el objeto cliente completo
    );

    this.ventasService.crearVenta(nuevaVenta).subscribe({
      next: (response) => {
        console.log('Venta creada exitosamente:', response);
        const dialogRef = this.openWarningMessage('¡Su venta fue procesada exitosamente!', 'green');
        this.productosService.limpiarProductosSeleccionados();

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
